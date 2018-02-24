<template>
  <div>
    <div>
      <div>
        <div id="wallet-menu">
          <div class="menu-title">Wallet</div>
          <ul class="block-text chain-data">
            <li>Block height: <span class="chain-text">{{ blockHeight }}</span></li>
            <li>Peers: <span class="chain-text">{{ peerCount }}</span></li>
          </ul>
          <ul class="wallet-sections">
            <router-link v-for="(item, index) in walletSections" v-bind:class="{ active: item.active }" :key="item.id" style="padding: 0px 10px 0px 10px;" tag="li" :to="item.path" v-on:click.native="toggle(index);" >{{ item.name }}</router-link>
          </ul>
        </div>
        <close-button></close-button>
      </div>
    </div>
    <div class="inner-content">
      <router-view></router-view>
    </div>
  </div>    
</template>

<script>
  import CloseButton from '../shared/CloseButton'
  import Addresses from './Addresses'
  import { mapState } from 'vuex'

 
  export default {
    name: 'wallet',
    components: { CloseButton, Addresses },
    computed: { 
      ...mapState([         
          'blockHeight',
          'peerCount'                
        ]), 
    },
    data () {
      return {
        connStatus: 'Connecting...',
        connectedToDeamon: false,
        walletSections: [
          { 'name': 'addresses', 'path': '/wallet/addresses', 'active': true },
          { 'name': 'transactions', 'path': '/wallet/transactions', 'active': false }
        ]
      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
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

  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    width: 100vw;
    padding: 0px;
  }

  #logo {
    float: left;
    height: 100px;
    margin-bottom: 40px;
    width: auto;
  }

  #logo-text {
    float: left;
    margin-left: 20px;
    line-height: 100px;
    font-size: 18pt;
    font-weight: bold;
  }

  main {
    clear: left;
    display: flex;
    justify-content: space-between;
  }

  main > div { flex-basis: 50%; }

  .left-side {
    display: flex;
    flex-direction: column;
  }

  .welcome {
    color: #555;
    font-size: 23px;
    margin-bottom: 10px;
  }

  .title {
    color: #2c3e50;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 6px;
  }

  .title.alt {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .install-list {
    color: #555;
    font-weight: initial;
    list-style-type: none;
    margin-bottom: 50px;
  }

  .intall-list li {
    color: #000;
    height: 20px;
  }

  .install-list li code {
    color: #3e3e3e;
    font-weight: bold;
  }

  .progress {
    float: left;
    width: 10px;
    height: 10px;
    margin-top: 6px;
    margin-right: 5px;
    border-radius: 50%;
    background-color: #d1d1d1;
  }

  #connecting {
    text-align: center;
    line-height: 80vh;
    font-size: 1.2em;
  }
  .pending {
    border: 2px solid #7ed35f;
    background-color: transparent;
  }

  .success {
    background-color: #7ed35f;
  }

  .error {
    background-color: #ef4049;
  }

  .doc .button {
    font-size: .9em;
    cursor: pointer;
    outline: none;
    padding: 0.75em 2em;
    border-radius: 2em;
    display: inline-block;
    color: #fff;
    background-color: #2F77F7;
    transition: all 0.15s ease;
    box-sizing: border-box;
    border: 1px solid #2F77F7;
    margin-top: 10px;
    text-decoration: none;
    -webkit-app-region: no-drag;
  }

  .doc .button:hover {
    background-color: #2262d6;
  }

  .doc .button-alt {
    color: #3e3e3e;
    margin-right: 5px;
    background-color: transparent;
  }

  .doc .button-alt:hover {
    background-color: #e2e2e2;
  }

  .inner-content {
    position: absolute;
    width: 100%;
    height: 100%;
    padding: 77px 20px 20px 88.3px;
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
  }

  .wallet-sections li:hover {
    cursor: pointer;
    background-color: #e2e2e2;
  }

  .wallet-sections .active {
    border-bottom: 4px solid #cacaca;
  }
</style>
