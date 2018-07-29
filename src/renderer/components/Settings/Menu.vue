<template>
  <div>
    <div>
      <div>
        <div id="sub-menu">
           <div class="menu-title">{{$t('message.hushNG_settings')}}</div>
        </div>
        <close-button></close-button>
      </div>
    </div>
    <div class="inner-content">
     <div class="container" style="height:95%">
        <el-main> 
          <el-form>
            <el-form-item v-bind:label="$t('message.privacy_mode')">
            <el-switch v-model="privacyMode"></el-switch>
            </el-form-item>
            
            <el-form-item v-bind:label="$t('message.rpc_port')">
            <input placeholder="8822"/>
            </el-form-item>

            <el-form-item v-bind:label="$t('message.refresh_interval')"><br>
            <el-slider :max="120" :step="5" :min="5" v-model="refreshInterval"></el-slider>
            </el-form-item>
          </el-form>
        </el-main>
      </div>
    </div>
  </div>   
</template>

<script>
  import CloseButton from '../shared/CloseButton'
  import { mapState,mapActions } from 'vuex'

  export default {
    name: 'hushlist-menu',
    components: { CloseButton },
    data () {
       return {
        privacyMode: false,
        refreshInterval: 20, // seconds
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

  div#sub-menu {
    position: absolute;
    width: 100vw;
    background-color: #fff;
    padding: 10px 10px 10px 88.3px;
    border-bottom: 2px solid #e3e3e3;
    z-index: 1;
  }

      .submenu-sections {
    float: left;
    margin-left: 30px;
    margin-top: -10px;
    margin-bottom: -11px;
    height: 56px;
    -webkit-app-region: no-drag;
  }

  .submenu-sections li {
    list-style-type: none;
    display: inline-block;
    font-size: 12pt;
    font-weight: 500;
    text-transform: uppercase;
    height: 100%;
    line-height: 56px;
  }

  .submenu-sections li:hover {
    cursor: pointer;
    background-color: #e2e2e2;
  }

  .submenu-sections .active {
    border-bottom: 4px solid #cacaca;
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

    .inner-content {
    position: absolute;
    width: 100%;
    height: 100%;
    padding: 77px 20px 20px 88.3px;
  }
</style>