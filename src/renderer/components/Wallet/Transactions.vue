<template>
  <div>
    Transactions can be sent </br> from a zaddr or taddr depending on your preference
    <div class="container" >
      <el-row class="caption">
        <el-col :span="16" >Create a transaction</el-col>
        <el-col :span="8" class="balance">Spendable Balance: <span>{{ fakeBalance }}</span></el-col>
      </el-row>
      
      <el-form ref="form" :model="transactionForm" label-width="60px" >
        <el-form-item label="From" >
          <el-select v-model="transactionForm.from" placeholder="Select" style="width:100%;">
            <el-option
              v-for="address in addresses"
              :key="address.address"
              :label="address.address"
              :value="address.address">             
          </el-option>
        </el-select>
        </el-form-item>
        <el-form-item label="To">
          <el-input v-model="transactionForm.destinationAddress"></el-input>
        </el-form-item>
        <el-form-item label="Amount">
          <el-col :span="11">
            <el-input placeholder="" v-model="transactionForm.amount" style="width: 95%;"></el-input>
          </el-col>
          <el-col :span="2">Fee</el-col>
          <el-col :span="11">
            <el-input placeholder="" v-model="transactionForm.fee" style="width:100%;"></el-input>
          </el-col>
        </el-form-item>
      </el-form>         
      <el-button type="primary" @click="createTransaction">Create</el-button>
    </div>
    <div class="container" >
      <el-row class="caption">
        <el-col :span="16" >Transaction History</el-col>
      </el-row>
      <el-row class="intro">
        <el-col :span="24" >click on a row to open block explorer</el-col>
      </el-row>

      <el-table :data="transactions" height="280" style="width: 100%">
        <el-table-column prop="category" label="Category" width="100"> </el-table-column>
        <el-table-column prop="0" label="Amount" width="180"> </el-table-column>
        <el-table-column prop="address" label="Address" width="*" class-name="address"> </el-table-column>
        <el-table-column prop="confirmations" label="Conf" width="60"> </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
  import { mapState,mapGetters, mapActions } from 'vuex'
  import CloseButton from '../shared/CloseButton'

  const Repeat = require('repeat')
  var store = require('store')

  export default {
    name: 'transactions',
    components: { CloseButton },
    data () {
       return {
         transactionForm : {
          from: null,
          destinationAddress: null,
          amount: 0.0,
          fee: 0.0001
        },
        fakeBalance: 0.0
      }
    },
    computed:{
      ...mapState([
        'addresses',       
        'transactions',
        'availableBalance',  
      ]),        
         // mix the getters into computed with object spread operator
      ...mapGetters([
        'tAddresses',
      ])           
    },
    methods: {
      createTransaction () {        
        // ["t1gDpRTxxxxx",[{"address":"t1gDpRTxxxxxx","amount":0.01}],#confs,#fee ]
        var receivers = [];                
        receivers.push({"address":this.transactionForm.destinationAddress, "amount": this.transactionForm.amount});
        var receivers = [{"address":"tmHuYijNNGm3zUmKdf8crJ35MQDjbJyjNnh","amount":1.11}];
        
        var params = [];
        params.push("tmDuXLxoKhaYoaWEsH15b91f9B79KwBt4qo");
        params.push(receivers);
        var requestJSON = {
          id:  Date.now(),
          method: "z_sendmany",
          params: params
        };
        console.log(JSON.stringify(requestJSON));
        this.$store.dispatch('sendToMany',params);    
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

</style>
