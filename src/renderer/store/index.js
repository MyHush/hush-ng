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
    transactions: [],
    totalBalance: 0.0,
    unconfirmedBalance: 0.0,
    availableBalance: 0.0,
    tBalance: 0.0,
    zBalance: 0.0,
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
        address: "t123...",
        nickName:"Alice"
      },
      {
        address: "t143...",
        nickName:"Bob"
      },
    ],
    groupedDestinationAddresses:[]
  },
  getters: {   
    tAddresses: state => {
      return state.addresses.filter(address => address.type == 't')
    },
    zAddresses: state => {
      return state.addresses.filter(address => address.type == 'z')
    }
  },
  mutations: {
    addAddress (state, newAddress) {
      if(state.addresses.find( a => a.address == newAddress.address) == null) {
        state.addresses.push(newAddress)
      }
    }, 
    setBalance (state, b) {      
      state.addresses.find( a => a.address == b.address).balance = b.balance;
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
      state.transactions = transactions;
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

      // TODO: listunspent must be called to get all addresses
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
        client.cmd('z_getbalance',address.address, function(err, balance, resHeaders) {
         var taddr = address.address;
         console.log("balance of " + taddr + "=" + balance)
          var a = {
            address: address.address,
            balance: balance
          };
            commit('setBalance', a);
        });
      }

      client.cmd('z_gettotalbalance', function(err, data, resHeaders){
        console.log("getting total shielded balance, data=" + data)
        console.log(resHeaders);
        // err and data are null for a 500
        if (err) return console.log(err);
        if (data) {
            commit('setZBalance', data.private);
            console.log("setting zaddr balance");
            commit('setTBalance', data.transparent);
            console.log("setting taddr balance");
        }
      });

      client.getWalletInfo(function(err, data, resHeaders) {
        if (err) return console.log(err);
        if (data) {
            commit('setTotalBalance', data.balance);
            commit('setUnconfirmedBalance', data.unconfirmed_balance);
            commit('setAvailableBalance', data.balance - data.unconfirmed_balance);
        }
      });


      client.getInfo(function(err, data, resHeaders) {
        if (err) {
          commit('setPeerCount', '0');
          commit('setBlockheight', 'Syncing...');
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
      console.log("finished refreshing transactions");
    },

    addTAddress({ commit }) {
      console.log("adding taddr");
      var client = new bitcoin.Client({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });

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
        if (err) return console.log(err);              
        var operationids =[data.toString()];
        client.cmd( 'z_getoperationstatus', operationids , function(err, opData, resHeaders) {
          console.log(opData);
          if (err || opData[0].status == "failed") {
            console.log()
            vue.$message.error(opData[0].error.message);
            return 
          }
                 
          if( opData[0].status == "success") {
            vue.$message.success('Transaction was created successfully. Transaction id is:' + opData[0].result.txid, 5000 );            
          }          
        });
      });   
    }
         
  }
})
