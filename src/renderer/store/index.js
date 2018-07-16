const bitcoin = require('bitcoin')
const hushrpc = require('hushrpc')
const sprintf = require("sprintf-js").sprintf
var hush      = require('hush')

import Vue from 'vue'
import Vuex from 'vuex'
  import VueI18n from 'vue-i18n'
    import messages from '../../lang/messages'
import ElementUI from 'element-ui';
import modules from './modules'
import hushlist from './modules/hushlist';
import os from 'os'
import fs from 'fs'
import axios from 'axios'
//import vuexI18n from 'vuex-i18n/dist/vuex-i18n.umd.js';

var config = new hush.Config()
var client = new hushrpc.Client({
    port: config.rpcport(),
    user: config.rpcuser(),
    pass: config.rpcpassword(),
    timeout: 60000
});
function log(msg) { console.log(msg) }
function encodeMemo(memo) {
    var encodedMemo = '';

    if (memo) {
        console.log("Encoding raw memo: '" + memo + "' length =" + memo.length);
        if(memo) {
            for (var j = 0; j < memo.length; j++) {
                encodedMemo = encodedMemo + sprintf("%02x",memo.charCodeAt(j) );
            }
        }
        console.log("Encoded memo length=" + encodedMemo.length);
   } else {
       return encodedMemo;
   }
}

//TODO: it would be nice to use this for binary memos as well, or maybe
// we need a decodeBinaryMemo
function decodeMemo(memo) {
    var decodedMemo = '';
    // empty and/or binary memos start with f6
    if(!memo.startsWith('f6')) {
        for (var j = 0; j < memo.length; j += 2) {
            var  str = memo.substring(j, j + 2);
            if (str != "00") {// Zero bytes are empty
                decodedMemo = decodedMemo + String.fromCharCode(parseInt(str, 16));
            }
        }
    }
    return decodedMemo;
}

Vue.use(Vuex)
Vue.use(VueI18n)

// Create VueI18n instance with options
//let localisation = navigator.language
let localisation = navigator.language.split("-")[0] // Use browser first language
const i18n = new VueI18n({
   fallbackLocale: 'en',
   locale: localisation,
   //dateTimeFormats,
   //numberFormats
   messages
})

let vue = new Vue({ i18n })


// TODO: GUI option for this and read from config file!
var privacy_mode       = 0;

//export default new Vuex.Store({
var store = new Vuex.Store({
  modules: {
    hushlist:hushlist
  },
  strict: process.env.NODE_ENV !== 'production',
  state: {
    client: '',
    addresses: [],
    operations: [],
    transactions: [],
    transactionCount:0,
    totalBytesRecv: '...',
    totalBytesSent: '...',
    priceBTC: '...',
    priceEUR: '...',
    priceUSD: '...',
    totalBalance: { 
      balance : i18n.t('message.calculating'),
      valid :true
    },
    tBalance: { 
      balance : i18n.t('message.calculating'),
      valid :true
    },
    zBalance: { 
      balance : i18n.t('message.calculating'),
      valid :true
    },
    unconfirmedBalance: 0.0,
    availableBalance :0.0,
    totalAmount: '...',
    blockHeight: i18n.t('message.scanning'),
    magicString: '...',
    peerCount: i18n.t('message.discovering'),
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
          vue.$message.warning(i18n.t('message.operation_is_executing'), 5000 );     
        }
              
        if (operation.status != op.status && op.status === "success" ) {
          vue.$message.success(i18n.t('message.transaction_was_created_successfully') + op.result.txid, 5000 );            
        }    

        operation.date = Date.now();
        operation.status = op.status;
        if(op.error) {
          operation.error = op.error.message;
        }

      } else {
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
    setTotalAmount (state, amount) {            
      state.totalAmount = amount;
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
    setPriceEUR (state, price) {
      state.priceEUR = price;
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
    setConfig (state, config) {      
      state.config = config;
    },
    addOrUpdateContact (state, contact) {
      console.log(contact);
      var c;

      // Only existing contacts have an id
      if (contact.id) {
        console.log("searching for contact " + contact.id);
        c = state.contacts.find( a => a.id == contact.id);
        if (c) {
            console.log("found " + c.id + ", name=" + c.nickName + ",zc=" + contact.conversationAddress);
        } else {
            console.log("could not find contact with id="+contact.id);
        }
      }



      if (!contact.nickName) {
          vue.$message.error(i18n.t('message.contacts_must_have_a_nickname'))
          return;
      }

      if (!contact.address) {
          vue.$message.error(i18n.t('message.contacts_must_have_an_address'));
          return;
      }

      // TODO: support testnet and other chains
      // TODO: Sapling address format might be different!
      if (!contact.address.match(/^zc[a-z0-9]{93}$/i) ) {
          vue.$message.error(i18n.t('message.invalid_address_for_contact'));
          return;
      }

      // Prevent adding new contacts with same address as existing contact
      if (contact.id) {
          log("Updating contact id="+contact.id);
      } else {
        var found = state.contacts.find( a => a.address == contact.address);
        if (found) {
            vue.$message.error(i18n.t('message.there_is_already_a_contact') + " : " + found.nickName + i18n.t('message.with_address') + " : " + found.address);
            return;
        }
      }

      if(c) {
          c.nickName            = contact.nickName;
          c.address             = contact.address;
          c.conversationAddress = contact.conversationAddress;
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
          commit('addAddress', {address: item, balance: '...', type: 'z', isConfirmed: false});
        }

        commit("updateGroupedDestinationAddresses");
      } catch(err) {
        if(err) console.log(err);
      }
    },    

    async refreshBalances({ commit }) {
      //console.log("updating address balances");

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
      //console.log("refreshing network stats");

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
            axios.get("https://api.coinmarketcap.com/v1/ticker/hush/?convert=EUR")
            .then(response => {
                // todo: better error checking
                // todo: support arbitrary fiat tickers supplied by user
                commit('setPriceUSD', sprintf("%.8f", response.data[0].price_usd) );
                commit('setPriceEUR', sprintf("%.8f", response.data[0].price_eur) );
                commit('setPriceBTC', sprintf("%.8f", response.data[0].price_btc) );
                //console.log("Updated price stats lastUpdate=" + this.state.lastUpdate + " diff=" + diff );
            }).catch(e => {
                console.log("Error getting price stats!");
                console.log(e);
            })
        } else {
            console.log("skipping price check");
        }
      } catch(err) {
        // CMC not returning data should not be considered an important error
        commit('setPriceUSD', '?');
        commit('setPriceEUR', '?');
        commit('setPriceBTC', '?');
      }
    },

    async refreshTransactions({ commit }) {
      //console.log("refreshing transactions");

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
          var decodedText = decodeMemo(transactionResult.memo);

          var memo = null;
          if(decodedText.length > 0) {
            memo = decodedText;
            console.log('memo=' + memo);
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

    async importZaddr({ commit }, wif, rescan, height) {
        try {
            //TODO: allow user to specify
            rescan = 'whenkeyisnew';
            height = 0;
            var result = await client.z_importkey(wif,rescan,height);
            vue.$message.success(i18n.t(message.imported_shielded_address_from_WIF));
        } catch (err) {
            console.log("params=" + wif + "," +  rescan + "," + height);
            console.log(err);
            alert(err);
        }
    },

    async importTaddr({ commit }, wif, rescan) {
        try {
            var label = "";
            rescan = true;
            var result = await client.importPrivKey(wif,label,rescan);
            vue.$message.success(i18n.t(message.imported_transparent_address_from_WIF));
        } catch (err) {
            console.log("params=" + wif + "," + label + "," + rescan);
            console.log(err);
            alert(err);
        }
    },
    async addTAddress({ commit }) {

      try {
        var result = await client.getNewAddress();
        console.log(result);
        commit('addAddress', {address: result, balance: '...', type: 't'});
        var msg = i18n.t(message.created_new_taddr) + " " + result;
        console.log(msg);
        vue.$message.success(msg);
      }
      catch(err) {
        if(err) console.log(err);
      }  
    },

    async addZAddress({ commit }) {

      try {
        var result = await client.z_getnewaddress();
        commit('addAddress', {address: result, balance: '...', type: 'z'});
        var msg = i18n.t(message.created_new_zaddr) + " " + result;
        console.log(msg);
        vue.$message.success(msg);
      }
      catch(err) {
        console.log(err);
      }
    },


    // We can expect this to timeout sometimes
    async importViewingKey({ commit }, viewkey) {
      var self = this;
      // Instead of storing viewkeys on disk, we look them up as needed
      try {
          // don't look thru all of time for HL VKs
          var height = 312632;
          var result = await client.z_importviewingkey(viewkey, "whenkeyisnew", height);
          log("Imported viewkey=" + viewkey);
          return 1;
      } catch(err) {
          log(err);
          vue.$notify.error({ title: i18n.t(message.error_importing_viewkey) + viewkey, message: err.message, duration: 0, showClose: true });
          return 0;
      }
    },

    async exportViewingKey({ commit }, chatForm) {
      var self = this;
      // Instead of storing viewkeys on disk, we look them up as needed
      // TODO: cache these in memory, as they never change for an address
      try {
          var result = await client.z_exportviewingkey(chatForm.conversationAddress);
          log("Retreived viewkey " + result);
          chatForm.conversationVK = result;
          log("chatForm.conversationVK = " + chatForm.conversationVK);
          return result;
      } catch(err) {
          log(err);
          vue.$notify.error({ title: i18n.t('message.error_retreiving_viewkey_for') + " " + chatForm.conversationAddress, message: err.message, duration: 0, showClose: true });
          return;
      }
    },

    async sendMemoToContact({ commit }, chatForm) {
      // If we send from our introducer zaddr z_i and have
      // contacts respond to our conversation zaddr z_c, we don't
      // need to store funds in every z_c
      var from           = "zcIntroducer";

      // Do we have a conversation address for this contact?
      if (chatForm.conversationAddress) {
          var VK = await store.dispatch('exportViewingKey',chatForm);
          log("VK=");
          log( VK.valueOf() );
          console.dir(VK);
      } else {
          // This is the first message to this contact, we need to create
          // a new local zaddr that will ONLY be used for this conversation
          chatForm.conversationAddress = await client.z_getnewaddress();
          log("Created new conversation zaddr " + chatForm.conversationAddress + " for " + chatForm.nickName);

          var VK = await store.dispatch('exportViewingKey',chatForm);
          log("VK=" + VK);

          // Update our contact info and add this address
          store.commit('addOrUpdateContact',chatForm);
          log("Updated contact " + chatForm.nickName );

          // Update contacts on disk
          store.dispatch('saveContacts');
      }

      var  hushListHeader = {
            addr:    chatForm.conversationAddress,
            viewkey: chatForm.conversationVK,
      };
      log(hushListHeader);
      var headerJSON  = JSON.stringify(hushListHeader);
      log(headerJSON);
      var JSONlength  = headerJSON.length;
      var remaining   = 512 - JSONlength;
      log("JSON header is " + JSONlength + ", with " + remaining + " remaining for memo data");
      var encodedMemo   = encodeMemo(chatForm.memo);
      var encodedHeader = encodeMemo(headerJSON);
      var memoLength    = chatForm.memo.length;

      // TODO: We need to keep track of Bobs *conversation* address
      // since that will be used instead of the public introducer
      // after the initial memo exchange
      var receivers = [
       {
          "address": chatForm.address,
          "memo":    encodedHeader,
          "amount":  0.0,
       },
       {
          "address": chatForm.address,
          "memo":    encodedMemo,
          "amount":  0.0,
       }
       //TODO: multipart HushList memos
      ];
      log("z_sendmany receivers=");
      log(receivers);
      var networkFee = 0.0001;
      var minConf    = 1;
      try {
        var result = await client.z_sendmany(from,receivers,minConf,networkFee);
      } catch(err) {
        //vue.$message.error(err);
        vue.$notify.error({ title: i18n.t('message.error_sending_memo'), message: err.message, duration: 0, showClose: true });
        console.dir(err);
        log(err);
      }
    },

    async sendToMany({ commit },transactionForm) {
      var self = this;

      try {

      var from;
      if(!transactionForm.from) {
        vue.$message.error(i18n.t('message.you_must_choose_a_from_address'))
        return;
      }
      from = transactionForm.from;
      log("Sending from address " + from);

      if(!transactionForm.destinationAddresses.length) {
        vue.$message.error(i18n.t('message.you_must_have_at_least_one_recipient_in_your_transaction'));
        return;
      }
      // TODO: support 1,0=1.0 notation
      // TODO: could use current circulating supply as max for xtn
      // amount must be between [0,21000000] and not NaN
      var MAX_MONEY = 21000000;
      if (transactionForm.amount >= 0 && (transactionForm.amount <= MAX_MONEY) && (transactionForm.amount == transactionForm.amount) ) {
        // valid amount
      } else {

        var msg = i18n.t('message.amount_must_be_number_valid') + " " + MAX_MONEY;
        vue.$message.error(msg);
        return;
      }

      // Does this xtn contain at least one zaddr?
      var shieldedXtn = 0;
      if (from.substr(0,1) == 'z' ) {
        shieldedXtn = 1;
      } else {
        for(let receiver of transactionForm.destinationAddresses) {
            var addr = receiver.toString();
            if(addr.substr(0,1) == 'z') {
                shieldedXtn = 1;
                break;
            }
        }
      }
      console.log("shieldedXtn=" + shieldedXtn);

      // The default amount is *no value*, not zero. Avoid NaNs
      transactionForm.amount = ( transactionForm.amount >= 0 ) ? parseFloat(transactionForm.amount) : '';
      var num_destinations   = transactionForm.destinationAddresses.length;
      var transaction_amount = transactionForm.amount * num_destinations;
      // 1% of total amount being sent SUGGESTED DEV FEE, ignoring network fee
      // with a max of 10HUSH, only on transactions containing zaddrs
      var dev_fee            = shieldedXtn ? 0.01 * transaction_amount : 0.0;
      if (dev_fee > 10.0) {
        dev_fee = 10.0; // maximum of 10 HUSH dev donation per xtn
      }
      console.log("transaction_amount="+transaction_amount+" dev_fee=" + dev_fee);

      var receivers          = shieldedXtn ? [{
        // Wallet Support Fee, the maintenance of development of this wallet depends on this!!! :)
        // Thanks For Supporting Hush-NG!
		"address": "zcU6yx5eUXqcDjeT5NJnhgEdVVrt2fCrdCGFGkWbNgcdq11XKUgsDjMErxUvnvFsSwAxXrGfaiqsY4L4gJ8RYmBfrEZvHLb",
        // 1% of zaddr xtns for sustainable wallet support, maintenance and development
        "amount":  sprintf("%.8f", dev_fee),
        // Feel free to modify this to send your feedback, if you are mucking about in the code :)
        "memo":    encodeMemo("Hush-NG Rocks!")
	  }] : [ ];
	  var memo         = transactionForm.memo;
	  var encoded_memo = encodeMemo(memo);
      var network_fee  = parseFloat(transactionForm.fee);
      var total_amount = transaction_amount + dev_fee + network_fee;

      console.log("total_amount=" + total_amount);
      console.log("encoded memo " + memo + " to " + encoded_memo);


      for(let receiver of transactionForm.destinationAddresses) {
       var addr              = receiver.toString();
       log("transactionForm.amount=" + transactionForm.amount);

       var transactionAmount = sprintf("%.8f", transactionForm.amount);
       log("transactionAmount=" + transactionAmount);

       // zaddrs get memos
       if ( addr.substring(0,1) == 'z' ) {
            if( encoded_memo ) {
                receivers.push({
                    "address": addr,
                    "amount":  transactionAmount,
                    "memo":    encoded_memo
                });
           } else {
                // memo="" is an error, so don't pass along empty memos
                receivers.push({
                    "address": addr,
                    "amount":  transactionAmount,
                });
           }
        } else {
            // taddr receivers have no memos
            receivers.push({
                "address": addr,
                "amount":  transactionAmount,
            });
        }
      }

        var current_balance = await client.getBalance();
        if (current_balance >= total_amount) {
            // We have enough funds in wallet to make this transaction, woot!
            log("Wallet has enough funds for transaction! current_balance=" + current_balance);
            log("About to z_sendmany(" + from + ",receivers,1," + transactionForm.fee + ")");
            var result = await client.z_sendmany(from,receivers,1,transactionForm.fee);
            //gilardh TODO : translate to optimize later if needed 
            var msg    = i18n.t('message.transaction_for_total_amount_of') + " " + total_amount + " " +  i18n.t('message.hush_queued_successfully');
            vue.$message.success(msg);
            console.log(msg);
            commit('addOrUpdateOperationStatus', {id: result.toString(), status: "queued"});
        } else {
            // Not enough funds in wallet to make this transaction!
            //gilardh TODO : translate to optimize later if needed 
            var msg  = i18n.t('message.current_wallet_has') + " " + current_balance + "\n" + i18n.t('message.but') + " " + total_amount;
            msg     += + " " + i18n.t('message.hush_needed_for_this_transaction') + "\n";
            msg     += i18n.t('message.you_need') + " " + (total_amount - current_balance) + " " + i18n.t('message.to_make_this_transaction');
            console.log(msg);
            vue.$message.error(msg);
        }
      } catch(err) {
        if(err) {
            console.log(err);
            vue.$message.error(i18n.t('message.oh_shite') + " " + err);
            console.log(receivers);
        }
      }
    },

    loadContacts({ commit }) {
      var platform     = os.platform();
      var contactsFile = os.homedir() + "/hush-ng/contacts.json";

      if(platform == "win32") {
        contactsFile = os.homedir() + "\\hush-ng\\contacts.json";
      }

      if (fs.existsSync(contactsFile)) {
        log("found contactsFile="+contactsFile);
        var data = '';
        var stream = fs.createReadStream(contactsFile)
        stream.on('data', function(chunk) {
          data += chunk;
        })
        .on('end', function() {
          var contacts = JSON.parse(data);
          commit("setContacts",contacts);
        });
      } else {
          log("contactsFile " + contactsFile + " not found!");
      }
    },

    loadConfig({ commit }) {
      var platform     = os.platform();
      var configFile = os.homedir() + "/hush-ng/config.json";

      if(platform == "win32") {
        configFile = os.homedir() + "\\hush-ng\\config.json";
      }

      if (fs.existsSync(configFile)) {
        log("found configFile="+configFile);
        var data = '';
        var stream = fs.createReadStream(configFile)
        stream.on('data', function(chunk) {
          data += chunk;
        })
        .on('end', function() {
          var config = JSON.parse(data);
          commit("setConfig",config);
        });
      } else {
          log("configFile " + configFile + " not found!");
      }
    },

    async zListReceivedByAddress({ commit }, addr,minconf) {
        var xtns = await client.z_listReceivedByAddress(addr,minconf);
        return xtns;
    },

    async renderChat({ commit }, contact) {
        log("renderChat");
        var self        = this;
        // TODO: load from config
        var zIntroducer = "zcQAMDJbgARwK5QqqXCoQX81iJoyf5sYqNF2dECHtAvhes1ss58hJdJ3TWAMBUZQSknMVo2S3xpu4KuCFYgfTK9FKdzBzY1";
        var config      = store.dispatch('loadConfig');
        log(config);

        var xtns;
        try {
            xtns = await client.z_listReceivedByAddress(zIntroducer, 0);
        } catch(err) {
          vue.$notify.error({ title: i18n.t('message.error_finding_previous_messages_for') + " " + contact.nickName, message: err.message, duration: 0, showClose: true });
          return;
        }

        for (let xtn of xtns) {
            // Look for HushList memo headers to our introducer
            var memo        = xtn.memo;
            var decodedMemo = decodeMemo(memo);
            var memoLength  = decodedMemo.length;
            // memo header is JSON and must start with a paren
            if (decodedMemo.substring(0,1) == "{") {
                log("Potential JSON memo=" + decodedMemo);

                var headerJSON;
                try {
                    headerJSON = JSON.parse(decodedMemo);
                    log("Valid JSON!");
                } catch(e) {
                    console.log(e);
                    continue;
                }
                // TODO: Key existence checks, i.e is it valid HushList JSON?
                // TODO: key names are not finalized, should we optimize for size or readability?
                var addr     = headerJSON["addr"];
                var viewkey  = headerJSON["viewkey"];
                // TODO: verify viewkey is the VK for addr
                var result   = await client.z_validateaddress(addr);
                if (result.isvalid) {
                    log("Valid HL.addr, ismine="+ result.ismine);
                    // Import this viewkey, so we can see memos *we send* to addr
                    var imported = store.dispatch('importViewingKey',viewkey);

                    if (imported) {
                        // It's imported or already was imported
                    } else {
                        log("Failed to import viewingkey, skipping");
                        continue;
                    }
                    // TODO: Render actual memos sent to this address, lol
                } else {
                    log("Address="+ addr + " is invalid zaddr");
                    continue;
                }
            } else {
                // TODO: what about completely anon HL messages, with no JSON?
                log("Skipping txid=" + xtn.txid + " since no HL memo header found");
            }
        }

    },

    saveContacts() {
      var self = this;
      var platform = os.platform();
      var contactsFile = null;
      //console.log("Detected platform " + platform );

      if (platform == "linux" || platform == "darwin") {
        contactsFile = os.homedir() + "/hush-ng/contacts.json";
      } else if(platform == "win32") {
        contactsFile = os.homedir() + "\\hush-ng\\contacts.json";
      }

      log("contactsFile=" + contactsFile);
      var data = '';
      var stream = fs.createWriteStream(contactsFile);
      stream.once('open', function(fd) {
        stream.write(JSON.stringify(self.state.contacts));
        stream.end();
      });
      log("Saved contacts to disk");
    }
  }
});
export default store;

// without return value (will use fallback translation, default translation or key)
//Vue.use(vuexI18n.plugin, store, {
//    moduleName: 'i18n',
//    onTranslationNotFound (locale, key) {
//        console.warn(`i18n :: Key '${key}' not found for locale '${locale}'`);
//    }}
//);

