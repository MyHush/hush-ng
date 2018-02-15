const bitcoin = require('bitcoin')

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
      return state.operations.filter(op => op.status === 'queued' || op.status === 'executing')
                             .sort(function(a, b) {
                              return a.date < b.date; 
                            });
    },
    failedOperations: state => {
      return state.operations.filter(op => op.status === 'failed' )
                             .sort(function(a, b) {
                              return a.date < b.date; 
                            });
    }
  },
  mutations: {
    addOperation (state, newOperation) {
      if(state.operations.find( op => op.id == newOperation.id) == null) {
        state.operations.push({
            id : newOperation.id,
            status: newOperation.status,
            error : "",
            date: Date.now()
          }
        )
      }
    },
    updateOperationStatus (state, op) {
      var operation = this.state.operations.find( a => a.id == op.id)
      if(operation != null)  {        
        operation.status = op.status
        console.log(op);
      }
    },
    addAddress (state, newAddress) {
      if(state.addresses.find( a => a.address == newAddress.address) == null) {
        state.addresses.push(newAddress)
      }
    }, 
    setBalance (state, b) {      
      state.addresses.find( a => a.address == b.address).balance = b.balance;
    },
    setIsValid (state, b) {      
      state.addresses.find( a => a.address == b.address).isvalid = b.isvalid;
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
        return a.time < b.time; 
      });;
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
    refreshAddresses({ commit }) {
      console.log("scanning for addresses");

      var client = new bitcoin.Client({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });

      client.getAddressesByAccount('', function(err, data, resHeaders) {
        if (err) return console.log(err);
        console.log('t-addrs... Found: ' + data.length )
        for (var i = 0; i < data.length; i++) {
           commit('addAddress', {address: data[i], balance: 0, type: 't'});
        }
        commit("updateGroupedDestinationAddresses");
      });

      // Get Z-Addresses
      client.cmd('z_listaddresses', function(err, data, resHeaders){
        if (err) return console.log(err);
        console.log('z-addrs... Found: ' + data.length );
        for (var i = 0; i < data.length; i++) {
           commit('addAddress', {address: data[i], balance: 0, type: 'z'});
        }

        commit("updateGroupedDestinationAddresses");
      });     
    },    

    refreshBalances({ commit }) {
      console.log("updating address balances");
      var client = new bitcoin.Client({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });

      for (let address of this.state.addresses) {            
        client.cmd('z_getbalance',address.address,0, function(err, balance, resHeaders) {
          var a = {
            address: address.address,
            balance: balance
          };
          commit('setBalance', a);              
        });
      }

      //confirmed balance
      client.cmd('z_gettotalbalance', function(err, confirmedBalance, resHeaders){
        if (err) return console.log(err);
       
         //unconfirmed balance (conf= 0)
        client.cmd('z_gettotalbalance', 0, function(err, unconfirmedBalance, resHeaders){
          if (err) return console.log(err);
          commit('setZBalance', { balance: unconfirmedBalance.private, valid: confirmedBalance.private == unconfirmedBalance.private });        
          commit('setTBalance', { balance: unconfirmedBalance.transparent, valid: confirmedBalance.transparent == unconfirmedBalance.transparent });        
          commit('setTotalBalance', { balance: unconfirmedBalance.total, valid: confirmedBalance.total == unconfirmedBalance.total });   
        });
      });

      client.getWalletInfo(function(err, data, resHeaders) {
        if (err) return console.log(err);
        
        commit('setUnconfirmedBalance', data.unconfirmed_balance);   
        commit('setAvailableBalance', data.balance - data.unconfirmed_balance);   
      });

      client.getInfo(function(err, data, resHeaders) {
        if (err) {
          commit('setPeerCount', 'None');
          commit('setBlockheight', 'Scanning');
          return console.log(err);
        } 
        
        commit('setPeerCount', data.connections);
        commit('setBlockheight', data.blocks);
      }); 

    },

    refreshTransactions({ commit }) {
      console.log("refreshing transactions");

      var client = new bitcoin.Client({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });

      client.listTransactions(function(err, data, resHeaders) {
        if (err) return console.log(err);
        commit('setTransactions', data)
      });
    },     

    refreshOperations({ commit }) {
      console.log("refreshing transactions");

      var client = new bitcoin.Client({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });

      // removes failed, success, cancelled ops  after beeing called
      client.cmd('z_getoperationresult',function(err, data, resHeaders) {
        if (err) return console.log(err);
        for(let operationStatus of data) {
          commit('updateOperationStatus', operationStatus)
        } 
        
      });
    }, 

    refreshOperationStatus({ commit }) {
      console.log("refreshing pending operations");

      var client = new bitcoin.Client({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });

      client.cmd('z_getoperationstatus',function(err, data, resHeaders) {
        if (err) return console.log(err);
        for(let operationStatus of data) {
          commit('updateOperationStatus', operationStatus)
        } 
        
      });
    },  
    addTAddress({ commit }) {
      var client = new bitcoin.Client({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });

      // Get T-Addresses
      client.getNewAddress('', function(err, data, resHeaders) {
        if (err) return console.log(err);      
        console.log(data);   
        commit('addAddress', {address: data, balance: 0, type: 't'});
      });
    },

    addZAddress({ commit }) {
      var client = new bitcoin.Client({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });

      // Get T-Addresses
      client.cmd('z_getnewaddress', function(err, data, resHeaders) {
        if (err) return console.log(err);      
        console.log(data);   
        commit('addAddress', {address: data, balance: 0, type: 'z'});
      });
    },
    sendToMany({ commit },transactionForm) {
      var self = this;
      var client = new bitcoin.Client({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });
     
      var receivers = [];         
      for(let receiver of transactionForm.destinationAddresses) {
        receivers.push({"address":receiver.toString(), "amount": transactionForm.amount});
      }       

      client.cmd( 'z_sendmany',transactionForm.from,receivers,1,transactionForm.fee , function(err, data, resHeaders) {
        if (err) {
          vue.$message.error(err.message);
          return ;              
        }
        else {
          var operationid =[data.toString()];

          client.cmd( 'z_getoperationstatus', operationid , function(err, opData, resHeaders) {
            console.log(opData);

            if (err || opData[0].status == "failed") {
              vue.$message.error(opData[0].error.message);
              return 
            }

            if( opData[0].status === "cancelled") {
              vue.$message.warning('Operation was cancelled.', 5000 );            
            }

            if( opData[0].status === "queued") {
              vue.$message.warning('Operation was queued. Check the pending operation list for further information', 5000 );     
              commit("addOperation",opData[0])       
              
            }

            if( opData[0].status === "executing") {
              vue.$message.warning('Operation is executing. Check the pending operation list for further information', 5000 );    
              commit("addOperation",opData[0])           
            }
                  
            if( opData[0].status === "success" ) {
              vue.$message.success('Transaction was created successfully. Transaction id is:' + opData[0].result.txid, 5000 );            
            }          
        });
      }
      });   
    }
         
  }
})
