<template>
  <div>


  </div>
</template>

<script> 
  import copy from 'copy-to-clipboard';
  import { mapState,mapGetters, mapActions } from 'vuex'

  export default {
    name: 'addresses',
    components: {  },
    
    computed:{      
    },
    methods: {
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
    line-height: 12px;
    cursor: pointer;
    -webkit-app-region: no-drag;
  }

  .address-list .address-details .balance, .address-list .address-details .address  {
    float: left;
    font-weight: 400;
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
</style>
