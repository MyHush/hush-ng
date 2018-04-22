import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

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
Vue.use(ElementUI, { locale })
Vue.component('icon', Icon)
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
