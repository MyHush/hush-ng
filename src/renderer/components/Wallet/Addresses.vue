<template>
  <div>
      Below is a list of your addresses<br />
      <span>Z-ADDRs are private while T-ADDRs are public</span>
    <div class="container" >
      <el-row class="caption">
        <el-col :span="2" >Z-ADDR</el-col>
        <el-col :span="18" class="copy" >click on an address to copy it</el-col>
        <el-col :span="4"  ><a class="button" id="generate-address" v-on:click="addZAddress()">New address</a></el-col>
      </el-row>
      <el-table :data="zAddresses" height="200" style="width: 100%">
        <el-table-column prop="balance" label="Amount" width="100"> </el-table-column>
        <el-table-column prop="address" label="Address" width="*" class-name="address" > </el-table-column>        
      </el-table>        
    </div>
    <div class="container" >
      <el-row class="caption">
        <el-col :span="2" >T-ADDR</el-col>
        <el-col :span="18" class="copy" >click on an address to copy it</el-col>
        <el-col :span="4" ><a class="button" id="generate-address" v-on:click="addTAddress()">New address</a></el-col>
      </el-row>   
      <el-table :data="tAddresses" height="200" style="width: 100%">
        <el-table-column prop="balance" label="Amount" width="120" class-name="balance"> </el-table-column>
        <el-table-column prop="address" label="Address" width="*" class-name="address" > </el-table-column>      
      </el-table>       
    </div>
    <div class="bottom-row">
      <div class="box">
        <ul id="texts">
          <li>T:</li>
          <li>Z:</li>
          <li>TOTAL:</li>
        </ul>
        <ul id="balances">
          <li>{{ tBalance }} HUSH</li>
          <li>{{ zBalance }} HUSH</li>
          <li>{{ totalBalance }} HUSH</li>
        </ul>
      </div>
      <div class="box alt">
        <p>For more on Z and T addresses, visit the following links:</p>
        <div class="links">
          <a @click="open('https://discord.gg/DNGndGY')">MyHush.org</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  const Repeat = require('repeat')
  var request = require('request')
  var store = require('store')
  const bitcoin = require('bitcoin')
  import copy from 'copy-to-clipboard';
  import { mapState,mapGetters, mapActions } from 'vuex'

  export default { 
    name: 'addresses',
    components: {  },
    data() {
      return {
        polling :false,
        'hoverAddress': null
      }
    },
    computed:{
      ...mapState([       
        'tBalance',
        'zBalance',
        'totalBalance'
      ]),
      // mix the getters into computed with object spread operator
      ...mapGetters([
        'zAddresses',
        'tAddresses',
      ])
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      mouseover (address) {
        this.$data.hoverAddress = address;
      },
      ...mapActions([
        'addTAddress',
        'addZAddress', 
      ]),
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
  @import url('https://fonts.googleapis.com/css?family=Poppins:300,400,500,700');

  * {
    font-family: 'Poppins', sans-serif;
    color: #2d2d2d;
  }

 .container {    
    width: 100%;
    margin-top: 10px;
    padding: 15px 25px 15px 30px;
    background-color: #eaeaea;
    border-radius: 11px;
  }
  
  .caption {
    font-weight: 700;
    font-size: 12pt
  }
  
  .caption .balance {
    font-weight: 400;
  }

  .caption span {
    font-weight: 400;
    color: #2f77f7;
  }

  .intro {
    font-weight: 400;
    font-size: 10pt
  }
  .copy {    
    font-weight: 400;
    font-size: 11pt;
    color: #5e5e5e;
  }

  .el-table__row .address .cell {
    font-family: 'Courier', sans-serif;
  }

  .el-table__row .balance .cell {
    font-family: 'Courier', sans-serif;
    color: #2f77f7;
  }

  .el-table td, .el-table th {
    padding: 4px 0;
  }

  .el-table__body-wrapper, .el-table__footer-wrapper, .el-table__header-wrapper {
    background-color:#eaeaea;
  }

  el-table__body, .el-table__footer, .el-table__header {    
      background-color:#eaeaea;
  }

  .el-table .gutter {
        background-color:#eaeaea;
  }

  .el-table td, .el-table th.is-leaf {
      background-color:#eaeaea;
      border: none;
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
