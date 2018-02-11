const bitcoin = require('bitcoin')
const hush = require('hush')

import Vue from 'vue'
import Vuex from 'vuex'

import modules from './modules'

Vue.use(Vuex)

export default new Vuex.Store({
  modules,
  strict: process.env.NODE_ENV !== 'production',
  state: {
    selectedMainMenuEntry: 'wallet',
    addresses: [],
    transactions: [],
    totalBalance: 0,
    unconfirmedBalance: 0,
    availableBalance :0,
    tBalance: 0,
    zBalance: 0,
    blockHeight: 'Scanning',
    peerCount:0,
    walletPolling: false,
    rpcCredentials : {
      user : "",
      password : "",
      port : 0
    },
    contacts:[
      {
        address: "tmXuXLx1KhaYoaWEsH15b91f9B79KwBt4qo",
        nickName:"Cryptopia"
      },
      {
        address: "ztDn7cf579FQ72ijdXSm5fuJirM4dJt2DzAtjZwZx1LAgkLrwVrG75VzDGi5GiZNzVtrKkXzr81LkcgtYvuqVVNQngrrZps",
        nickName:"Dukeleto"
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
    }
  },
  mutations: {
    setSelectedMainMenuEntry (state, name) {            
      state.selectedMainMenuEntry = name;
    },
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
          var a = {
            address: address.address,
            balance: balance
          };
          commit('setBalance', a);              
        });
      }

      client.cmd('z_gettotalbalance', function(err, data, resHeaders){
        if (err) return console.log(err);
        commit('setZBalance', data.private);        
        commit('setTBalance', data.transparent);        
      });

      client.getWalletInfo(function(err, data, resHeaders) {
        if (err) return console.log(err);
        commit('setTotalBalance', data.balance);   
        commit('setUnconfirmedBalance', data.unconfirmed_balance);   
        commit('setAvailableBalance', data.balance - data.unconfirmed_balance);   
      });


      client.getInfo(function(err, data, resHeaders) {
        if (err) return console.log(err);
        
        commit('setPeerCount', data.connections);
        commit('setBlockheight', data.blocks);
      }); 

    },

    refreshTransactions({ commit }) {
      console.log("scanning for addresses");

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

      var client = new hush.RpcClient({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });

      var receivers = [];         
      for(let receiver of transactionForm.destinationAddresses) {
        receivers.push({"address":receiver, "amount": transactionForm.amount});
      }       

       // ["t1gDpRTxxxxx",[{"address":"t1gDpRTxxxxxx","amount":0.01},..],#confs,#fee ]       
      var params = [];
      params.push(transactionForm.from);
      params.push(receivers);
      params.push(1); 
      params.push(transactionForm.fee);
    
      console.log(params);
      client.post( 'z_sendmany', params, function(err, data) {
        if (err != null) {
            console.log('Error: ' + e.message);
        } 
        else {
            console.log('Sent', data);

        }
        });      
    }
         
  }
})
