<template>
  <div id="side-menu">
    <img id="logo" src="~@/assets/hush-icon-white.png" alt="HushNG Logo" />
    <ul class="icons menu-sections">
      <li v-for="(item, index) in menuSections" v-bind:class="{ active: item.active }" class="icon" v-on:click="x(index);" >{{ item.active }}<img :src="item.path" style="font-color: #fff;" /></li>
    </ul>
  </div>
</template>

<script>

  export default {
    name: 'side-menu',
    components: {  },
    data () {
      console.log("data wallet");
      return {
        menuSections: [
          { 'name': 'wallet', 'route': '/wallet/addresses', 'path' : '/static/icons/wallet.svg', 'active': true },
          { 'name': 'contacts', 'route': '/contacts/contacts', 'path' : '/static/icons/addressbook.svg','active': false },
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
            console.log("selectedIndex" + i) ;            
            self.menuSections[i].active = true
          } else {
            self.menuSections[i].active = false
          }
        }
        console.log(this.menuSections[item].route);
         this.$router.push({path:this.menuSections[item].route});
      }
    },
    mounted: function() {
     console.log("mounted menu");
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
    -webkit-app-region: no-drag;
  }

  .icon {
    margin:auto;
    width: 25px;
    padding: 12px 16px 8px 16px;
  }

  .menu-sections {
    -webkit-app-region: no-drag;
  }

  .menu-sections li {
    list-style-type: none;
    width: 100%;
    border-left: 3px solid transparent;
    border-right: 3px solid transparent;
  }

  .menu-sections .active {
    border-left: 3px solid #cacaca;
    border-right: 3px solid transparent;
  }
  
  .menu-sections li:hover {
    cursor: pointer;
    background-color: #9e9e9e;
  }


</style>
