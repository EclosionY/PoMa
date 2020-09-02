import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

  const routes = [
    {
      path: '/',
      name: 'homePage',
      component: ()=>import('../views/homePage.vue')
    },
]

const router = new VueRouter({
  routes
})

export default router
