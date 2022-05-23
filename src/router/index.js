import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from './Login'
import Home from './Home'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  routes: [
    Login,
    Home,
    {
      path: '/',
      redirect: '/login'
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    return next()
  }
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) {
    return next('/login')
  } else {
    next()
  }
})

export default router
