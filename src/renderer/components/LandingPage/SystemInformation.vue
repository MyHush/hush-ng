<template>
  <div id="system-information">
    <div class="title">{{$t('message.informations')}}</div>
    <div class="items">
      <div class="item">
        <div class="name">HushNG:</div>
        <div class="value">{{ version }} {{ branch }}</div>
      </div>
      <div class="item">
        <div class="name">Node:</div>
        <div class="value">{{ node }}</div>
      </div>
      <!--
      <div class="item">
        <div class="name">Platform:</div>
        <div class="value">{{ platform }} {{ arch }}</div>
      </div>
      -->
      <div class="item">
        <div class="name">Electron:</div>
        <div class="value">{{ electron }}</div>
      </div>
      <div class="item">
        <div class="name">VueJS:</div>
        <div class="value">{{ vue }}</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        electron: process.versions['atom-shell'],
        name: 'landing-page',
        node: process.versions.node,
        version: 0.1,
        // TODO: ask git
        branch: 'alpha',
        platform: require('os').platform(),
        arch: require('os').release() + ' ' + require('os').arch(),
        homedir: require('os').homedir(),
        vue: require('vue/package.json').version
      }
    }
  }
</script>

<style scoped>
  #system-information {
    margin-top: 10px;
  }

  #system-information .title {
    font-weight: bold;
  }

  .title {
    color: #888;
    font-size: 18px;
    font-weight: initial;
    letter-spacing: .25px;
    margin-top: 10px;
  }

  .items { margin-top: 8px; }

  .item {
    display: flex;
    margin-bottom: 6px;
  }

  .item .name {
    color: #6a6a6a;
    margin-right: 6px;
  }

  .item .value {
    color: #35495e;
    font-weight: bold;
  }
</style>
