<template>
  <div id="wrapper" style="-webkit-app-region: drag">
    <close-button></close-button>
    <img id="logo" src="~@/assets/logo.png" alt="HushNG Logo">
    <span id="logo-text">HushNG</span>
    <main>
      <div class="left-side">
        <span class="title">
          {{$t('message.welcome_to_hushNG')}}
        </span>
        <system-information></system-information>
      </div>

      <div class="right-side">
        <div class="doc">
          <div class="title">{{$t('message.installing_hushNG')}}</div>
          <ul class="install-list">
            <li v-for="step in installSteps">
              <div class="progress" v-bind:class="{ pending: step.pending, error: step.error, success: step.success }"></div> {{ step.title }}
            </li>
          </ul>
            <router-link class="button primary" to="/wallet" style="font-weight: 600;">{{$t('message.launch_hushNG')}}</router-link><br><br>
            <button class="button button-info" @click="cancelsetup()">{{$t('message.cancel_setup')}}</button><br><br>
        </div>
        <div class="doc">
          <div class="title alt">{{$t('message.join_us')}}</div>
          <button class="button button-alt" @click="open('https://github.com/MyHush')">Github</button>
          <button class="button button-alt" @click="open('https://myhush.org/discord.html')">Discord</button>
          <button class="button button-alt" @click="open('https://twitter.com/MyHushTeam')">Twitter</button>
          <!-- <button class="button button-alt" @click="open('https://fb.me/MyHushTeam')">Facebook</button> -->
          <!-- <button class="button button-alt" @click="open('https://bitcointalk.org/index.php?topic=2008578.0')">Bitcoin Talk</button> -->
          <button class="button button-alt" @click="open('https://reddit.com/r/myhush/')">Reddit</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'
  import CloseButton from './shared/CloseButton'
  import Vue from 'vue'
  let vue = new Vue()

  var https = require('https')
  var fs = require('fs')
  var path = require('path')
  var cmd = require('node-cmd')
  var store = require('store')
  var filepath = require('filepath')
  var hush     = require('hush');
  const hushrpc = require( 'hushrpc' )
  var config = new hush.Config()

  export default {
    name: 'install',
    components: { CloseButton, SystemInformation },
    data () {
      return {
        installSteps: [
          { 'title': 'Bootstrap filesystem', 'pending': false, 'error': false, 'success': false  },
          { 'title': 'Download Hush', 'pending': false, 'error': false, 'success': false },
          { 'title': 'Generate hush.conf', 'pending': false, 'error': false, 'success': false }
          //{ 'title': 'Initialize database', 'pending': false, 'error': false, 'success': false }

        ],
        // TODO: All these URLs are broke, and we need to be installing
        // a fixed version/commit, not the latest Jenkins build
        downloadsLinux: [
          { 'component': 'hushd', 'url': 'https://build.madbuda.me/job/hush-rc/lastSuccessfulBuild/artifact/src/hushd', 'finished': false },
          { 'component': 'hush-cli', 'url': 'https://build.madbuda.me/job/hush-rc/lastSuccessfulBuild/artifact/src/hush-cli', 'finished': false }
        ],
        downloadsWindows: [
          { 'component': 'hushd.exe', 'url': 'https://build.madbuda.me/job/hush-windows/lastSuccessfulBuild/artifact/src/hushd.exe', 'finished': false },
          { 'component': 'hush-cli.exe', 'url': 'https://build.madbuda.me/job/hush-windows/lastSuccessfulBuild/artifact/src/hush-cli.exe', 'finished': false },
          { 'component': 'hush-tx.exe', 'url': 'https://build.madbuda.me/job/hush-windows/lastSuccessfulBuild/artifact/src/hush-tx.exe', 'finished': false }
        ],
        downloads: [ ],
        complete: 0,
        installDone: false
      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      cancelsetup() {

      },
      checkComplete () {
        // Mark Install complete
        var self = this
        if (self.installSteps[0].success == true && self.installSteps[1].success == true && self.installSteps[2].success == true) {
          store.set('setupComplete', true)
          self.installDone = true
        }
      },
      download (url, dest, platform, count) {
        var self = this
        if (fs.existsSync(dest)) {
          console.log('Skipping download of ' + url)
          self.complete++
          if (self.downloads.length == self.complete) {
            self.installSteps[1].success = true
            self.checkComplete()
          }
          return
        }

        var file = fs.createWriteStream(dest, {encoding: 'binary'})
        var request = https.get(url, function(response) {
          response.pipe(file)
          file.on('finish', function() {
            file.end(function() {
              file.close()
            })
          })
        }).on('close', function() {
          console.log('Downloaded:' + url)
          if (platform == 'linux') {
            cmd.get(
                `chmod 774 ` + dest,
                function(err, data, stderr){
                    if (!err) {
                      console.log('HushNG Install: CHMOD SUCCESS')
                    } else {
                      console.log('HushNG Install: CHMOD FAIL')
                    }

                }
            )
          }
          self.downloads[count].finished = true
          console.log(self.downloads[count].finished)
          for (var i = 0; i < self.downloads.length; i++) {
            if (self.downloads[i].finished == true) {
              self.complete++
              console.log(self.complete);
              if (self.downloads.length == self.complete) {
                self.installSteps[1].success = true
                self.checkComplete()
              }
            }
          }
        }).on('error', function(err) { // Handle errors
          fs.unlink(dest); // Delete the file async. (But we don't check the result)
          self.installSteps[1].pending = false
          self.installSteps[1].error = true
          console.log(err.message)
        })
      },
      startInstall () {
        var self = this

        // Make Directory
        self.installSteps[0].pending = true
        if (require('os').platform() == 'linux') {
          var mkdir = 'mkdir -p ' +  require('os').homedir() + '/hush-ng/bin'
          cmd.get(
              mkdir,
              function(err, data, stderr){
                  if (!err) {
                     self.installSteps[0].success = true
                     self.checkComplete()
                     console.log('HushNG Install: Created folder at: ' + require("os").homedir() + '/hush-ng')
                  } else {
                     self.installSteps[0].pending = false
                     self.installSteps[0].error = true
                     console.log('error', err)
                  }

              }
          )
          self.downloads = self.downloadsLinux;
        } else if (require('os').platform() == 'win32') {
          const path = require('path')
          const targetDir = require('os').homedir() + '\\hush-ng\\bin'
          const sep = path.sep
          const initDir = path.isAbsolute(targetDir) ? sep : ''
          targetDir.split(sep).reduce((parentDir, childDir) => {
            const curDir = path.resolve(parentDir, childDir)
            if (!fs.existsSync(curDir)) {
              fs.mkdirSync(curDir)
            }
            console.log('HushNG Install: Created folder at: ' + targetDir)
            self.installSteps[0].success = true
            return curDir
          }, initDir)
          self.downloads = self.downloadsWindows;
        }

        // Check to see if an existing hushd is running
        var installed = 0;
        try {
            var client = new hushrpc.Client({
                port: config.rpcport(),
                user: config.rpcuser(),
                pass: config.rpcpassword(),
                timeout: 60000
            });

            var getInfo = client.getInfo();
            if (getInfo) {
                console.log(getInfo);
                var msg = this.$t('hushd_is_already_running');
                vue.$message(msg);
                console.log(msg);
                installed = 1;
            }
        } catch(err) {
            // Is this a great idea, or should it ask before downloading?
            console.log("Did not detect a local running hushd, will try to download...");
            if(err) console.log(err);
        }

        if (!installed) {
            // Download binaries
            self.complete = 0
            self.installSteps[1].pending = true
            var platform = require('os').platform()
            var path = require('filepath').create(require('os').homedir())
            path = path.append('hush-ng', 'bin')
            store.set('execPath', path.toString())
            for (var i = 0; i < self.downloads.length; i++) {
            var dpath = require('filepath').create(path).append(self.downloads[i].component)
            self.download(self.downloads[i].url, dpath.toString(), platform, i)
            }
        
            // Initiate Hush.conf
            self.installSteps[2].pending = true
            var currentdate = new Date();
            var compileTime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds()
            if (platform == "linux") {
            var path = require('os').homedir() + '/.hush/'
            var conffile = path + "hush.conf" 
            if (!fs.existsSync(conffile)) {
                var stream = fs.createWriteStream(conffile)
                var rpcpassword = Math.random().toString(36).slice(2)

                store.set('connection', { rpcuser: 'rpcuser', rpcpassword: rpcpassword })

                stream.once('open', function(fd) {
                stream.write("# HUSH Configuration File\n\n")
                stream.write("# This file has been automatically generated by Hush Config Generator. It may be further customized by hand only.\n\n")
                stream.write("# Creation date: " + compileTime + "\n\n")
                stream.write("# The rpcuser/rpcpassword are used for the local call to hushd. The rpcpassword was randomly set.\n\n")
                stream.write("# Start Hush Configuration\n\n")
                stream.write("daemon=1\nserver=1\nrpcallowip=127.0.0.1\nrpcuser=rpcuser\nrpcpassword=" + rpcpassword + "\n\nshowmetrics=1\naddnode=explorer.myhush.org\naddnode=dnsseed.myhush.org\naddnode=stilgar.myhush.org")
                stream.end();
                });
            }
            self.installSteps[2].success = true
            } else if (platform == "win32") {
            if (!fs.existsSync(process.env.APPDATA + '\\Hush')) {
                fs.mkdirSync(process.env.APPDATA + '\\Hush')
            }
            var path = process.env.APPDATA + '\\Hush'
            var conffile = path + "\\hush.conf"
            if (!fs.existsSync(conffile)) {
                var stream = fs.createWriteStream(conffile)
                var rpcpassword = Math.random().toString(36).slice(2)

                store.set('connection', { rpcuser: 'rpcuser', rpcpassword: rpcpassword })

                stream.once('open', function(fd) {
                stream.write("# HUSH Configuration File\r\n")
                stream.write("# This file has been automatically generated by Hush Config Generator. It may be further customized by hand only.\r\n")
                stream.write("# Creation date: " + compileTime + "\r\n")
                stream.write("# The rpcuser/rpcpassword are used for the local call to hushd. The rpcpassword was randomly set.\r\n")
                stream.write("# Start Hush Configuration\r\n")
                stream.write("daemon=1\r\nserver=1\r\nrpcallowip=127.0.0.1\r\nrpcuser=rpcuser\r\nrpcpassword=" + rpcpassword + "\r\nshowmetrics=1\r\naddnode=explorer.myhush.org\r\naddnode=dnsseed.myhush.org\r\naddnode=stilgar.myhush.org")
                stream.end();
                });
            }
            self.installSteps[2].success = true
            }
        }
        self.checkComplete()
      }
    },
    mounted: function() {
      this.startInstall()
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

  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    padding: 60px 80px;
    width: 100vw;
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

  .doc .button:hover {
    background-color: #2262d6;
  }

  .doc .button-alt {
    color: #3e3e3e;
    margin-right: 5px;
    background-color: transparent;
  }

  .doc .button-alt:hover {
    background-color: #e2e2e2;
  }

  .doc .button-info {
    border-color: #3e3e3e;
    color: #3e3e3e;
    margin-right: 5px;
    background-color: transparent;
  }

  .doc .button-info:hover {
    background-color: #e2e2e2;
  }
</style>
