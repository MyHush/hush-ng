<template>
  <div style="height:95%">
    Transactions can be sent <br/> from a zaddr or taddr depending on your preference
    <div class="container" >
      <el-row class="caption">
        <el-col :span="12" >Create a transaction</el-col>
        <el-col :span="12" class="balance">
        <div style="float:right">
          Spendable Balance: <span>{{ availableBalance }}</span>
        </div>
        </el-col>
      </el-row>
      
      <el-form ref="form" :model="transactionForm" label-width="60px" >
        <el-form-item label="From" >
          <el-select v-model="transactionForm.from" placeholder="Select" style="width:100%;">
            <el-option
              v-for="address in addresses"
              :key="address.address"
              :label="address.address"
              :value="address.address"
              :disabled="!address.isConfirmed">  
                  <span class="address" style="float: left">{{ address.address }}</span>
                  <span style="float: right; font-size: 13px">{{ address.balance }}</span>            
          </el-option>
        </el-select>
        </el-form-item>
        <el-form-item label="To">
          <el-select v-model="transactionForm.destinationAddresses" multiple filterable allow-create placeholder="put address here or choose from your contacts" style="width:100%;">
            <el-option-group v-for="group in groupedDestinationAddresses" :key="group.label" :label="group.label">
              <el-option
                v-for="item in group.addresses"
                :key="item.address"
                :label="item.nickName" 
                :value="item.address">
                  <span style="float: left;width:100px;">{{ item.nickName }}</span>
                  <span class="address" style="float: left">{{ item.address }}</span>
                  <span style="float: right; font-size: 13px">{{ item.balance }}</span>
              </el-option>
            </el-option-group>
          </el-select>
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
    <div class="container" style="height:calc(100% - 300px);" >
      <el-row >
        <el-col :span="8" class="caption">Transaction History</el-col>
        <el-col :span="8" class="info" >click on a row to open block explorer</el-col>
        <el-col :span="8" class="balance"> 
          <div v-on:click="showFailedOperations" style="float:right;margin-left:10px;"> 
            <icon name="exclamation-triangle" /> <span class="ops" >{{ failedOperations.length }}</span>
          </div>
          <div v-on:click="showPendingOperations" style="float:right">
            <icon name="history" flip="horizontal" /> <span class="ops" >{{ pendingOperations.length }}</span> 
          </div>
        </el-col>
      </el-row>

      <el-table :data="transactions" height="95%" style="width: 100%" empty-text="None">
        <el-table-column prop="confirmations" label="" width="30"> 
          <template slot-scope="scope">           
            <div v-if="scope.row.confirmations > 0" ><icon name="check" class="confirmed" /> </div>
          </template>
        </el-table-column>
       
        <el-table-column prop="category" label="Direction" width="90"> 
           <template slot-scope="scope">          
             <div v-if="scope.row.category == 'receive'"> Incoming </div>
             <div v-if="scope.row.category == 'send'"> Outgoing </div>
             <div v-if="scope.row.category == 'generate'"> Mined </div>
          </template>
        </el-table-column>
         <el-table-column prop="time" width="180"> 
          <template slot-scope="scope">           
            <div> {{ new Date(scope.row.time*1000).toLocaleString('en-US') }} </div>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="Amount" width="120"> 
          <template slot-scope="scope">          
             <div style="float:right"> {{ Math.abs(scope.row.amount) }} HUSH </div>           
          </template>
        </el-table-column>
        <el-table-column prop="address" label="Destination address" width="*" >
          <template slot-scope="scope">            
            <span class="address">{{ scope.row.address }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="Pending operations" :visible.sync="operationsDialogVisible" width="75%" >
      <el-table :data="pendingOperations" height="320" style="width: 100%" empty-text="None">
        <el-table-column prop="date" label="Last Updated" width="160" >
          <template slot-scope="scope">           
            <div> {{ new Date(scope.row.date*1000).toLocaleString('en-US') }} </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="Id" width="*"> </el-table-column>
        <el-table-column prop="status" label="Status" width="80"> </el-table-column>
        <el-table-column prop="error" label="Error" width="260" > 
          <template slot-scope="scope">           
            <div style="text-overflow: ellipsis;"> {{ scope.row.error }} </div>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">        
        <el-button type="primary" @click="operationsDialogVisible = false">Close</el-button>
      </span>
    </el-dialog>
    <el-dialog title="Failed operations" :visible.sync="failedOperationsDialogVisible" width="75%" >
      <el-table :data="failedOperations" height="320" style="width: 100%" empty-text="None">
        <el-table-column prop="date" label="Date" width="160"> 
          <template slot-scope="scope" >           
            <div> {{ new Date(scope.row.date*1000).toLocaleString('en-US') }} </div> 
          </template>
        </el-table-column>
        <el-table-column prop="id" label="Id" width="*" > </el-table-column>
        <el-table-column prop="status" label="Status" width="80"> </el-table-column>
        <el-table-column prop="error" label="Error" width="260" > 
          <template slot-scope="scope">           
            <div style="text-overflow: ellipsis; white-space: nowrap;overflow: hidden;"> {{ scope.row.error }} </div>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">        
        <el-button type="primary" @click="failedOperationsDialogVisible = false">Close</el-button>
      </span>
    </el-dialog>

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
          destinationAddresses: [],
          amount: 0.0,
          fee: 0.0001
        },
        operationsDialogVisible: false,
        failedOperationsDialogVisible: false
      }
    },
    computed:{
      ...mapState([
        'addresses',
        'transactions',
        'availableBalance',  
        'contacts',
        'groupedDestinationAddresses'
      ]),                         
      ...mapGetters([
        'tAddresses',
        'pendingOperations',
        'failedOperations'
      ])           
    },
    methods: {
      createTransaction () {                     
        this.$store.dispatch('sendToMany',this.transactionForm);  
      },
      showPendingOperations () {                     
        this.operationsDialogVisible = true;
      },
      showFailedOperations () {                     
        this.failedOperationsDialogVisible = true;
      }          
    },
    mounted: function() {
     
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Poppins:300,400,500,700');

  .info {
    font-size:10pt;
    padding: 4px 0px;
  }

  .is-disabled .address {
    color: #c0c4cc;
  }

  .address {
    font-family: 'Courier', sans-serif;
    font-size:8pt;  
  }

  svg.confirmed  {
    stroke: green;
    fill: green;
  }

  .ops {
    cursor: pointer;
  }

  .el-select-dropdown.is-multiple .el-select-dropdown__item.selected::after {
    left: 3px;
  }

</style>
