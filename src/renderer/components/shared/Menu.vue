<template>
  <div id="side-menu">
    <img id="logo" src="~@/assets/hush-icon-white.png" alt="HushNG Logo" />
    <div class="icons">
      <div :class="{active: item.active }" v-for="(item, index) in menuSections" >        
          <div class="icon"  v-on:click="x(index)" >
            <router-link :to="item.route">
              <img :src="item.path" style="font-color: #fff;" />              
            </router-link>
        </div>

      </div> 
    </div>       
  </div>
</template>

<script>

  export default {
    name: 'side-menu',
    components: {  },
    data () {
      return {
        menuSections: [
          { 'name': 'wallet', 'route': '/wallet/addresses', 'path' : '/static/icons/wallet.svg', 'active': true },
          { 'name': 'contacts', 'route': '/Contacts/contacts', 'path' : '/static/icons/addressbook.svg','active': false },
          { 'name': 'transactions', 'route': '/wallet/transactions', 'path' : '/static/icons/comment.svg','active': false },
        ]
      }
    },
    methods: { 
      x(item) {
        
        var self = this;
        var item  = item;
        for (var i = 0; i < self.menuSections.length; i++) {
          if (i == item) {
            self.menuSections[i].active = true
          } else {
            self.menuSections[i].active = false
          }
        }
      }
    },
    mounted: function() {
    
    }
  }
</script>

<style>
  div#side-menu {
    position: fixed;
    height: 100%;
    background-color: #3e3e3e;
    z-index: 2;
  }

  img#logo {
    height: 80px;
    padding: 15px;
  }

  .icons {    
    position: absolute;
    top: 120px;
    
    width: 100%;
  }

  .icons div {    
    text-align: center;
    padding: 0px 0px 10px 0px;
    margin:auto;
  }

  .icons .active {
    border-left: 3px solid #fff;
  }

  .icon {
    margin:auto;
    width: 25px;
  }


</style>
