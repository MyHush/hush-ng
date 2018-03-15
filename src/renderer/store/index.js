const bitcoin = require('bitcoin')
const hushrpc = require( 'hushrpc' ) ;

import Vue from 'vue'
import Vuex from 'vuex'

import modules from './modules'
import hushlist from './modules/hushlist';
import os from 'os'
import fs from 'fs'

Vue.use(Vuex)
let vue = new Vue()

export default new Vuex.Store({
  modules: {
    hushlist:hushlist
  },
  strict: process.env.NODE_ENV !== 'production',
  state: {
    addresses: [],
    operations: [],
    transactions: [],
    transactionCount:0,
    totalBytesRecv:0,
    totalBytesSent:0,
    totalBalance: { 
      balance :0.0, 
      valid :true
    },    
    tBalance: { 
      balance :0.0, 
      valid :true
    },
    zBalance: { 
      balance :0.0, 
      valid :true
    },
    unconfirmedBalance: 0.0,
    availableBalance :0.0,
    blockHeight: 'Scanning',
    magicString: '...',
    peerCount: 'None',
    walletPolling: false,
    rpcCredentials : {
      user : "",
      password : "",
      port : 0
    },
    contacts:[
      {
        id: 1,
        address: "t123...",
        nickName:"Alice"
      },
      {
        id: 2,
        address: "t143...",
        nickName:"Bob"
      },
    ],
    groupedDestinationAddresses:[]
  },
  getters: {  
    allAddresses: state => {
      return state.addresses.filter(address => true)
                            .sort(function(a, b) {
                              if( a.balance < b.balance) return 1;
                              if( a.balance > b.balance) return -1;
                              return 0
                            });
    }, 
    tAddresses: state => {
      return state.addresses.filter(address => address.type == 't')
                            .sort(function(a, b) {
                              if( a.balance < b.balance) return 1;
                              if( a.balance > b.balance) return -1;
                              return 0
                            });
    },
    zAddresses: state => {
      return state.addresses.filter(address => address.type == 'z')
                            .sort(function(a, b) {
                              if( a.balance < b.balance) return 1;
                              if( a.balance > b.balance) return -1;
                              return 0
                            });      
    },
    pendingOperations: state => {
      return state.operations.filter(op => op.status === 'queued' ||  op.status === 'executing')
                              .sort(function(a, b) {
                                if( a.date < b.date) return 1;
                                if( a.date > b.date) return -1;
                                return 0
                              });
    },
    failedOperations: state => {
      return state.operations.filter(op => op.status === 'failed' )
                              .sort(function(a, b) {
                                if( a.date < b.date) return 1;
                                if( a.date > b.date) return -1;
                                return 0
                              });
    },
    transactionsWithMemos: state  => address => {
      return state.transactions.filter(t  => t.address == address && t.memo != null);
    },
  },
  mutations: {    
    addOrUpdateOperationStatus (state, op) {
      var operation = this.state.operations.find( a => a.id == op.id)
      if(operation != null)  {        
        if (operation.status != op.status && op.status == "failed") {
          vue.$message.error(op.error.message);           
        }

        if (operation.status != op.status && op.status === "executing") {
          vue.$message.warning('Operation is executing. Check the pending operation list for further information', 5000 );     
        }
              
        if (operation.status != op.status && op.status === "success" ) {
          vue.$message.success('Transaction was created successfully. Transaction id is:' + op.result.txid, 5000 );            
        }    

        operation.date = Date.now();
        operation.status = op.status;
        if(op.error) {
          operation.error = op.error.message;
        }

      }
      else {       
        state.operations.push({
          id : op.id,
          status: op.status,
          error : "",
          date: Date.now()
        });
      }
    },
    clearFailedOperations (state) {
      //TODO Implement clearing of list
    },
    addAddress (state, newAddress) {
      if(state.addresses.find( a => a.address == newAddress.address) == null) {
        state.addresses.push(newAddress)
      }
    }, 
    setBalance (state, b) {      
      var address = state.addresses.find( a => a.address == b.address);
      if(address) {
        address.balance = b.balance;
        address.isConfirmed = b.isConfirmed;
      }
    },  
    setTotalBalance (state, b) {            
      state.totalBalance = b;
    },    
    setUnconfirmedBalance (state, b) {            
      state.unconfirmedBalance = b;
    },    
    setAvailableBalance (state, b) {            
      state.availableBalance = b;
    },
    setTBalance (state, b) {            
      state.tBalance = b;
    },  
    setZBalance (state, b) {      
      state.zBalance = b;
    },
    setPeerCount (state, peerCount) {
      state.peerCount = peerCount;
    },
    setTotalBytesRecv (state, bytes) {
      state.totalBytesRecv = bytes;
    },
    setTotalBytesSent (state, bytes) {
      state.totalBytesSent = bytes;
    },
    setBlockheight (state, height) {
      state.blockHeight = height;
    },
    setMagicString (state, string) {
      state.magicString = string;
    },
    setTransactions (state, transactions) {      
      state.transactions = transactions.sort(function(a, b) {
        if( a.time < b.time) return 1;
        if( a.time > b.time) return -1;
        if(a.category == "send" && b.category == "receive") return 1;  
        if(a.category == "receive" && b.category == "send") return -1;  
        return 0
      });
    },

    addZTransaction (state, transaction) {      
      state.transactions.push(transaction); 
    },

    setTransactionCount (state, count) {      
      state.transactionCount = count;
    },
    setWalletPolling (state, flag) {      
      state.walletPolling = flag;
    }, 
    setRpcCredentials (state, credentials) {      
      state.rpcCredentials = credentials;
    },
    setContacts (state, contacts) {      
      state.contacts = contacts;
    },
    addOrUpdateContact (state, contact) {
      var c = state.contacts.find( a => a.id == contact.id) 
     
      if(c) {
        c.nickName = contact.nickName;
        c.address = contact.address;
      }
      else {
        contact.id = Date.now();
        state.contacts.push(contact)
      }
    },
    removeContact (state, contact) {
      var index = state.contacts.indexOf(contact);
      state.contacts.splice(index, 1);   
    },
    updateGroupedDestinationAddresses (state) {      
      var groups = [];
      var ownAddresses = {
        label: "Own addresses",
        addresses : []
      };

      var contacts = {
        label: "contacts",
        addresses : []
      };

      for (let contact of state.contacts) {
        contacts.addresses.push(contact);
      }

      for (let address of state.addresses) {
        ownAddresses.addresses.push(address);
      }
      groups.push(contacts);
      groups.push(ownAddresses);

      state.groupedDestinationAddresses = groups;
    }
  },
  actions : {
    async refreshAddresses({ commit }) {
      console.log("scanning for addresses");

      var client = new hushrpc.Client({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });
      try {
        var tAddresses = await client.listReceivedByAddress(0,true);
        var unspentUTXOs = await client.listUnspent();

        for (let item of tAddresses.concat(unspentUTXOs)) {       
          var result = await client.validateAddress(item.address);
          if(result.isvalid && !result.iswatchonly ) {
            commit('addAddress', {address: item.address, balance: 0, type: 't', isConfirmed: false});
          }
        }

        var zAddresses = await client.z_listaddresses();
        console.log('z-addrs... Found: ' + zAddresses.length );

        for (let item of zAddresses) {
          commit('addAddress', {address: item, balance: 0, type: 'z', isConfirmed: false});
        }

        commit("updateGroupedDestinationAddresses");
      }
      catch(err) {
        if(err) console.log(err);
      }
    },    

    async refreshBalances({ commit }) {
      console.log("updating address balances");
      var client = new hushrpc.Client({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });
      try {
        for (let address of this.state.addresses) {            
          var confirmeAddressBalance    = await client.z_getbalance(address.address,1);
          var unconfirmedAddressBalance = await client.z_getbalance(address.address,0);

         var taddr = address.address;
         //console.log("balance of " + taddr + "=" + confirmeAddressBalance)
         //console.log("unconfirmed balance of " + taddr + "=" + unconfirmedAddressBalance)

          var a = {
            address: address.address,
            balance: unconfirmedAddressBalance,
            isConfirmed : confirmeAddressBalance == unconfirmedAddressBalance
          };
          commit('setBalance', a);   
        }

        var confirmedBalance = await client.z_gettotalbalance();
        var unconfirmedBalance = await client.z_gettotalbalance(0);
        
        commit('setZBalance', { balance: unconfirmedBalance.private, valid: confirmedBalance.private == unconfirmedBalance.private });        
        commit('setTBalance', { balance: unconfirmedBalance.transparent, valid: confirmedBalance.transparent == unconfirmedBalance.transparent });        
        commit('setTotalBalance', { balance: unconfirmedBalance.total, valid: confirmedBalance.total == unconfirmedBalance.total });   
        commit('setAvailableBalance', confirmedBalance.total);  
      }
      catch(err) { 
        if(err) console.log(err);
      }
    },

    async refreshNetworkStats({ commit }) {
      
      var client = new hushrpc.Client({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });

      try {
        var data = await client.getInfo();
        commit('setPeerCount', data.connections);
        commit('setBlockheight', data.blocks);

      } catch(err) {
        commit('setPeerCount', '0');
        commit('setBlockheight', 'Scanning');
      }

      try {
        var data = await client.getNetTotals();
        commit('setTotalBytesRecv', data.totalbytesrecv);
        commit('setTotalBytesSent', data.totalbytessent);

      } catch(err) {
        commit('setPeerCount', '0');
        commit('setBlockheight', 'Scanning');
      }

      try {
        var data = await client.getNetworkInfo()
        commit('setMagicString', data.subversion);

      } catch(err) {
        commit('setMagicString', '...');
      }
    },

    async refreshTransactions({ commit }) {
      console.log("refreshing transactions");
      var client = new hushrpc.Client({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });

      try {
        var walletInfo = client.getWalletInfo();
        commit('setTransactionCount', walletInfo.txcount);

        var tTransactions = await  client.listTransactions("",100,0);
        var allZTransactionResults=[];
        var zTransactions= [];

        var zAddresses = this.state.addresses.filter(a => a.type === "z");
        for(let zAddress of zAddresses) {        
          var transactionResults = await client.z_listReceivedByAddress(zAddress.address,0);
          for(let transactionResult of transactionResults) {
            transactionResult.address = zAddress.address;
            allZTransactionResults.push(transactionResult);
          }
        }

        for(let transactionResult of allZTransactionResults) {
          var zTransaction = await client.getTransaction(transactionResult.txid);
          var decodedText = "";
          if(!transactionResult.memo.startsWith('f60000')) {
            for (var j = 0; j < transactionResult.memo.length; j += 2) {
              var  str = transactionResult.memo.substring(j, j + 2);
              if (!str == "00") {// Zero bytes are empty
                decodedText = decodedText + String.fromCharCode(parseInt(str, 16));               
              }
            }
          }
          var memo = null;
          if(decodedText.length > 0) {
            memo = decodedText
          }
          console.log(memo);
          zTransactions.push( {
            category: "receive", 
            amount: zTransaction.amount,
            txid: zTransaction.txid,
            confirmations: zTransaction.confirmations,
            address:transactionResult.address,
            time: zTransaction.time,
            memo: memo
          })
        }
        commit('setTransactions',tTransactions.concat(zTransactions));
        console.log("finished refreshing transactions");
      }
      catch(err) {
        if(err) console.log(err);
      }
    },     

    async refreshOperations({ commit }) {
      console.log("refreshing operations");

      var client = new hushrpc.Client({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });

      try {      
        // removes failed, success, cancelled ops  after beeing called
        var operationStates = await client.z_getoperationresult();
        for(let operationStatus of operationStates) {
            commit('addOrUpdateOperationStatus', operationStatus)
        } 
      } 
      catch(err) {
        if(err) console.log(err);
      }
    }, 
 
    async addTAddress({ commit }) {
      console.log("adding taddr");
      
      var client = new hushrpc.Client({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });
      
      try {
        var result = await client.getNewAddress();
        console.log(result);
        commit('addAddress', {address: result, balance: 0, type: 't'});
      }
      catch(err) {
        if(err) console.log(err);
      }  
    },

    async addZAddress({ commit }) {
      var client = new bitcoin.Client({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });
      try {
        var result = await client.z_getnewaddress();
        commit('addAddress', {address: result, balance: 0, type: 'z'});
      }
      catch(err) {
        console.log(err);
      }     
    },

    async sendToMany({ commit },transactionForm) {
      var self = this;
      var client = new bitcoin.Client({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });
      
      try {
      var receivers = [];         
      for(let receiver of transactionForm.destinationAddresses) {
        receivers.push({"address":receiver.toString(), "amount": transactionForm.amount});
      }       

        var result = await client.z_sendmany(transactionForm.from,receivers,1,transactionForm.fee);
        vue.$message.success('Transaction queued successfully.' );         
        console.log(result);
        commit('addOrUpdateOperationStatus', {id: result.toString(), status: "queued"});           
      }
      catch(err) {
        if(err) console.log(err);
      }     
    },

    loadContacts({ commit }) {
      var platform = os.platform();
      var contactsFile = null;

      if (platform == "linux" || platform == "darwin") {                
        contactsFile = os.homedir() + "/hush-ng/contacts.json";
      }
      else if(platform == "win32") {
        contactsFile = os.homedir() + "\\hush-ng\\contacts.json";
      }

      if (fs.existsSync(contactsFile)) {
        var data = '';
        var stream = fs.createReadStream(contactsFile)       
        stream.on('data', function(chunk) {  
          data += chunk;
        })
        .on('end', function() {
          var contacts = JSON.parse(data);
          commit("setContacts",contacts);
        });
      }    
    },

    saveContacts() {
      var self = this;
      var platform = os.platform();
      var contactsFile = null;
     
      if (platform == "linux" || platform == "darwin") {                
        contactsFile = os.homedir() + "/hush-ng/contacts.json";
      }
      else if(platform == "win32") {
        contactsFile = os.homedir() + "\\hush-ng\\contacts.json";
      }

      var data = '';
      var stream = fs.createWriteStream(contactsFile)  
        
      stream.once('open', function(fd) {
        stream.write(JSON.stringify(self.state.contacts));        
        stream.end();
      });
          
    }  
  }
})
