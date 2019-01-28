<template>
  <div id="join-us">
    <div class="title alt">{{$t('message.join_us')}}</div>
    <button class="button button-alt" @click="open('https://github.com/MyHush')">Github</button>
    <button class="button button-alt" @click="open('https://twitter.com/MyHushTeam')">Twitter</button>
    <button class="button button-alt" @click="open('https://reddit.com/r/myhush/')">Reddit</button>
    <!-- <button class="button button-alt" @click="open('https://fb.me/MyHushTeam')">Facebook</button> -->
    <!-- <button class="button button-alt" @click="open('https://bitcointalk.org/index.php?topic=2008578.0')">Bitcoin Talk</button> -->
    <button class="button button-alt" @click="open('https://discord.myhush.org')">Discord</button>
  </div>
</template>

<style scoped>
  #join-us {
    padding-bottom: 10px;
  }

  #join-us .title {
    color: #2c3e50;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 6px;
  }

  #join-us .title .alt {
    font-size: 18px;
    margin-bottom: 10px;
  }

  #join-us .button {
    font-size: .8em;
    font-weight: bold;
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

  #join-us .button:hover {
    background-color: #2262d6;
  }

  #join-us .button-alt {
    font-weight: normal;
    color: #2F77F7;
    margin-right: 5px;
    background-color: transparent;
  }

  #join-us .button-alt:hover {
    background-color: rgba(47,119,247, 0.1);;
  }
</style>
