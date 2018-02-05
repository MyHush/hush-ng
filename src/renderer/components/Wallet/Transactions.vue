<template>
  <div id="addresses">
    <p id="intro">
      Transactions can be sent<br />
      <span>from a zaddr or taddr depending on your preference</span>
    </p>
    <a class="button" id="generate-address">New address</a>
    <div class="address-list" id="z-addr">
      <div class="type">Create a transaction</div>
      <div class="copy">Spendable Balance: <span>{{ balanceAvailable }}</span></div>
      <ul class="address-details">
        <li v-for="address in zAddresses">
          <div class="balance" style="clear: both;">{{ address.balance }}</div>
          <div class="address" v-on:click="copy(address.address)">{{ address.address }}</div>
        </li>
      </ul>
    </div>
    <div class="address-list" id="t-addr">
      <div class="type">Transaction History</div>
      <div class="copy">click on an address to copy it</div>
      <ul class="address-details">
        <li v-for="tx in transactions">
          {{ tx.category }} :::: {{ tx.amount }} :::: {{ tx.address }} :::: {{ tx.confirmations }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import CloseButton from '../shared/CloseButton'
  const Repeat = require('repeat')
  var store = require('store')

  export default {
    name: 'wallet-menu',
    components: { CloseButton },
    data () {
      return {
        walletSections: [
          { 'name': 'addresses', 'active': true },
          { 'name': 'transactions', 'active': false }
        ],
        balanceAvailable: store.get('getWalletInfo').balance - store.get('getWalletInfo').unconfirmed_balance,
        transactions: null
      }
    },
    methods: {
      toggle (item) {
        var self = this
        var item  = item
        for (var i = 0; i < self.walletSections.length; i++) {
          if (i == item) {
            self.walletSections[i].active = true
          } else {
            self.walletSections[i].active = false
          }
        }

      },
      startPolling (interval) {
        var self = this

        Repeat(function() {
          self.transactions = store.get('transactions')
        }).every(interval, 'ms').start.now();
      }
    },
    mounted: function() {
      this.startPolling(1000)
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Poppins:300,400,500,700');

  * {
    font-family: 'Poppins', sans-serif;
    color: #2d2d2d;
  }

  .address-list span {
    font-weight: 600;
    color: #2f77f7;
  }
</style>
