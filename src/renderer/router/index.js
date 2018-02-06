import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default
    },
    {
      path: '/install',
      name: 'install',
      component: require('@/components/Install').default
    },
    {
      path: '/contacts',
      name: 'contacts',
      component: require('@/components/Contacts').default,
      children: [
        { path: 'contacts', component: require('@/components/Contacts/Contacts').default },
        { path: 'groups', component: require('@/components/Contacts/Groups').default }
      ]
    },
    {
      path: '/wallet',
      name: 'wallet',
      component: require('@/components/Wallet').default,
      children: [
        { path: 'addresses', component: require('@/components/Wallet/Addresses').default },
        { path: 'transactions', component: require('@/components/Wallet/Transactions').default }
      ]
    },
        
    { 
      path: '*',
      redirect: '/'
    }
  ]
})
