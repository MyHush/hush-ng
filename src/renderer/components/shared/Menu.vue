<template>
  <div id="side-menu">
    <img id="logo" src="~@/assets/hush-icon-white.png" alt="HushNG Logo" />
        <ul class="icons menu-sections">
          <li v-for="(item, index) in menuSections" v-bind:class="{ active: index == activeItemIndex }" class="icon" v-on:click="switchTo(index);" >
            <img :src="item.path" style="font-color: #fff;" />
          </li>
        </ul>
  </div>
</template>

<script>
  export default {
    name: 'side-menu',
    components: {  },
    props: {
      isEnabled: {
        type: Boolean,
        default: true
      }
    },
    data () {      
      return {
        menuSections: [
          { 'name': 'wallet', 'route': '/wallet/Addresses', 'path' : '/static/icons/wallet.svg', 'active': true },
          { 'name': 'contacts', 'route': '/contacts/Addresses', 'path' : '/static/icons/addressbook.svg','active': false },
          { 'name': 'messenger', 'route': '/messenger', 'path' : '/static/icons/comment.svg','active': false },
        ],
        activeItemIndex : 0
      }
    },   
    methods: { 
      switchTo(item) {
        this.activeItemIndex = item;
        this.$router.push({path: this.menuSections[item].route});
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
    -webkit-app-region: drag;
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
