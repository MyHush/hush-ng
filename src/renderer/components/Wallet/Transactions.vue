<template>
  <div>
    <div id="wallet-menu">
      <div class="menu-title">Wallet</div>
      <ul class="wallet-sections" v-for="(item, index) in walletSections">
        <li v-bind:class="{ active: item.active }" style="padding: 0px 10px 0px 10px;" v-on:click="toggle(index)">{{ item.name }}</li>
      </ul>
    </div>
    <close-button></close-button>
  </div>
</template>

<script>
  import CloseButton from '../shared/CloseButton'

  export default {
    name: 'wallet-menu',
    components: { CloseButton },
    data () {
      return {
        walletSections: [
          { 'name': 'addresses', 'active': true },
          { 'name': 'transactions', 'active': false }
        ]
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

      }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Poppins:300,400,500,700');

  * {
    font-family: 'Poppins', sans-serif;
    color: #2d2d2d;
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
    font-size: 17pt;
    font-weight: 700;
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
