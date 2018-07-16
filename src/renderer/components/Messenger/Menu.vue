<template>
    <el-container>
      <el-aside width="300px" >
        <div class="hushlist-title"> HushList</div>
        <div>
          <div class="subtitle"> {{$t('message.contacts')}} </div>  
          <div class="subtitle"> {{$t('message.lists')}} </div> 
          <div class="subtitle"> {{$t('message.conversations')}} <div style="float:right" @click="startConversation" > <icon name="plus"  /> </div> </div> 
        </div>
      </el-aside>
      <el-main> 
        <router-view></router-view>
      </el-main>

      <el-dialog v-bind:title="$t('message.start_a_conversation')" :visible.sync="startConversationDialogVisible" width="60%" >
        <el-form :model="receiverAddressForm">
          <el-form-item label="Name" label-width="100px">
           
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">         
          <el-button @click="startConversationDialogVisible = false">{{$t('message.cancel')}}</el-button>
          <el-button type="primary" @click="startConversation">{{$t('message.ok')}}</el-button>
        </span>
      </el-dialog>
    </el-container>    
</template>

<script>
  import CloseButton from '../shared/CloseButton'
  import { mapState,mapActions } from 'vuex'

  export default {
    name: 'hushlist-menu',
    components: { CloseButton },
    data () {
       return {   
        receiverAddressForm: {
          adress: null
        },    
        startConversationDialogVisible: false
      }
    },
    computed: { 
      ...mapState([         
          'blockHeight',
          'peerCount'                
        ]), 
    },    
    methods: {        
      startConversation() {
         this.startConversationDialogVisible = true;
      },
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      toggle (item) {
        var self = this
        var item  = item
        for (var i = 0; i < self.walletSections.length; i++) {
          if (i == item) {
            self.walletSections[i].active = true
          } else {
            self.walletSections[i].active = false
          }
        }     
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
    
  .hushlist-title {
    margin-top: 3px;
    font-size: 15pt;
    font-weight: 700;
    text-transform: uppercase;
    color: white;
    padding: 15px 10px 10px 15px;
    width:100%;
    border-bottom: 1px solid white
  }

    .subtitle {
    margin-top: 3px;
    font-size: 12pt;
    font-weight: 700;
    text-transform: uppercase;
    color: white;
    padding: 15px 10px 10px 15px;
    width:100%;
  }

  .el-container {
    margin-left:68px;
    height: 100vh;
  }

  .el-aside {
    height: 100%;
    min-height:100%;
    background-color: #A1A1A1;
    color: #ABABAB;    
  }
</style>