import Vue from 'vue'
import axios from 'axios'
import App from './App'
import router from './router'
import store from './store'
import VueI18n from 'vue-i18n'
import messages from '../lang/messages'
//import dateTimeFormats from './lang/dateTimeFormats'
//import numberFormats from './lang/numberFormats'

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

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

// Change default lang to EN from CN
// http://element.eleme.io/#/en-US/component/i18n
import locale from 'element-ui/lib/locale/lang/en'
Vue.use(ElementUI, { locale });
import { Popover, Tooltip } from 'element-ui';
Vue.use(Popover);
Vue.use(Tooltip);
Vue.component('icon', Icon)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
