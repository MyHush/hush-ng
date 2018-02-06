<template>
  <div>
    <div id="addressbook-menu">
      <div class="menu-title">Addressbook</div>
      <ul class="block-text chain-data">
        <li>Block height: <span class="chain-text">{{ blockHeight }}</span></li>
        <li>Peers: <span class="chain-text">{{ peerCount }}</span></li>
      </ul>
      <ul class="addressbook-sections" v-for="(item, index) in addressBookSections">
        <li v-bind:class="{ active: item.active }" style="padding: 0px 10px 0px 10px;" v-on:click="toggle(index)"><router-link :to="item.path">{{ item.name }}</router-link></li>
      </ul>
    </div>
    <close-button></close-button>
  </div>
</template>
<script>
  import CloseButton from '../shared/CloseButton'
  import { mapState,mapGetters, mapActions } from 'vuex'
  var store = require('store')

  export default {
    name: 'contacts-menu',
    components: { CloseButton },
    data () {
      return {
        addressBookSections: [
          { 'name': 'addresses', 'path': '/Contacts/Contacts', 'active': true },
          { 'name': 'groups', 'path': '/Contacts/Groups', 'active': false }
        ]
      }
    },
    computed:{
      ...mapState([       
        'blockHeight',
        'peerCount'
      ]),
    },
    methods: {
      toggle (item) {
        var self = this
        var item  = item
        for (var i = 0; i < self.addressBookSections.length; i++) {
          if (i == item) {
            self.addressBookSections[i].active = true
          } else {
            self.addressBookSections[i].active = false
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

  a {
    color: inherit; /* blue colors for links too */
    text-decoration: inherit; /* no underline */
  }

  div#addressbook-menu {
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

  .addressbook-sections {
    float: left;
    margin-left: 30px;
    margin-top: -10px;
    margin-bottom: -11px;
    height: 56px;
    -webkit-app-region: no-drag;
  }

  .addressbook-sections li {
    list-style-type: none;
    display: inline-block;
    font-size: 12pt;
    font-weight: 500;
    text-transform: uppercase;
    height: 100%;
    line-height: 56px;
    margin: 0px -15px 0px -15px;
  }

  .addressbook-sections li:hover {
    cursor: pointer;
    background-color: #e2e2e2;
  }

  .addressbook-sections .active {
    border-bottom: 4px solid #cacaca;
  }
</style>
