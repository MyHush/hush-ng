<template>
  <div id="wrapper" >
    <div v-if="true || connectedToDeamon === true" style="height:100%">
      <side-menu></side-menu>
      <router-view></router-view>
    </div>
    <div v-else>
      <div class="inner-content">
        <div id="connecting">{{ connStatus }}</div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import SideMenu from './shared/Menu'
  
  const Repeat = require('repeat')
  var request = require('request')
  var store = require('store')
  var cmd = require('node-cmd')
  const bitcoin = require('bitcoin')
  var hush = require('hush')

  export default {
    name: 'main-page',
    components: {SideMenu },
   
    computed: { 
      ...mapState([
          'walletPolling'                
        ]), 
    },
    data () {
      return {
        connStatus: 'Connecting...',
        connectedToDeamon: false
      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      startPolling (interval) {
        
        var execPath = store.get('execPath')

        // Start Hushd
        var exec = ''
        if (require('os').platform() == 'linux') {
          exec = 'cd ' + execPath + '&& ./hushd'
        } else if (require('os').platform() == 'win32') {
          exec = execPath + '\\hushd.exe'
          console.log(exec)
        }
        cmd.get(
          exec,
          function(err, data, stderr){
              if (!err) {
                 console.log('HushNG: Could not start hushd!')
              } else {
                 console.log('HushNG: Started hushd')
              }

          }
        )
 
        var rpcuser = 'rpcuser'
        var rpcpassword = 'rpcpassword'
        var rpcport = 8822

        var config = new hush.Config()
        rpcuser = config.rpcuser()
        rpcpassword = config.rpcpassword()
        rpcport = config.rpcport()

        this.$store.commit('setRpcCredentials', {user : rpcuser, password : rpcpassword, port: rpcport});
        this.$store.commit('setWalletPolling', true);  
        this.$store.dispatch('refreshAddresses');

        var self = this
        Repeat(function() {

          if (self.connectedToDeamon) {
            self.$store.dispatch('refreshAddresses');
            self.$store.dispatch('refreshNetworkStats');                
            self.$store.dispatch('refreshBalances');    
            self.$store.dispatch('refreshTransactions'); 
            self.$store.dispatch('refreshOperations'); 
          }
          else {
            var client = new bitcoin.Client({
              port: rpcport,
              user: rpcuser,
              pass: rpcpassword,
              timeout: 60000
            });

            client.getInfo(function(err, data, resHeaders) {
              if (err) {
                console.log(err)
                if (err.code == "ECONNREFUSED") {
                  self.connStatus = "Connecting..."
                }
                else {
                  self.connStatus = err.message
                }
                return
              } 
              
              self.connectedToDeamon = true
              self.$store.dispatch('refreshAddresses');
              self.$router.push('/wallet/addresses')
            }); 
          }

        }).every(interval, 'ms').start.now();
      }
    },
    mounted: function() {
      if(!this.walletPolling) {
        this.startPolling(5000)
      }
    }
  }
</script>

<style>
 @import url('https://fonts.googleapis.com/css?family=Poppins:300,400,500,700');

  * {
    font-family: 'Poppins', sans-serif;
    color: #2d2d2d;
  }

  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    width: 100vw;
    padding: 0px;
  }

  #logo {
    float: left;
    height: 100px;
    margin-bottom: 40px;
    width: auto;
  }

  #logo-text {
    float: left;
    margin-left: 20px;
    line-height: 100px;
    font-size: 18pt;
    font-weight: bold;
  }

  main {
    clear: left;
    display: flex;
    justify-content: space-between;
  }

  main > div { flex-basis: 50%; }

  .left-side {
    display: flex;
    flex-direction: column;
  }

  .welcome {
    color: #555;
    font-size: 23px;
    margin-bottom: 10px;
  }

  .title {
    color: #2c3e50;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 6px;
  }

  .title.alt {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .install-list {
    color: #555;
    font-weight: initial;
    list-style-type: none;
    margin-bottom: 50px;
  }

  .intall-list li {
    color: #000;
    height: 20px;
  }

  .install-list li code {
    color: #3e3e3e;
    font-weight: bold;
  }

  .progress {
    float: left;
    width: 10px;
    height: 10px;
    margin-top: 6px;
    margin-right: 5px;
    border-radius: 50%;
    background-color: #d1d1d1;
  }

  #connecting {
    text-align: center;
    line-height: 80vh;
    font-size: 1.2em;
  }
  .pending {
    border: 2px solid #7ed35f;
    background-color: transparent;
  }

  .success {
    background-color: #7ed35f;
  }

  .error {
    background-color: #ef4049;
  }

  .doc .button {
    font-size: .9em;
    cursor: pointer;
    outline: none;
    padding: 0.75em 2em;
    border-radius: 2em;
    display: inline-block;
    color: #fff;
    background-color: #2F77F7;
    transition: all 0.15s ease;
    box-sizing: border-box;
    border: 1px solid #2F77F7;
    margin-top: 10px;
    text-decoration: none;
    -webkit-app-region: no-drag;
  }

  .inner-content {
    position: absolute;
    width: 100%;
    height: 100%;
    padding: 77px 20px 20px 88.3px;
  }

  .bottom-row {
    clear: both;
    position: fixed;
    bottom: 15px;
  }

  .bottom-row .box {
    float: left;
    width: 300px;
    height: 95px;
    margin-right: 15px;
    padding: 10px 15px 10px 15px;
    background-color: #3e3e3e;
  }

  .bottom-row .alt {
    font-weight: 300;
    font-size: 11pt;
    background-color: #cacaca;
  }

  .bottom-row .box .links {
    position: absolute;
    bottom: 10px;
  }

  .bottom-row .box .links a {
    text-decoration: none;
    cursor: pointer;
    -webkit-app-region: no-drag;
  }

  .bottom-row .box #texts {
    float: left;
    display: list-item;
    list-style-type:none;
    font-weight: 500;
    color: #fff;
  }

  .bottom-row .box #texts li{   
    color: #fff;
  }

  .bottom-row .box #balances {
    float: right;
    text-align: right;
    list-style-type: none;
    color: #fff;
    display: list-item;
  }
  .bottom-row .box #balances li {   
    color: #fff;
  }

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

  .el-table__row .address .cell {
    font-family: 'Courier', sans-serif;
  }

  .el-table__row .balance .cell {
    font-family: 'Courier', sans-serif;
    color: #2f77f7;
  }

  .el-table td, .el-table th {
    padding: 4px 0;
  }

  .el-table__body-wrapper, .el-table__footer-wrapper, .el-table__header-wrapper {
    background-color:#eaeaea;
  }

  el-table__body, .el-table__footer, .el-table__header {    
      background-color:#eaeaea;
  }

  .el-table .gutter {
        background-color:#eaeaea;
  }

  .el-table td, .el-table th.is-leaf {
      background-color:#eaeaea;
      border: none;
  }

  .el-select-dropdown__item.is-disabled {
    color: #c0c4cc;
    cursor: not-allowed;
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
