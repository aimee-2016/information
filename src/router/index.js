import Vue from 'vue'
import Router from 'vue-router'
import routes from './routers'
import store from '@/store'
import iView from 'iview'
import { setToken, getToken, canTurnTo, setTitle } from '@/libs/util'
import config from '@/config'
const { homeName } = config

Vue.use(Router)
const router = new Router({
  routes
})
const LOGIN_PAGE_NAME = 'login'
const turnTo = (to, access, next) => {
  if (canTurnTo(to.name, access, routes)) next() // 有权限，可访问
  else next({ replace: true, name: 'error_401' }) // 无权限，重定向到401页面
}
router.beforeEach((to, from, next) => {
  iView.LoadingBar.start()
  const token = getToken()
  if (!token && to.name !== LOGIN_PAGE_NAME) {
    // 未登录且要跳转的页面不是登录页
    next({
      name: LOGIN_PAGE_NAME // 跳转到登录页
    })
  } else if(!token && to.name == LOGIN_PAGE_NAME) {
    next()
  } else {
      store.dispatch('getUserInfo').then(user => {
        // 拉取用户信息，通过用户权限和跳转的页面的name来判断是否有权限访问;access必须是一个数组，如：['super_admin'] ['super_admin', 'admin']
        turnTo(to, user.access, next)
        routes.forEach(item => {
          if (store.state.user.menberType === "front" && item.name !== "drag_list_page") {
            item.meta.hideInMenu = true;
          } else if (store.state.user.menberType === "front" && item.name === "drag_list_page") {
            item.meta.hideInMenu = false
          }else if (store.state.user.menberType === "backend" && item.name === "drag_list_page") {
            item.meta.hideInMenu = true;
          } else if (item.meta.icon){
            item.meta.hideInMenu = false;
          }
        });
      }).catch(() => {
        setToken('')
        sessionStorage.removeItem('tokenType')
        sessionStorage.removeItem('token')
        next({
          name: 'login'
        })
      })
  }
})

router.afterEach(to => {
  setTitle(to, router.app)
  iView.LoadingBar.finish()
  window.scrollTo(0, 0)
})

export default router
