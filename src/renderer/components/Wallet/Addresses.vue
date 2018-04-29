<template>
  <div>
      Below is a list of your addresses<br />
      <span>
<ul>
<li>
Shielded Addresses (zaddrs) preserve your privacy with encrypted transactions that do not leak metadata such as the amount or who is sending and receiving, and are ANONYMOUS . The receiver will have no way to respond unless you tell them how in the memo field.
</li>
<li>
Transparent addresses (taddrs) are PSEUDONYMOUS, like a pen name, and the transaction
information for them is publicly viewable and searchable.
</li>
</ul>

</span>
    <span>
    <a class="button" id="funding" v-on:click="fundHushFund()">Fund Your Hush Fund</a>
</span>
    <div class="container" >
      <el-row class="caption">
        <el-col :span="2" >zaddr</el-col>
        <el-col :span="18" class="copy" >click on an address to copy it</el-col>
<el-col :span="10">
<el-button round type=warning id="import-address" v-on:click="importZaddrDialog()">Import zaddr</el-button>
<el-button round type=success id="generate-address" v-on:click="addZAddress()">New zaddr</el-button>
</el-col>
      </el-row>
      <el-table :data="zAddresses" height="200" style="width: 100%" empty-text="None"  @row-click="copyToClipboard">
        <el-table-column prop="balance" label="Amount" width="140" nowrap> </el-table-column>
        <el-table-column prop="addressView" label="Address" width="*" class-name="address" > </el-table-column>        
      </el-table>        
    </div>
    <div class="container" >
      <el-row class="caption">
        <el-col :span="2" >taddr</el-col>
        <el-col :span="18" class="copy" >click on an address to copy it</el-col>
        <el-col :span="10" >
<el-button round type=warning class="import-address" v-on:click="importTaddrDialog()">Import taddr</el-button>
<el-button round type=success class="generate-address" v-on:click="addTAddress()">New taddr</el-button>

</el-col>
      </el-row>   
      <el-table :data="tAddresses" height="200" style="width: 100%" empty-text="None" @row-click="copyToClipboard">
        <el-table-column prop="balance" label="Amount" width="140" nowrap> </el-table-column>
		<el-table-column prop="addressView" label="Address" width="*" class-name="address" > </el-table-column>      
		</el-table>       

    </div>
    <div class="bottom-row">
      <div class="box alt">
        <ul id="texts">
          <li><icon class=fa-fw name=eye></icon>Transparent:</li>
          <li><icon class=fa-fw name=shield-alt></icon>Shielded:</li>
          <li><icon class=fa-fw name=balance-scale></icon>TOTAL:</li>
        </ul>
        <ul id="balances">
          <li v-bind:class="{ unconfirmed: !tBalance.valid }" > {{ tBalance.balance }} HUSH</li>
          <li v-bind:class="{ unconfirmed: !zBalance.valid }" > {{ zBalance.balance }} HUSH</li>
          <li v-bind:class="{ unconfirmed: !totalBalance.valid }"> {{ totalBalance.balance }} HUSH</li>
        </ul>
      </div>
        <div class="box alt">
            <b>Network Stats</b><br/>
            <icon name=download></icon>{{ totalBytesRecv }} bytes received<br/>
            <icon name=upload></icon>{{ totalBytesSent }} bytes sent<br/>
        </div>
        <div class="box alt">
            <icon name="brands/btc"></icon> {{ priceBTC }} BTC/HUSH<br/>
            <icon name="euro-sign"></icon> {{ priceEUR }} EUR/HUSH<br/>
            <icon name="dollar-sign"></icon> {{ priceUSD }} USD/HUSH<br/>
        </div>
      </div>

    <el-dialog title="Import Transparent Address" :visible.sync="importTaddrVisible" width="60%" >
      <el-form :model="importTaddrForm">
        <el-form-item label="Private Key (WIF)" label-width="100px">
          <el-input placeholder="Wallet Import Format, starting with 5, K or L" v-model="importTaddrForm.wif" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="importTaddrVisible = false">Cancel</el-button>
        <el-button type="primary" @click="importTaddress(importTaddrForm.wif,true)">Import</el-button>
      </span>
    </el-dialog>

    <el-dialog title="Import Shielded Address" :visible.sync="importZaddrVisible" width="60%" >
      <el-form :model="importZaddrForm">
        <el-form-item label="Private Key (WIF)" label-width="100px">
          <el-input placeholder="Wallet Import Format, starting with 5, K or L" v-model="importZaddrForm.wif" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="importZaddrVisible = false">Cancel</el-button>
        <el-button type="primary" @click="importZaddr">Import</el-button>
      </span>
    </el-dialog>

    </div>
</template>

<script>
  import { mapState,mapGetters, mapActions } from 'vuex'
  import copy from 'copy-to-clipboard';
  var store = require('store')

  export default { 
    name: 'addresses',
    components: {  },
    data() {
      return {
        polling :false,
        hoverAddress: null,
        importTaddrVisible: false,
        importTaddrForm: {
            wif: "",
        },
        importZaddrVisible: false,
        importZaddrForm: {
            wif: "",
        },
      }
    },

    computed:{
      ...mapState([
        'tBalance',
        'zBalance',
        'totalBalance',
        'totalBytesRecv',
        'totalBytesSent',
        'priceBTC',
        'priceEUR',
        'priceUSD',
      ]),     
      ...mapGetters([
        'zAddresses',
        'tAddresses',
        'lastUpdate',
      ])
    },

    methods: {
      mouseover (address) {
        this.$data.hoverAddress = address;
      },
      ...mapActions([
        'addTAddress',
        'addZAddress',
        'importTaddr',
      ]),
      copyToClipboard (row) {        
        copy(row.address)
        alert('Copied ' + row.address + ' to clipboard.')
      },     
      importTaddrDialog() {
          this.importTaddrVisible = true;
      },
      importZaddrDialog() {
          this.importZaddrVisible = true;
      },
      importTaddress(wif,rescan) {
        rescan = rescan ? true : false;
        this.$store.dispatch('importTaddr', wif, rescan);
      },
      importZaddr() {
          alert("TODO");
      },
    },

    mounted: function() {     
    }
  }
</script>

<style>

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

  .button {
    font-size: 12pt;
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

  .white {
    color: white !important;
    text-color: white !important;
  }

  .unconfirmed {
    color: red !important;
  }

</style>
