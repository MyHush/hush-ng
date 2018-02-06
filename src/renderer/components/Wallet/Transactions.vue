<template>
  <div id="addresses">
    <p id="intro">
      Transactions can be sent<br />
      <span>from a Z-ADDR or T-ADDR depending on your preference</span>
    </p>
    
    <div class="address-list" id="z-addr">
      <div class="type">Create a transaction</div>
      <div class="copy">Spendable Balance: <span>{{ availableBalance }}</span></div>

      <ul class="address-details">
        <li v-for="address in zAddresses">
          <div class="balance" style="clear: both;">{{ address.balance }}</div>
          <div class="address" v-on:click="copy(address.address)">{{ address.address }}</div>
        </li>
      </ul>
      <div class="property">
        <label>Destination address</label>
        <input type="text" v-model="destinationAddress" > 
      </div>
      <div class="property">
        <label>Amount </label>
        <input type="number" v-model="amount" > HUSH
      </div>
      <div class="property">
        <label>Fee </label>
        <input type="number" v-model="fee"> HUSH
       </div>
      <a class="button" id="generate-address">send</a>
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
  import { mapState,mapGetters, mapActions } from 'vuex'
  import CloseButton from '../shared/CloseButton'

  const Repeat = require('repeat')
  var store = require('store')

  export default {
    name: 'transactions',
    components: { CloseButton },
    data () {
      return {
        destinationAddress: null,
        amount: 0.0,
        fee: 0.0
      }
    },
    computed:{
      ...mapState([
        'zAddresses',       
        'transactions',
        'availableBalance',  
      ]),        
         // mix the getters into computed with object spread operator
      ...mapGetters([
        'tAddresses',
      ])           
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

      }
      
    },
    mounted: function() {
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

  .property {
    display:block;
  }
  .property label {
    display:inline;
    min-width: 250px;
    width:120pc;
  } 
</style>
