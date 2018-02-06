<template>
  <div id="addresses">
    <p id="intro">
      Below is a list of your addresses<br />
      <span>Z-ADDRs are private while T-ADDRs are public</span>
    </p>
    
    <div class="address-list" id="z-addr">
      <div class="type">Z-ADDR</div>
      <div class="copy">click on an address to copy it</div>
      <a class="button" id="generate-address" v-on:click="addZAddress()">New address</a>
      <ul class="address-details">
        <li v-for="address in zAddresses">
          <div class="balance" style="clear: both;">{{ address.balance }}</div>
          <div class="address" v-on:click="copy(address.address)">{{ address.address }}</div>
        </li>
      </ul>
    </div>
    <div class="address-list" id="t-addr">
      <div class="type">T-ADDR </div>
      <div class="copy">click on an address to copy it</div>
      <a class="button" id="generate-address" v-on:click="addTAddress()">New address</a>
      <ul class="address-details">
        <li v-for="address in tAddresses" v-on:mouseover="mouseover(address)">
          <div class="balance" style="clear: both;">{{ address.balance }}</div>
          <div class="address" v-on:click="copy(address.address)">{{ address.address }}</div>
          <div class="smallButton" v-if="hoverAddress == address"> send cash</div>
        </li>
      </ul>
    </div>
    <div class="bottom-row">
      <div class="box">
        <ul id="texts">
          <li>T:</li>
          <li>Z:</li>
          <li>TOTAL:</li>
        </ul>
        <ul id="balances">
          <li>{{ tBalance }} HUSH</li>
          <li>{{ zBalance }} HUSH</li>
          <li>{{ totalBalance }} HUSH</li>
        </ul>
      </div>
      <div class="box alt">
        <p>For more on Z and T addresses, visit the following links:</p>
        <div class="links">
          <a @click="open('https://discord.gg/VfaZjyR')">MyHush.org</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  const Repeat = require('repeat')
  var request = require('request')
  var store = require('store')
  const bitcoin = require('bitcoin')
  import copy from 'copy-to-clipboard';
  import { mapState,mapGetters, mapActions } from 'vuex'

  export default { 
    name: 'addresses',
    components: {  },
    data() {
      return {
        polling :false,
        'hoverAddress': null
      }
    },
    computed:{
      ...mapState([       
        'tBalance',
        'zBalance',
        'totalBalance'
      ]),
      // mix the getters into computed with object spread operator
      ...mapGetters([
        'zAddresses',
        'tAddresses',
      ])
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      mouseover (address) {
        this.$data.hoverAddress = address;
      },
      ...mapActions([
        'addTAddress',
        'addZAddress', 
      ]),
      copy (value) {
        copy(value)
        alert('Copied ' + value + ' to clipboard.')
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

  #addresses {
    width: 100%;
  }

  #addresses #intro {
    float: left;
    font-weight: 500;
    font-size: 12pt;
    margin-left: 40px;
  }

  #addresses #intro span {
    position: relative;
    top: -5px;
    font-weight: 400;
    font-size: 10pt;
  }

  #addresses #generate-address {
    float: right;
    position: relative;
    top: 3px;
    font-weight: 500;
  }

  .address-list {
    clear: both;
    float: left;
    width: 100%;
    margin-top: 10px;
    padding: 15px 25px 15px 60px;
    background-color: #eaeaea;
    border-radius: 11px;
  }

  .address-list .type {
    float: left;
    font-weight: 600;
    font-size: 12pt;
  }

  .address-list .copy {
    float: left;
    margin-left: 88px;
    font-weight: 400;
    font-size: 11pt;
    color: #5e5e5e;
  }

  .address-list .address-details {
    clear: left;
    float: left;
    margin-top: 20px;
    font-size: 11pt;
    list-style-type: none;
    width: 100%;
    padding: 10px 0px 10px 0px;
    overflow: auto;
    -webkit-app-region: no-drag;
  }

  .address-details .balance {
    width: 25px;
  }

  .address-list .address-details .address {
    position: static;
    margin-left: 120px;
    max-width: 80%;
    padding: 0px 5px 0px 5px;
    word-break: break-all;
    line-height: 11px;
    cursor: pointer;
    -webkit-app-region: no-drag;
    font-family: 'Courier', sans-serif;
  }

  .address-list .address-details .balance, .address-list .address-details .address  {
    float: left;
    font-weight: 300;
    color: #5e5e5e;
  }

  .button {
    font-size: 11pt;
    cursor: pointer;
    outline: none;
    padding: 5px 15px 5px 15px;
    border-radius: 4px;
    display: inline-block;
    color: #fff;
    background-color: #2F77F7;
    transition: all 0.15s ease;
    box-sizing: border-box;
    border: 1px solid #2F77F7;
    text-decoration: none;
    -webkit-app-region: no-drag;
  }

  .button:hover {
    background-color: #2262d6;
  }

  .button-alt {
    color: #3e3e3e;
    margin-right: 5px;
    background-color: transparent;
  }

  .button-alt:hover {
    background-color: #e2e2e2;
  }

  .smallButton {
    float: left;
    display:inline;
    font-size: 8pt;
    cursor: pointer;
    outline: none;
    padding: 1px 1px 1px 1px;
    border-radius: 2px;
    display: inline-block;
    color: #fff;
    background-color: #2F77F7;
    transition: all 0.15s ease;
    border: 1px solid #2F77F7;
    text-decoration: none;
    -webkit-app-region: no-drag;
  }
</style>
