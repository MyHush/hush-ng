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
      
      <el-form ref="form" :model="transactionForm" label-width="150px" >
        <el-form-item label="From" >
          <el-select v-model="transactionForm.from" placeholder="Select a shielded or transparent address" style="width:100%;">
            <el-option
              v-for="address in allAddresses"
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
          <el-select v-model="transactionForm.destinationAddresses" multiple filterable allow-create  default-first-option placeholder="put address here or choose from your contacts" style="width:100%;">
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
          <el-col :span="8">
            <el-input placeholder="Amount sent each address"
                v-on:input="updateTransactionForm(transactionForm,availableBalance)"
                v-model="transactionForm.amount">
            </el-input>
          </el-col>
        </el-form-item>

          <el-form-item label="Miner Fee">
          <el-col :span="8">
            <el-input placeholder="Cost to include transaction in block" v-model="transactionForm.fee"
                v-on:input="updateTransactionForm(transactionForm,availableBalance)"
            ></el-input>
          </el-col>
          </el-form-item>

          <el-form-item label="Dev Donation">
          <el-col :span="8">
            <el-input placeholder="Suggested 1% donation" 
                v-on:input="updateTransactionForm(transactionForm,availableBalance)"
            v-model="transactionForm.devDonation"></el-input>
          </el-col>
          </el-form-item>

          <el-form-item label="Total Amount">
          <el-col :span="8">
            <el-input placeholder="Total amount to send transaction"
            v-model="transactionForm.totalAmount" readonly></el-input>
          </el-col>
          </el-form-item>

          <el-form-item label="Remaining Balance">
          <el-col :span="8">
            <el-input placeholder="Amount left after this transaction"
            v-on:input="updateTransactionForm(transactionForm,availableBalance)"
            v-model="transactionForm.remaining" readonly></el-input>
          </el-col>
          </el-form-item>

        <el-form-item label="Memo">
          <el-col :span="10">
            <el-input type=textarea placeholder="Hey Bob, this is Alice, did you hear about Charlie? ..." v-model="transactionForm.memo" style="width: 100%;"></el-input>
          </el-col>
        </el-form-item>

      </el-form>
<el-popover
  ref="popoverConfirm"
  placement="top"
  width="160"
  v-model="popoverConfirm">
  <p>Are you sure you want to make a transaction of {{ transactionForm.totalAmount }} HUSH ?</p>
  <div style="text-align: right; margin: 0">
    <el-button size="mini" type="text" @click="popoverConfirm = false">cancel</el-button>
    <el-button type="primary" size="mini" @click="popoverConfirm = false">confirm</el-button>
  </div>
</el-popover>

      <el-button type="primary" @click="createTransaction">Create</el-button>


 <el-tooltip class="item" effect="dark" content="Clear the transaction form" placement="top">
      <el-button type="danger" @click="clearTransaction(transactionForm,availableBalance)">Clear</el-button>
</el-tooltip>


    </div>
    <div class="container" style="height:calc(100% - 300px);" >
      <el-row >
 <el-tooltip effect="dark" content="Sent and received transactions" placement="top">
        <el-col :span="8" class="caption">Transaction History</el-col>
</el-tooltip>
        <el-col :span="8" class="info" >click on a row to open block explorer</el-col>
        <el-col :span="8" class="balance"> 
          <div v-on:click="showFailedOperations" style="float:right;margin-left:10px;"> 
            <icon name="exclamation-triangle" scale=2 /> <span class="ops" >{{ failedOperations.length }}</span>
          </div>
          <div v-on:click="showPendingOperations" style="float:right">
            <icon name="cogs" scale=2 flip="horizontal" /> <span class="ops" >{{ pendingOperations.length }}</span> 
          </div>
        </el-col>
      </el-row>

      <el-table :data="transactions" height="95%" style="width: 100%" empty-text="None" @row-click="openExplorer" >
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

         <el-table-column prop="time" width="180" label="Time"> 
          <template slot-scope="scope">           
            <div> {{ scope.row.time > 0 ? new Date(scope.row.time*1000).toLocaleString('en-US') : "..." }} </div>
          </template>
        </el-table-column>

        <el-table-column prop="amount" label="Amount" width="160"> 
          <template slot-scope="scope">          
             <div style="float:right"> {{ Math.abs(scope.row.amount) }} HUSH </div>           
          </template>
        </el-table-column>
        <el-table-column prop="address" label="Destination address" width="*" >
          <template slot-scope="scope">            
            <span class="address">{{ scope.row.address }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="memo" label="Memo" width="*" >
          <template slot-scope="scope">            
            <span class="memo">{{ scope.row.memo }}</span>
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
            <div> {{ scope.row.date > 0 ? new Date(scope.row.date*1000).toLocaleString('en-US') : "..." }} </div> 
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

  const sprintf = require("sprintf-js").sprintf
  const Repeat = require('repeat')
  var store = require('store')
  import { Popover, Tooltip } from 'element-ui';
  import Vue from 'vue'
  Vue.use(Popover);
  Vue.use(Tooltip);

  export default {
    name: 'transactions',
    components: { CloseButton },
    data () {
       return {
         transactionForm : {
          from: null,
          destinationAddresses: [],
          amount: '',
          devDonation: '',
          fee: 0.0001,
          remaining: '',
          totalAmount: '0',
        },
        popoverConfirm: false,
        operationsDialogVisible: false,
        failedOperationsDialogVisible: false
      }
    },
    computed:{
      ...mapState([
        'transactions',
        'availableBalance',
        'contacts',
        'totalAmount',
        'groupedDestinationAddresses'
      ]),
      ...mapGetters([
        'allAddresses',
        'pendingOperations',
        'failedOperations'
      ])
    },
    methods: {
      openExplorer (row) {
        var link = "https://explorer.myhush.org/tx/" + row.txid;
        this.$electron.shell.openExternal(link)
      },
      clearTransaction (form,balance) {
        form.from                 = "";
        form.destinationAddresses = [];
        form.amount               = "";
        form.devDonation          = "";
        form.totalAmount          = "";
        form.remaining            = balance;
        form.memo                 = "";
      },
      createTransaction () {
        this.$store.dispatch('sendToMany',this.transactionForm);
      },
      showPendingOperations () {
        this.operationsDialogVisible = true;
      },
      showFailedOperations () {
        this.failedOperationsDialogVisible = true;
      },
      updateTransactionForm (form,availableBalance) {
        form.amount      = ((form.amount > 0) && (Math.abs(form.amount) < Infinity)) ? parseFloat(form.amount) : 0.0;
        form.fee         = form.fee    > 0      ? parseFloat(form.fee)    : 0.0;
        form.devDonation = sprintf("%.8f", 0.01*form.amount);
        //console.log('bal=' + availableBalance);
        //console.log('totalamount=' + form.totalAmount);
        //console.log("updating xtn form");
        form.remaining   = availableBalance - form.totalAmount;
        form.remaining   = sprintf("%.8f", form.remaining);
        form.totalAmount = sprintf("%.8f", form.amount + form.fee + parseFloat(form.devDonation));
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

  .blurry {
   color: transparent;
   text-shadow: 0 0 5px rgba(0,0,0,0.5);
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
