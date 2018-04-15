const bitcoin = require('bitcoin')
const hushrpc = require('hushrpc')
const sprintf = require("sprintf-js").sprintf

import Vue from 'vue'
import Vuex from 'vuex'

import modules from './modules'
import hushlist from './modules/hushlist';
import os from 'os'
import fs from 'fs'
import axios from 'axios'

Vue.use(Vuex)
let vue = new Vue()

// TODO: GUI option for this and read from config file!
const privacy_mode       = 0;

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
    totalBytesRecv: '...',
    totalBytesSent: '...',
    priceBTC: '...',
    priceUSD: '...',
    totalBalance: { 
      balance :'Calculating...',
      valid :true
    },
    tBalance: { 
      balance : 'Calculating...',
      valid :true
    },
    zBalance: { 
      balance : 'Calculating...',
      valid :true
    },
    unconfirmedBalance: 0.0,
    availableBalance :0.0,
    blockHeight: 'Scanning...',
    magicString: '...',
    peerCount: 'Discovering...',
    walletPolling: false,
    rpcCredentials : {
      user : "",
      password : "",
      port : 0
    },
    lastUpdate: 0,
    contacts:[
      {
        id: 1,
        address: "zcQAMDJbgARwK5QqqXCoQX81iJoyf5sYqNF2dECHtAvhes1ss58hJdJ3TWAMBUZQSknMVo2S3xpu4KuCFYgfTK9FKdzBzY1",
        nickName:"Duke",
      }
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
		  address.balance     = b.balance;
		  address.isConfirmed = b.isConfirmed;
		  address.addressView = b.addressView;
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
    setLastUpdate (state, lastUpdate) {
      state.lastUpdate = lastUpdate;
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
    setPriceUSD (state, price) {
      state.priceUSD = price;
    },
    setPriceBTC (state, price) {
      state.priceBTC = price;
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
      console.log("searching for contact " + contact.id);
      var c = state.contacts.find( a => a.id == contact.id);
      console.log("found " + c.id);

      if (!contact.nickName) {
          vue.$message.error("Contacts must have a nickname");
          return;
      }
      if (!contact.address) {
          vue.$message.error("Contacts must have an address");
          return;
      }

      // TODO: support testnet and other chains
      if (!contact.address.match(/^zc[a-z0-9]{93}$/i) ) {
          vue.$message.error("Invalid address for contact");
          return;
      }

      if(c) {
          c.nickName = contact.nickName;
          c.address  = contact.address;
      } else {
          contact.id = Date.now();
          console.log("about to push contact");
          console.log(contact);
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
      //console.log("scanning for addresses");

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
	    if (privacy_mode) {
			var taddr = item.address.substring(0,8);
			commit('addAddress', {address: item.address, addressView: taddr, balance: '...', type: 't', isConfirmed: false});
		} else {
			commit('addAddress', {address: item.address, addressView: item.address, balance: '...', type: 't', isConfirmed: false});
		}
          }
        }

        var zAddresses = await client.z_listaddresses();
        //console.log('z-addrs... Found: ' + zAddresses.length );

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
      //console.log("updating address balances");
      var client = new hushrpc.Client({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });

      try {
        var confirmedBalance   = await client.z_gettotalbalance();
        var unconfirmedBalance = await client.z_gettotalbalance(0);

	var unconfirmedTotal   = unconfirmedBalance.total;
	//console.log(unconfirmedTotal);

	if (privacy_mode) {
		var tBalance = sprintf("%2.2f", (unconfirmedBalance.transparent / unconfirmedTotal) * 100);
		var zBalance = sprintf("%2.2f", (unconfirmedBalance.private     / unconfirmedTotal) * 100);
		commit('setZBalance',     { balance: zBalance + "%",     valid: confirmedBalance.private == unconfirmedBalance.private });
		commit('setTBalance',     { balance: tBalance + "%",  valid: confirmedBalance.transparent == unconfirmedBalance.transparent });
		commit('setTotalBalance', { balance: "...",     valid: confirmedBalance.total == unconfirmedBalance.total });
		commit('setAvailableBalance', "...");
	} else {
		commit('setZBalance',     { balance: unconfirmedBalance.private,     valid: confirmedBalance.private == unconfirmedBalance.private });        
		commit('setTBalance',     { balance: unconfirmedBalance.transparent, valid: confirmedBalance.transparent == unconfirmedBalance.transparent });        
		commit('setTotalBalance', { balance: unconfirmedBalance.total,       valid: confirmedBalance.total == unconfirmedBalance.total });   
		commit('setAvailableBalance', confirmedBalance.total);  
	}


        for (let address of this.state.addresses) {            
          var confirmeAddressBalance    = await client.z_getbalance(address.address,1);
          var unconfirmedAddressBalance = await client.z_getbalance(address.address,0);
          var taddr = address.address;
         //console.log("balance of " + taddr + "=" + confirmeAddressBalance)
         //console.log("unconfirmed balance of " + taddr + "=" + unconfirmedAddressBalance)

         // TODO: config setting for # of decimals
         var addrBalance = sprintf("%2.4f%%", unconfirmedAddressBalance / unconfirmedTotal * 100 );

          var a = {};
	      if(privacy_mode) {
	         //console.log(taddr);
		 a = {
		       address: taddr,
		       addressView:  taddr.substring(0,8) + "...",
		       balance: addrBalance,
		       isConfirmed : confirmeAddressBalance == unconfirmedAddressBalance
		     };
	      } else {
		  a = {
		       address: taddr,
		       addressView:  taddr,
		       balance: unconfirmedAddressBalance,
		       isConfirmed : confirmeAddressBalance == unconfirmedAddressBalance
		     };
	      }
          commit('setBalance', a);   
        }


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
        var data = await client.getNetworkInfo();
        commit('setMagicString', data.subversion);
      } catch(err) {
        commit('setMagicString', '...');
      }

      try {
        var now        = Date.now(); // This Is Now Now
        var interval   = 60; // seconds
        var lastUpdate = this.state.lastUpdate;
        var diff       = Math.abs(lastUpdate - now);
        // update stats roughly every minute instead of every 20s (polling period)
        // seconds like most of UI. We don't want to get banned
        // and a watched coin price doesn't moon.
       if ( diff > interval ) {
            axios.get("https://api.coinmarketcap.com/v1/ticker/hush/")
            .then(response => {
                // todo: better error checking
                // todo: support arbitrary fiat tickers supplied by user
                commit('setPriceUSD', response.data[0].price_usd);
                commit('setPriceBTC', response.data[0].price_btc);
                //console.log("Updated price stats lastUpdate=" + this.state.lastUpdate + " diff=" + diff );
            }).catch(e => {
                console.log("Error getting price stats!");
                console.log(e);
            })
        } else {
            console.log("skipping price check");
        }
      } catch(err) {
        // CMC not returning data should not be considered an import error
        commit('setPriceUSD', '?');
        commit('setPriceBTC', '?');
      }
    },

    async refreshTransactions({ commit }) {
      //console.log("refreshing transactions");
      var client = new hushrpc.Client({
        port: this.state.rpcCredentials.port,
        user: this.state.rpcCredentials.user,
        pass: this.state.rpcCredentials.password,
        timeout: 60000
      });

      try {
        var walletInfo = client.getWalletInfo();
        commit('setTransactionCount', walletInfo.txcount);

        var tTransactions = await client.listTransactions("",100,0);
        var allZTransactionResults=[];
        var zTransactions = [];

        for(let xtn of tTransactions) {
            //console.log(xtn);
            // Joinsplits do not have an address
            if (privacy_mode) {
				//console.log(xtn);
			 	if(xtn.address) {
					xtn.address = sprintf("%s...", xtn.address.substring(0,8) );
				}
				xtn.time    = 0;
            }
        }

        var zAddresses = this.state.addresses.filter(a => a.type === "z");
        for(let zAddress of zAddresses) {        
          var transactionResults = await client.z_listReceivedByAddress(zAddress.address,0);
          for(let xtn of transactionResults) {
            xtn.address = zAddress.address;
			//console.log(xtn);
            allZTransactionResults.push(xtn);
          }
        }

        for(let transactionResult of allZTransactionResults) {
          var zTransaction = await client.getTransaction(transactionResult.txid);
          var decodedText = "";
          if(!transactionResult.memo.startsWith('f60000')) {
            for (var j = 0; j < transactionResult.memo.length; j += 2) {
              var  str = transactionResult.memo.substring(j, j + 2);
              if (str != "00") {// Zero bytes are empty
                decodedText = decodedText + String.fromCharCode(parseInt(str, 16));               
              }
            }
          }
          var memo = null;
          if(decodedText.length > 0) {
            memo = decodedText;
            //console.log(memo);
          }
          var address = transactionResult.address;
		  var amount  = transactionResult.amount;
          if (privacy_mode) {
            address = sprintf("%s...", transactionResult.address.substring(0,8) );
		    amount  = sprintf("%.1f", amount);
          }

          zTransactions.push( {
            category: "receive",
            amount: amount,
            txid: zTransaction.txid,
            confirmations: zTransaction.confirmations,
            //address: transactionResult.address,
            //addressView: sprintf("%6s...", transactionResult.address),
            address: address,
            time: privacy_mode ? 0 : zTransaction.time,
            memo: memo
          })
        }
        commit('setTransactions',tTransactions.concat(zTransactions));
        //console.log("finished refreshing transactions");
      }
      catch(err) {
        if(err) console.log(err);
      }
    },     

    async refreshOperations({ commit }) {
      //console.log("refreshing operations");

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
        commit('addAddress', {address: result, balance: '...', type: 't'});
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
        commit('addAddress', {address: result, balance: '...', type: 'z'});
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

      function encodeMemo(memo) {
          var encoded_memo = "";
          if(memo) {
                  for (var j = 0; j < memo.length; j += 1) {
                    encoded_memo = encoded_memo + memo.charCodeAt(j).toString(16);
                  }
          }
          return encoded_memo;
	  }
      
      try {

      // TODO: support 1,0=1.0 notation
      if (transactionForm.amount >= 0) {
        // valid amount
      } else {
        var msg = "Amount must be number >= 0";
        vue.$message.error(msg);
        return;
      }

      var num_destinations   = transactionForm.destinationAddresses.length;
      var transaction_amount = transactionForm.amount * num_destinations;
      // This is 1% of total amount being sent, ignoring network fee
      var dev_fee            = 0.01 * transaction_amount;
      var receivers          = [{
        // Wallet Support Fee, the maintenance of development of this wallet depends on this!!! :)
        // Thanks For Supporting Hush-NG!
		"address": "zcU6yx5eUXqcDjeT5NJnhgEdVVrt2fCrdCGFGkWbNgcdq11XKUgsDjMErxUvnvFsSwAxXrGfaiqsY4L4gJ8RYmBfrEZvHLb",
        // 1% of zaddr xtns for sustainable wallet support, maintenance and development
		"amount":  dev_fee,
        // Feel free to modify this to send your feedback, if you are mucking about in the code :)
		"memo":    encodeMemo("Hush-NG Rocks!")
	  }];
	  var memo         = transactionForm.memo;
	  var encoded_memo = encodeMemo(memo);
      var total_amount = transactionForm.fee + dev_fee;

	  console.log("encoded memo " + memo + " to " + encoded_memo);

      if(!transactionForm.from) {
        vue.$message.error("You must choose a From address!")
        return;
      }

      if(!transactionForm.destinationAddresses.length) {
        vue.$message.error("You must have at least one recipient in your transaction!");
        return;
      }

      for(let receiver of transactionForm.destinationAddresses) {
        receivers.push({
            "address": receiver.toString(),
            "amount":  transactionForm.amount,
            "memo":    encoded_memo
        });
        // TODO: maybe support diff amounts to diff addresses?
        total_amount += transactionForm.amount;
      }

        var current_balance = await client.getBalance();
        if (current_balance >= total_amount) {
            // We have enough funds in wallet to make this transaction, woot!
            var result = await client.z_sendmany(transactionForm.from,receivers,1,transactionForm.fee);
            var msg    = "Transcation for total amount of " + total_amount + " HUSH queued successfully!";
            vue.$message.success(msg);
            console.log(result);
            commit('addOrUpdateOperationStatus', {id: result.toString(), status: "queued"});
        } else {
            // Not enough funds in wallet to make this transaction!
            var msg    = "Current wallet has " + current_balance + "\nbut " + total_amount;
            msg += " HUSH needed for this transaction!\n";
            msg += "You need " + (total_amount - current_balance) + " to make this transaction";
            vue.$message.error(msg);
        }
      }
      catch(err) {
        if(err) {
            console.log(err);
            console.log(receivers);
        }
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
      console.log("Detected platform " + platform );

      if (platform == "linux" || platform == "darwin") {
        contactsFile = os.homedir() + "/hush-ng/contacts.json";
      } else if(platform == "win32") {
        contactsFile = os.homedir() + "\\hush-ng\\contacts.json";
      }

      var data = '';
      var stream = fs.createWriteStream(contactsFile);
      stream.once('open', function(fd) {
        stream.write(JSON.stringify(self.state.contacts));
        stream.end();
      });
    }
  }
})
