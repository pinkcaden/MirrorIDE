import { createRouter, createWebHashHistory } from 'vue-router'
import JoinView from '../views/JoinView.vue'
import CreateView from '../views/CreateView.vue'
import IdeView from '../views/CreateView.vue'
import OfflineView from '../views/OfflineView.vue'
import FakeIDEView from '../views/FakeIDEView.vue'

const routes = [
  {
    path: '/',
    name: 'join',
    component: JoinView
  },
  {
    path: '/create',
    name: 'create',
    component: CreateView
  },
  {
    path: '/ide',
    name: 'ide',
    component: FakeIDEView,
    meta: {hideNavbar: true}
  },
  {
      path: '/offline',
      name: 'offline',
      component: OfflineView
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
