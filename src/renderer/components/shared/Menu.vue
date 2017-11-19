<template>
  <div id="side-menu">
    <img id="logo" src="~@/assets/hush-icon-white.png" alt="HushNG Logo" />
    <ul class="icons">
      <li class="active"><img class="icon" src="~@/assets/icons/wallet.png" style="font-color: #fff;" /></li>
      <li><img class="icon" src="~@/assets/icons/comment.png" style="font-color: #fff;" /></li>
    </ul>
  </div>
</template>

<script>

  export default {
    name: 'side-menu',
    components: {  },
    data () {
      return {

      }
    }
  }
</script>

<style>
  div#side-menu {
    position: absolute;
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
    list-style-type: none;
    width: 100%;
  }

  .icons li {
    text-align: center;
    margin: 20px 0px 20px 0px;
  }

  .icons .active {
    border-left: 4px solid #fff;
  }

  .icons .active .icon {
    margin-left: -4px;
  }

  .icon {
    width: 25px;
  }


</style>
