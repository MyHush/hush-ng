<template>
    <el-container>
      <el-aside width="300px" >
        <div class="messenger-title"> Messenger</div>
        <div>
          <div class="subtitle"> Lists </div>  
          <div class="subtitle"> Groups </div> 
          <div class="subtitle"> Conversations </div> 
        </div>
      </el-aside>
      <el-main> 
        <router-view></router-view>
      </el-main>
    </el-container>    
</template>

<script>
  import CloseButton from '../shared/CloseButton'
  import { mapState } from 'vuex'

  export default {
    name: 'messenger-menu',
    components: { CloseButton },
     props: {
      isEnabled: {
        type: Boolean,
        default: true
      }
    },
    computed: { 
      ...mapState([         
          'blockHeight',
          'peerCount'                
        ]), 
    },
    data () {
      return {
        connStatus: 'Connecting...',
        connectedToDeamon: false,
        walletSections: [
          { 'name': 'addresses', 'path': '/wallet/addresses', 'active': true },
          { 'name': 'transactions', 'path': '/wallet/transactions', 'active': false }
        ]
      }
    },
    methods: {
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
    
  .messenger-title {
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
