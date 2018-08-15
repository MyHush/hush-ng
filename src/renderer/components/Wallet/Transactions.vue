<template>
  <div style="height:95%" >
    {{$t('message.intro_wallet_menu_1')}}

    <div class="container">
      <div id="spendable-balance">
        <strong>{{$t('message.spendable_balance')}}:</strong> <span>{{ availableBalance }}</span>
      </div>
    </div>

    <div class="container container-card">
      <el-row class="caption">
        <el-col :span="12" >{{$t('message.create_transaction')}}</el-col>
      </el-row>

      <el-form ref="form" :model="transactionForm" label-width="150px" >
        <el-form-item v-bind:label="$t('message.from')">
          <el-select v-model="transactionForm.from" v-bind:placeholder="$t('message.select_address')" style="width:100%;" @change="updateTransactionForm(transactionForm,availableBalance,'from')">
            <el-option
              v-for="address in allAddresses"
              :key="address.address"
              :label="address.address"
              :value="address.address"
              :disabled="!address.isConfirmed">
                  <span class="address" style="float: left">{{ address.address }}</span>
                  <span style="float: right; font-size: 13px">{{ address.balance }}</span>
            </el-option>
            <el-input v-on:input="updateTransactionForm(transactionForm,availableBalance,'from')"></el-input>
          </el-select>
        </el-form-item>

        <el-form-item v-bind:label="$t('message.to')">
          <el-select v-model="transactionForm.destinationAddresses" multiple filterable allow-create  default-first-option v-bind:placeholder="$t('message.put_address_here')" style="width:100%;" @change="updateTransactionForm(transactionForm,availableBalance,'to')">
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

        <el-form-item v-bind:label="$t('message.amount')" label-width="150px" id="txtAmount" >
          <el-col :span="15">
            <el-input v-bind:placeholder="$t('message.amount_sent_each_address')"
              v-numeric-only
              ondragstart="return false;" ondrop="return false;"
              v-on:input="updateTransactionForm(transactionForm,availableBalance,'amount')"
              v-model="transactionForm.amount">
            </el-input>
          </el-col>
        </el-form-item>

        <el-form-item v-bind:label="$t('message.miner_fee')">
          <el-col :span="15">
            <el-input v-bind:placeholder="$t('message.cost_transaction_in_block')" v-model="transactionForm.fee"
              v-numeric-only
              ondragstart="return false;" ondrop="return false;"
              v-on:input="updateTransactionForm(transactionForm,availableBalance,'mining_fee')">
            </el-input>
          </el-col>
        </el-form-item>

        <el-form-item v-bind:label="$t('message.dev_donation')">
          <el-col :span="15">
            <!--<el-input v-bind:placeholder="$t('message.suggested_donation')" -->
            <el-input v-bind:placeholder="placeholder_suggested_donation" v-bind:disabled="disabled_suggested_donation"
              v-numeric-only
              ondragstart="return false;" ondrop="return false;"
              v-on:input="updateTransactionForm(transactionForm,availableBalance,'dev_fee')"
              v-model="transactionForm.devDonation">
            </el-input>
          </el-col>
        </el-form-item>

        <el-form-item v-bind:label="$t('message.total_amount')">
          <el-col :span="15">
            <el-input v-bind:placeholder="$t('message.total_amount_to_send')"
              v-model="transactionForm.totalAmount" readonly>
            </el-input>
          </el-col>
        </el-form-item>

        <el-form-item v-bind:label="$t('message.remaining_balance')">
          <el-col :span="15">
            <el-input v-bind:placeholder="$t('message.amount_left_after_transaction')"
              v-on:input="updateTransactionForm(transactionForm,availableBalance,'amount_left_after_transaction')"
              v-model="transactionForm.remaining" readonly>
            </el-input>
          </el-col>
        </el-form-item>

        <el-form-item v-bind:label="$t('message.memo')">
          <el-col :span="15">
            <el-input type=textarea v-bind:placeholder="$t('message.hey_Bob')"
              v-model="transactionForm.memo"
              style="width: 100%;">
            </el-input>
          </el-col>
        </el-form-item>

      </el-form>

      <el-popover
        ref="popoverConfirm"
        placement="top"
        width="160"
        v-model="popoverConfirm">
        <p>
          {{ this.$t('message.confirm_transaction_form'), {'total_amount': transactionForm.totalAmount} }}
        </p>
        <div style="text-align: right; margin: 0">
          <el-button size="mini" type="text" @click="popoverConfirm = false">{{$t('message.cancel')}}</el-button>
          <el-button type="primary" size="mini" @click="popoverConfirm = false">{{$t('message.confirm')}}</el-button>
        </div>
      </el-popover>

      <el-button type="primary" @click="createTransaction">{{$t('message.create')}}</el-button>

      <el-tooltip class="item" effect="dark" v-bind:content="$t('message.clear_transaction_form')" placement="top">
        <el-button type="danger" @click="clearTransaction(transactionForm,availableBalance)">{{$t('message.clear')}}</el-button>
      </el-tooltip>

    </div>

    <!-- <div class="container container-card" style="height:calc(100% - 300px);"> -->
    <div class="container container-card">
      <el-row>
        <el-tooltip effect="dark" v-bind:content="$t('message.sent_and_received_transactions')" placement="top">
          <el-col :span="8" class="caption">{{$t('message.transaction_history')}}</el-col>
        </el-tooltip>
        <el-col :span="8" class="info" >{{$t('message.open_block_explorer')}}</el-col>
        <el-col :span="8" class="balance">
          <div v-on:click="showFailedOperations" style="float:right;margin-left:10px;">
            <icon name="exclamation-triangle" scale=2 /> <span class="ops" >{{ failedOperations.length }}</span>
          </div>
          <div v-on:click="showPendingOperations" style="float:right">
            <icon name="cogs" scale=2 flip="horizontal" /> <span class="ops" >{{ pendingOperations.length }}</span>
          </div>
        </el-col>
      </el-row>

      <el-table :data="transactions" style="width: 100%" empty-text="None" @row-click="openExplorer" >
        <el-table-column prop="confirmations" label="" width="30">
          <template slot-scope="scope">
            <div v-if="scope.row.confirmations > 0" ><icon name="check" class="confirmed" /> </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" v-bind:label="$t('message.direction')" width="90">
          <template slot-scope="scope">
            <div v-if="scope.row.category == 'receive'"> {{$t('message.incoming')}} </div>
            <div v-if="scope.row.category == 'send'"> {{$t('message.outgoing')}} </div>
            <div v-if="scope.row.category == 'generate'"> {{$t('message.mined')}} </div>
          </template>
        </el-table-column>
         <el-table-column prop="time" width="180" v-bind:label="$t('message.time')">
          <template slot-scope="scope">
            <div> {{ scope.row.time > 0 ? new Date(scope.row.time*1000).toLocaleString('en-US') : "..." }} </div>
          </template>
        </el-table-column>
        <el-table-column prop="amount" v-bind:label="$t('message.amount')" width="160">
          <template slot-scope="scope">
             <div style="float:right"> {{ Math.abs(scope.row.amount) }} HUSH </div>
          </template>
        </el-table-column>
        <el-table-column prop="address" v-bind:label="$t('message.destination_address')" width="*" >
          <template slot-scope="scope">
            <span class="address">{{ scope.row.address }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="memo" v-bind:label="$t('message.memo')" width="*" >
          <template slot-scope="scope">
            <span class="memo">{{ scope.row.memo }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-bind:title="$t('message.pending_operations')" :visible.sync="operationsDialogVisible" width="75%" >
      <el-table :data="pendingOperations" style="width: 100%" empty-text="None">
        <el-table-column prop="date" v-bind:label="$t('message.last_updated')" width="160" >
          <template slot-scope="scope">
          </template>
        </el-table-column>
        <el-table-column prop="id" v-bind:label="$t('message.id')" width="*"> </el-table-column>
        <el-table-column prop="status" v-bind:label="$t('message.status')" width="80"> </el-table-column>
        <el-table-column prop="error" v-bind:label="$t('message.error')" width="260" >
          <template slot-scope="scope">
            <div style="text-overflow: ellipsis;"> {{ scope.row.error }} </div>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="operationsDialogVisible = false">{{$t('message.close')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog v-bind:title="$t('message.failed_operations')" :visible.sync="failedOperationsDialogVisible" width="75%" >
      <el-table :data="failedOperations" style="width: 100%" empty-text="None">
        <el-table-column prop="date" v-bind:label="$t('message.date')" width="160">
          <template slot-scope="scope" >
            <div> {{ scope.row.date > 0 ? new Date(scope.row.date*1000).toLocaleString('en-US') : "..." }} </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" v-bind:label="$t('message.id')" width="*" > </el-table-column>
        <el-table-column prop="status" v-bind:label="$t('message.status')" width="80"> </el-table-column>
        <el-table-column prop="error" v-bind:label="$t('message.error')" width="260" >
          <template slot-scope="scope">
            <div style="text-overflow: ellipsis; white-space: nowrap;overflow: hidden;"> {{ scope.row.error }} </div>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="failedOperationsDialogVisible = false">{{$t('message.close')}}</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  import { mapState,mapGetters, mapActions } from 'vuex'
  import CloseButton from '../shared/CloseButton'
  import {Decimal} from 'decimal.js';

  const sprintf = require("sprintf-js").sprintf
  const Repeat = require('repeat')
  var store = require('store')
  const transaction_fee = 0.0001
  const dev_fee_percentage = 0.01
  import { Popover, Tooltip } from 'element-ui';
  import Vue from 'vue'

  Vue.use(Popover);
  Vue.use(Tooltip);



  Vue.directive('numeric-only', {
		bind(el) {
		  el.addEventListener('keydown', (e) => {

          var text = e.target.value.toString();
          var number = e.target.value.split('.');
          var index = text.indexOf(".");

          //console.log('keyCode = ' +  e.keyCode);

          if ([46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1 ||
					// Allow: Ctrl+A
					(e.keyCode === 65 && e.ctrlKey === true) ||
					// Allow: Ctrl+C
					(e.keyCode === 67 && e.ctrlKey === true) ||
					// Allow: Ctrl+X
					(e.keyCode === 88 && e.ctrlKey === true) ||
                    // Allow: Ctrl+V
          		    (e.keyCode === 86 && e.ctrlKey === true) ||
					// Allow: home, end, left, right
					(e.keyCode >= 35 && e.keyCode <= 39) ||
                    //Allow : number
                    (e.keyCode >= 96 && e.keyCode <= 105) ||
                    //Allow : dot
                    (e.keyCode == 110 )) {
					// let it happen, don't do anything
               }else{
                 e.preventDefault()
               }

          //TODO : Cancel copy/paste when the clipboard does not contain a numeric string.
          //if (e.keyCode === 86 && e.ctrlKey === true)
          //{
          //  if (isNAN(CLIPBOARD))
          //  {
          //    e.preventDefault()
          //  }
          //}

          //Just one dot
          if(index!= -1 && e.keyCode === 110)
          {
              e.preventDefault()
          }

          //Get the carat position
          var caratPos = '';
          if (e.createTextRange) {

		    var r = document.selection.createRange().duplicate()
		    r.moveEnd('character', e.target.value.length)

            if (r.text == '')
                {
                  caratPos = e.target.value.length;
                } else{
                  caratPos = e.target.value.lastIndexOf(r.text);
                }
	      }
          else
          {
            caratPos = e.target.selectionStart;
          }

          //var caratPos = getSelectionStart(el);
          var dotPos = text.indexOf(".");
          if( caratPos > dotPos && dotPos>-1 && (number[1].length > 7)){
            if (e.keyCode === 8 || (e.keyCode >=37 && e.keyCode <= 40) || e.keyCode === 46)
            {
                // let it happen, don't do anything
            }else{
              e.preventDefault()
            }
          }
          return
      })
    }
  });



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
          //fee: transaction_fee,
          fee: '',
          remaining: '',
          totalAmount: '',
          //totalAmount: '0',
        },
        popoverConfirm: false,
        operationsDialogVisible: false,
        failedOperationsDialogVisible: false,
        disabled_suggested_donation : true,
        placeholder_suggested_donation : this.$t('message.only_shielded_transactions_contain_donations')
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

        // clear some fields after we send, to prevent accidentally double-sending
        var form                  = this.transactionForm;
        form.from                 = "";
        form.destinationAddresses = [];
        form.amount               = "";
        form.devDonation          = "";
        form.totalAmount          = "";
        form.memo                 = "";
      },
      showPendingOperations () {
        this.operationsDialogVisible = true;
      },
      showFailedOperations () {
        this.failedOperationsDialogVisible = true;
      },
      updateTransactionForm (form,availableBalance,input_from) {

      var nbDestinationAddresses = 0;
      for(let receiver of form.destinationAddresses) {
          nbDestinationAddresses = nbDestinationAddresses + 1 ;
      }

      if (form.from == null || nbDestinationAddresses == 0 ) {
        form.totalAmount = '';
        form.devDonation = '';
        form.fee = '';
        form.remaining = '';
        return;
      }

      if (form.amount == '' ){
          form.totalAmount = '';
          form.devDonation = '';
          form.fee = '';
          form.remaining = '';
          return;
      }

      var shieldedXtn = 0;
      // Does this xtn contain at least one zaddr?
      if (form.from && form.from.substr(0,1) == 'z' ) {
        shieldedXtn = 1;
      } else {
        for(let receiver of form.destinationAddresses) {
            var addr = receiver.toString();
            if(addr.substr(0,1) == 'z') {
                shieldedXtn = 1;
                break;
            }
        }
      }

      // transaction_fee
      if (input_from != 'mining_fee'){
        form.fee = sprintf("%.4f",nbDestinationAddresses * transaction_fee)
        var d_fee = new Decimal(form.fee);
      }else{
        if (form.fee == '') {
          var d_fee = new Decimal("0");
        }else{
          var d_fee = new Decimal(form.fee);
        }
      }

      if (isNaN(form.amount))
      {
          //TODO : When a copy/paste of a non-numeric string is copied, the input text is replaced by '0' but not by a second copy/paste.
          //Force a refresh ?
          form.amount = 0;
      }else{
        form.amount = parseFloat(form.amount);
      }

      var d_amount = new Decimal(form.amount);
      var d_nbDestinationAddresses = new Decimal(nbDestinationAddresses);

      var d_totalAmount = new Decimal(d_amount).mul(d_nbDestinationAddresses);
      d_totalAmount = Decimal.add(d_totalAmount, d_fee);

      var d_devDonation = new Decimal("0");
      // only shielded xtns have dev donations
      if (shieldedXtn == 1 ) {
        if  (input_from == 'dev_fee'){
          if (form.devDonation == '') {
            this.placeholder_suggested_donation = this.$t('message.suggested_donation');
          } else{
            var d_devDonation = new Decimal(form.devDonation);
          }
        } else {
          var d_devDonation = new Decimal("0");
          var percentage_fee = new Decimal (dev_fee_percentage);
          d_devDonation = Decimal.mul(d_amount,d_nbDestinationAddresses);
          d_devDonation = Decimal.mul(d_devDonation,percentage_fee);
          form.devDonation = sprintf("%.8f", d_devDonation.toString());
        }
        this.disabled_suggested_donation = false;
      } else {
        this.placeholder_suggested_donation = this.$t('message.only_shielded_transactions_contain_donations');
        form.devDonation = '';
        this.disabled_suggested_donation = true;
      }

      d_totalAmount = Decimal.add(d_totalAmount, d_devDonation);
      form.totalAmount = d_totalAmount.toString();

      form.remaining = availableBalance - form.totalAmount;
      form.remaining = sprintf("%.8f", form.remaining);
      }
    },

    mounted: function() {
    }
  }
</script>

<style scoped>

  #spendable-balance {
    width: 100%;
    text-align: right;
    margin-bottom: -10px;
  }

  #spendable-balance span {
    color: #2F77F7;
  }

  .caption {
    padding-bottom: 25px;
  }

  .info {
    font-size: .8em;
    padding: 4px 0px;
  }

  .is-disabled .address {
    color: #c0c4cc;
  }

  .address {
    font-family: 'Courier', sans-serif;
    font-size:.8em;
  }

  .zaddress {
    font-family: 'Courier', sans-serif;
    /* font-size:12pt; */
  }

  .taddress {
    font-family: 'Courier', sans-serif;
    font-size: 1.2em;
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
