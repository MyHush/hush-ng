<template>
  <div>
    <div id="wallet-menu">
      <div class="menu-title">Wallet</div>
      <ul class="block-text chain-data">
        <li>Block height: <span class="chain-text">{{ blockHeight }}</span></li>
        <li>Peers: <span class="chain-text">{{ peerCount }}</span></li>
      </ul>
      <ul class="wallet-sections" v-for="(item, index) in walletSections">
        <li v-bind:class="{ active: item.active }" style="padding: 0px 10px 0px 10px;" v-on:click="toggle(index)"><router-link :to="item.path">{{ item.name }}</router-link></li>
      </ul>
    </div>
    <close-button></close-button>
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
          { 'name': 'addresses', 'path': '/wallet/addresses', 'active': true },
          { 'name': 'transactions', 'path': '/wallet/transactions', 'active': false }
        ],
        blockHeight: 0,
        peerCount: 0
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
          self.blockHeight = store.get('getInfo').blocks
          self.peerCount = store.get('getInfo').connections
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

  a {
    color: inherit; /* blue colors for links too */
    text-decoration: inherit; /* no underline */
  }

  div#wallet-menu {
    position: absolute;
    width: 100vw;
    background-color: #fff;
    padding: 10px 10px 10px 88.3px;
    border-bottom: 2px solid #e3e3e3;
    z-index: 1;
  }

  .menu-title {
    float: left;
    margin-top: 3px;
    font-size: 15pt;
    font-weight: 700;
    text-transform: uppercase;
  }

  .block-text {
    position: fixed;
    right: 40px;
    margin: 4px 15px 0px 0px;
  }

  .chain-data {
    float: right;
    margin-top: 4px;
    margin-right: 40px;
    font-size: 12pt;
    font-weight: 300;
    text-transform: uppercase;
    list-style-type: none;
  }

  .chain-data li {
    margin-left: 15px;
    display: inline;
  }

  .wallet-sections {
    float: left;
    margin-left: 30px;
    margin-top: -10px;
    margin-bottom: -11px;
    height: 56px;
    -webkit-app-region: no-drag;
  }

  .wallet-sections li {
    list-style-type: none;
    display: inline-block;
    font-size: 12pt;
    font-weight: 500;
    text-transform: uppercase;
    height: 100%;
    line-height: 56px;
    margin: 0px -15px 0px -15px;
  }

  .wallet-sections li:hover {
    cursor: pointer;
    background-color: #e2e2e2;
  }

  .wallet-sections .active {
    border-bottom: 4px solid #cacaca;
  }
</style>
