<template>
  <div id="wrapper">
    <close-button></close-button>
    <div id="hushng">
      <img id="logo" src="~@/assets/logo.png" alt="electron-vue">
      <span id="logo-text">HushNG</span>
    </div>
    <main>
      <div class="left-side">
        <span class="title">
          Welcome to HushNG!
        </span>
        <system-information></system-information>
      </div>

      <div class="right-side">
        <div class="doc">
          <div class="title">Getting Started</div>
          <p>
            Hush Next-generation is your gateway to the Hush blockchain. Manage your wallets, easily enable mining,
            and use HushList protocol to send and receive encrypted and anonymous messages, which are called memos.
          </p>
          <p>
            Start by downloading the Hush proving-key. Afterwards, your wallet will be initialized and ready for use.
          </p>
          <router-link class="button" to="/install">Initialize wallet</router-link><br><br>
        </div>
        <div class="doc">
          <div class="title alt">Get Involved</div>
          <button class="button button-alt" @click="open('https://github.com/MyHush')">Github</button>
          <button class="button button-alt" @click="open('https://twitter.com/MyHushTeam')">Twitter</button>
          <button class="button button-alt" @click="open('https://reddit.com/r/myhush/')">Reddit</button>
          <button class="button button-alt" @click="open('https://discord.myhush.org')">Discord</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'
  import CloseButton from './shared/CloseButton'

  var store = require('store')

  export default {
    name: 'landing-page',
    components: { CloseButton, SystemInformation },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    },
    mounted: function() {
      if (store.get('setupComplete') == true) {
        this.$router.push('/mainpage')
       
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

  #hushng {
    width: 100%;
    -webkit-app-region: drag;
    height: 100px;
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

  .doc p {
    color: black;
    margin-bottom: 10px;
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
</style>
