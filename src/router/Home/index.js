import Categories from '../shopManage/categories.js'
import Goods from '../shopManage/goods.js'
import Params from '../shopManage/params.js'
import Add from '../shopManage/add.js'
import Orders from '../Order/order.js'
import Report from '../Report/index.js'

export default {
  path: '/home',
  component: () => import('@/components/Home'),
  children: [
    {
      path: 'welcome',
      component: () => import('@/components/Welcome')
    },
    {
      path: 'users',
      component: () => import('@/components/User/Users.vue')
    },
    {
      path: 'rights',
      component: () => import('@/components/Power/Rights.vue')
    },
    {
      path: 'roles',
      component: () => import('@/components/Power/Roles.vue')
    },
    Categories.categories,
    Goods.goods,
    Params.params,
    Add.add,
    Orders.orders,
    Report.report,
    {
      path: '/home',
      redirect: '/home/welcome'
    }
  ]
}
