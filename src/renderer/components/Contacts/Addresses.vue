<template>
  <div style="height:100%">
      {{$t('message.list_of_contacts')}}<br/>
    <div class="container" style="height:95%">
      <el-row class="caption">
        <el-col :span="4"><a class="button" id="generate-address" v-on:click="addContact()">{{$t('message.new_contact')}}</a></el-col>
      </el-row>
      <el-table :data="contacts" height="90%" style="width: 100%" empty-text="None">
        <el-table-column label="" width="100">
          <template slot-scope="scope">
            <el-button @click="chatContact(scope.row)" size="small"><icon name=envelope></icon>{{$t('message.chat')}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="nickName" v-bind:label="$t('message.contacts')" width="100"> </el-table-column>
        <el-table-column prop="address" v-bind:label="$t('message.addresses')" width="*" class-name="address" > </el-table-column>        
        <el-table-column
          fixed="right"
          label=""
          width="200">
          <template slot-scope="scope">
            <el-button @click="editContact(scope.row)"  size="small"><icon name=pencil-alt></icon>{{$t('message.edit')}}</el-button>
            <el-button @click="removeContact(scope.row)" size="small"><icon name=bomb></icon>{{$t('message.delete')}}</el-button>
          </template>
        </el-table-column>        
      </el-table>        
    </div>    

    <el-dialog v-bind:title="$t('message.edit_contact')" :visible.sync="contactDialogVisible" width="60%" >
      <el-form :model="contactForm">
        <el-form-item v-bind:label="$t('message.name')" label-width="100px">
          <el-input v-model="contactForm.nickName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item v-bind:label="$t('message.adress')" label-width="100px">
         <el-input v-model="contactForm.address" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">         
        <el-button @click="contactDialogVisible = false">{{$t('message.cancel')}}</el-button>
        <el-button type="primary" @click="saveContact(contactForm)">{{$t('message.save')}}</el-button>
      </span>
    </el-dialog>

    <el-dialog v-bind:title="$t('message.chat')" :visible.sync="chatDialogVisible" width="60%" >
     {{ chatForm.nickName }}
      <el-form :model="chatForm">
        <el-form-item v-bind:label="$t('message.memo')" label-width="100px">
          <el-input v-model="chatForm.memo" type=textarea auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">         
        <el-button @click="chatDialogVisible = false">{{$t('message.cancel')}}</el-button>
        <el-button type="primary" @click="sendToContact(chatForm)">{{$t('message.send')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script> 
  import copy from 'copy-to-clipboard';
  import Vue from 'vue'
  import Vuex from 'vuex'
  import VueI18n from 'vue-i18n'
  import messages from '../../../lang/messages'
  import { mapState,mapGetters, mapActions } from 'vuex'
  function log(msg) { console.log(msg) }

  Vue.use(Vuex)
  Vue.use(VueI18n)

  // Create VueI18n instance with options
  //let localisation = navigator.language
  let localisation = navigator.language.split("-")[0] // Use browser first language
  const i18n = new VueI18n({
    fallbackLocale: 'en',
    locale: localisation,
    //dateTimeFormats,
    //numberFormats
    messages
  })

  let vue = new Vue({ i18n })

  export default {
    name: 'addresses',
    components: {  },
    data () {
       return {
         contactForm : {
          id: null,
          nickName: "",
          address: "",
          conversationAddress: ""
        },
         chatForm : {
          id: null,
          nickName: "",
          memo: "",
          conversationAddress: "",
          conversationVK:      ""
        },
        contactDialogVisible: false,
        chatDialogVisible: false
      }
    },

    computed:{
      ...mapState([
        'contacts'
      ])
    },

    methods: {
      copy (value) {
        copy(value)
        //alert('Copied ' + value + ' to clipboard.')
        alert(i18n.t('message.copied_to_clipboard', { value: value }))
      },

      addContact (value) {
         this.contactForm.id                  = null;
         this.contactForm.nickName            = "";
         this.contactForm.address             = "";
         this.contactForm.conversationAddress = "";
         this.contactDialogVisible            = true;
      },

      editContact (contact) {
         console.log(contact);
         this.contactForm.id                  = contact.id;
         this.contactForm.nickName            = contact.nickName;
         this.contactForm.address             = contact.address;
         this.contactForm.conversationAddress = contact.conversationAddress;
         this.contactDialogVisible            = true;
      },

      removeContact (contact) {
        this.$store.commit('removeContact',contact );
        this.$store.dispatch('saveContacts');
        log("Removed contact " + contact.nickName);
      },


      chatContact (contact) {
         this.chatForm.nickName            = contact.nickName;
         this.chatForm.address             = contact.address;
         this.chatForm.id                  = contact.id;
         this.chatForm.conversationAddress = contact.conversationAddress;
         this.chatDialogVisible            = true;
         console.log("Opening chat with " + contact.nickName + ":" + contact.address + " with zc=" + contact.conversationAddress );
         this.$store.dispatch('renderChat', contact);
      },

      saveContact (contactForm) {
         console.log(contactForm);
         this.$store.commit('addOrUpdateContact',contactForm);
         this.$store.dispatch('saveContacts');
         this.contactDialogVisible = false;
      },

      sendToContact (chatForm) {
        log("Send a memo to " + chatForm.nickName + " consisting of " + chatForm.memo);
        var memoLength = chatForm.memo.length;
        log("Memo length = " + memoLength);

        if (memoLength <= 512) {
            this.$store.dispatch('sendMemoToContact',this.chatForm);
        } else {
            // TODO: multipart
            log("Multipart HushList memo not implemented yet!");
        }
      },

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