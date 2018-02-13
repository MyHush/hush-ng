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
      path: '/mainpage',
      name: 'main-page',
      component: require('@/components/MainPage').default,
      children : [
        {
          path: '/contacts',
          name: 'contacts-menu',
          component: require('@/components/Contacts/Menu').default,
          children: [
            { path: 'addresses', component: require('@/components/Contacts/Addresses').default },
            { path: 'groups', component: require('@/components/Contacts/Groups').default }
          ]
        },                
        {
          path: '/wallet',
          name: 'wallet-menu',
          component: require('@/components/Wallet/Menu').default,
          children: [
            { path: 'addresses', component: require('@/components/Wallet/Addresses').default },
            { path: 'transactions', component: require('@/components/Wallet/Transactions').default }
          ]
        },
        {
          path: '/messenger',
          name: 'messenger',
          component: require('@/components/Messenger/Menu').default         
        }

      ]
    },        
    { 
      path: '*',
      redirect: '/'
    }
  ]
})
