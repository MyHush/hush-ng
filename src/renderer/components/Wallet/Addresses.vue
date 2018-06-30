<template>
  <div>
      {{$t('intro_adresses_1')}}<br />
      <span>
</span>
    <div class="container" >
      <el-row class="caption">
<el-col :span="10">
<el-button round type=warning id="import-address" v-on:click="importZaddrDialog()">{{$t('import_zaddr')}}<icon name=angle-double-down></icon></el-button>
<el-button round type=success id="generate-address" v-on:click="addZAddress()">{{$t('new_zaddr')}}<icon name=plus></icon></el-button>
</el-col>
      </el-row>
      <el-table :data="zAddresses" height="200" style="width: 100%" empty-text="None"  @row-click="copyToClipboard">
        <el-table-column prop="balance" label={{$t('amount')}} width="140" nowrap> </el-table-column>
        <el-table-column prop="addressView" label={{$t('shielded_zaddr')}} width="*" class-name="zaddress" > </el-table-column>        
      </el-table>        
    </div>
    <div class="container" >
      <el-row class="caption">
        <el-col :span="10" >
<el-button round type=warning class="import-address" v-on:click="importTaddrDialog()">{{$t('import_taddr')}}<icon name=angle-double-down></icon></el-button>
<el-button round type=success class="generate-address" v-on:click="addTAddress()">{{$t('new_taddr')}}<icon name=plus></icon></el-button>

</el-col>
      </el-row>   
      <el-table :data="tAddresses" height="200" style="width: 100%" empty-text="None" @row-click="copyToClipboard">
        <el-table-column prop="balance" label={{$t('amount')}} width="140" nowrap> </el-table-column>
        <el-table-column  prop="addressView" label={{$t('shielded_taddr')}} width="*" class-name="taddress" > </el-table-column>      
        <icon name=copy></icon>
        </el-table>

    </div>
<div>
<ul>
<li>
{{$t('intro_adresses_2')}}
{{$t('intro_adresses_3')}}
{{$t('intro_adresses_4')}}
{{$t('intro_adresses_5')}}
</li>
<li>
{{$t('intro_adresses_6')}}
{{$t('intro_adresses_7')}}
{{$t('intro_adresses_8')}}
</li>
</ul>
    <span>
    <a class="button" id="funding" v-on:click="fundHushFund()">{{$t('fund_hush_fund')}}</a>
</span>

</div>
    <div class="bottom-row">
      <div class="box alt">
        <ul id="texts">
          <li><icon class=fa-fw name=eye></icon>{{$t('transparent')}}:</li>
          <li><icon class=fa-fw name=shield-alt></icon>{{$t('shielded')}}:</li>
          <li><icon class=fa-fw name=balance-scale></icon>{{$t('total')}}:</li>
        </ul>
        <ul id="balances">
          <li v-bind:class="{ unconfirmed: !tBalance.valid }" > {{ tBalance.balance }} HUSH</li>
          <li v-bind:class="{ unconfirmed: !zBalance.valid }" > {{ zBalance.balance }} HUSH</li>
          <li v-bind:class="{ unconfirmed: !totalBalance.valid }"> {{ totalBalance.balance }} HUSH</li>
        </ul>
      </div>
        <div class="box alt">
            <b>{{$t('network_stats')}}</b><br/>
            <icon name=download></icon>{{ totalBytesRecv }} {{$t('bytes_received')}}<br/>
            <icon name=upload></icon>{{ totalBytesSent }} {{$t('bytes_sent')}}<br/>
        </div>
        <div class="box alt">
            <icon name="brands/btc"></icon> {{ priceBTC }} BTC/HUSH<br/>
            <icon name="euro-sign"></icon> {{ priceEUR }} EUR/HUSH<br/>
            <icon name="dollar-sign"></icon> {{ priceUSD }} USD/HUSH<br/>
        </div>
      </div>

    <el-dialog title={{$t('import_transparent_address')}} :visible.sync="importTaddrVisible" width="60%" >
      <el-form :model="importTaddrForm">
        <el-form-item label={{$t('private_key_wif')}} label-width="100px">
          <el-input placeholder={{$t('wallet_import_format_taddr')}} v-model="importTaddrForm.wif" auto-complete="off"></el-input>
        </el-form-item>
        <div>
            <ul>
            <li><icon name=key></icon> {{$t('never_give_private_key')}}</li>
            <li><icon name=user-secret></icon> {{$t('treat_it_like_a_password')}}</li>
            <li><icon name=share-alt></icon> {{$t('import_a_private_key')}}</li>
            </ul>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="importTaddrVisible = false">{{$t('cancel')}}</el-button>
        <el-button type="primary" @click="importTaddress(importTaddrForm.wif,true)">{{$t('import')}}</el-button>
      </span>
    </el-dialog>

    <el-dialog title={{$t('import_shielded_address')}} :visible.sync="importZaddrVisible" width="60%" >
      <el-form :model="importZaddrForm">
        <el-form-item label={{$t('private_key_wif')}} label-width="100px">
          <el-input placeholder={{$t('wallet_import_format_zaddr')}} v-model="importZaddrForm.wif" auto-complete="off"></el-input>
        </el-form-item>
        <div>
            <ul>
            <li><icon name=key></icon> {{$t('never_give_private_key')}}</li>
            <li><icon name=user-secret></icon> {{$t('treat_it_like_a_password')}}</li>
            <li><icon name=share-alt></icon> {{$t('import_a_private_key')}}</li>
            </ul>
        </div>
<!--
        <el-form-item label="Start Height" label-width="100px">
          <el-input v-model="importZaddrForm.startHeight" value=0 auto-complete="off"></el-input>
        </el-form-item>
-->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="importZaddrVisible = false">{{$t('cancel')}}</el-button>
        <el-button type="primary" @click="importZaddress(importZaddrForm)">{{$t('import')}}</el-button>
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
            rescan: true,
        },
        importZaddrVisible: false,
        importZaddrForm: {
            wif: "",
            rescan: "whenkeyisnew",
            startHeight: 0,
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
        'importZaddr',
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
      importZaddress(form) {
        var wif         = form.wif;
        var rescan      = form.rescan;
        var startHeight = form.startHeight;
        this.$store.dispatch('importZaddr', wif, rescan, startHeight);
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
