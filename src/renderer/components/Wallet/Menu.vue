<template>
  <div>
    <div>
      <div id="wallet-menu">
        <div class="menu-title">{{$t('message.wallet')}}</div>
        <ul class="block-text chain-data">
          <li><span class="chain-text"> {{ magicString }}</span></li>
          <li>{{$t('message.block_height')}}: <span class="chain-text">{{ blockHeight }}</span></li>
          <li>{{$t('message.peers')}}: <span class="chain-text">{{ peerCount }}</span></li>
        </ul>
        <ul class="wallet-sections">
          <router-link v-for="(item, index) in walletSections" v-bind:class="{ active: item.active }" :key="item.id" style="padding: 0px 10px 0px 10px;" tag="li" :to="item.path" v-on:click.native="toggle(index);" >{{ item.name }}</router-link>
        </ul>
      </div>
      <close-button></close-button>
    </div>
    <div class="inner-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  import CloseButton  from '../shared/CloseButton'
  import Addresses    from './Addresses'
  import { mapState } from 'vuex'

  export default {
    name: 'wallet',
    components: { CloseButton, Addresses },
    computed: {
      ...mapState([
          'blockHeight',
          'magicString',
          'peerCount'
        ]),
    },
    data () {
      return {
        connStatus: 'Connecting...',
        connectedToDeamon: false,
        walletSections: [
          { 'name': this.$t('message.addresses'), 'path': '/wallet/addresses', 'active': true },
          { 'name': this.$t('message.transactions'), 'path': '/wallet/transactions', 'active': false }
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

<style scoped>

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
    position: absolute;
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
