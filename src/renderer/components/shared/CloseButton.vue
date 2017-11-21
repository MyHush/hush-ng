<template>
  <a href="#" class="close" v-on:click="quit"></a>
</template>

<script>
  var store = require('store')
  var cmd = require('node-cmd')
  const bitcoin = require('bitcoin')

  export default {
    name: 'close-button',
    methods: {
        quit () {
          if (store.get('setupComplete') == true) {
            // Kill Hushd process
            if (require('os').platform() == 'linux') {
              cmd.get(
                'pkill hushd',
                function(err, data, stderr){
                    if (!err) {
                       console.log('HushNG: Could not terminate hushd process!')
                    } else {
                       console.log('HushNG: Terminated hushd.exe')
                    }
                }
              )
            }
            else if (require('os').platform() == 'win32') {
              var client = new bitcoin.Client({
                port: 8822,
                user: 'rpcuser',
                pass: store.get('connection').rpcpassword,
                timeout: 60000
              })

              client.stop(function(err, data, resHeaders) {
                if (!err) {
                   console.log('HushNG: Could not terminate hushd process!')
                } else {
                   console.log('HushNG: Terminated hushd.exe')
                }
              })
            }
          }
          require('electron').remote.getCurrentWindow().close();
        }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  .close {
    position: absolute;
    right: 15px;
    top: 15px;
    width: 22px;
    height: 22px;
    opacity: 0.3;
    z-index: 3;
    -webkit-app-region: no-drag;
  }

  .close:hover {
    opacity: 1;
  }

  .close:before, .close:after {
    position: absolute;
    left: 15px;
    content: ' ';
    height: 20px;
    width: 2px;
    background-color: #333;
  }

  .close:before {
    transform: rotate(45deg);
  }

  .close:after {
    transform: rotate(-45deg);
  }


</style>
