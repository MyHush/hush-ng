const bitcoin = require('bitcoin')
var hushrpc = require( 'hushrpc' ) ;

import Vue from 'vue'
import Vuex from 'vuex'

import modules from './modules'

Vue.use(Vuex)
let vue = new Vue()

export default new Vuex.Store({
  modules,
  strict: process.env.NODE_ENV !== 'production',
  state: {
    addresses: [],
    operations: [],
    transactions: [],
    transactionCount:0,
    totalBalance: { 
      balance :0, 
      valid :true
    },    
    tBalance: { 
      balance :0, 
      valid :true
    },
    zBalance: { 
      balance :0, 
      valid :true
    },
    unconfirmedBalance: 0,
    availableBalance :0,
    blockHeight: 'Scanning',
    peerCount: 'None',
    walletPolling: false,
    rpcCredentials : {
      user : "",
      password : "",
      port : 0
    },
    contacts:[
      {
        address: "DUMMY ADDRESS",
        nickName:"Cryptopia"
      },
      {
        address: "Bobs Address",
        nickName:"Bob"
      },
      {
        address: "Alice's Address",
        nickName:"Alice"
      }
    ],
    groupedDestinationAddresses:[]
  },
  getters: {   
    tAddresses: state => {
      return state.addresses.filter(address => address.type == 't')
    },
    zAddresses: state => {
      return state.addresses.filter(address => address.type == 'z')
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
    }
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
    setBlockheight (state, height) {      
      state.blockHeight = height;
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
        for (let item of zAddresses) {      
          commit('addAddress', {address: item, balance: 0, type: 'z', isConfirmed: false});
        }

        commit("updateGroupedDestinationAddresses");
      }
      catch(err) {
        console.log(err);
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
          var confirmeAddressBalance = await client.z_getbalance(address.address,1);
          var unconfirmedAddressBalance = await client.z_getbalance(address.address,0);

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
        console.log(err);
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
        commit('setPeerCount', 'None');
        commit('setBlockheight', 'Scanning');
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
          zTransactions.push( {
            category: "receive", 
            amount: zTransaction.amount,
            txid: zTransaction.txid,
            confirmations: zTransaction.confirmations,
            address:transactionResult.address,
            time: zTransaction.time
          })
        }
        commit('setTransactions',tTransactions.concat(zTransactions));
      }
      catch(err) {
        console.log(err);
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
        console.log(err);
      }
    }, 
 
    async addTAddress({ commit }) {
      var client = new hushrpc.Client({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });
      try {
        var result = await client.z_getnewaddress();
        commit('addAddress', {address: result, balance: 0, type: 't'});
      }
      catch(err) {
        console.log(err);
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
        console.log(err);
      }     
    }
         
  }
})
