import { createRouter, createWebHashHistory } from 'vue-router'
import JoinView from '../views/JoinView.vue'
import ChatView from '../views/ChatView.vue'
import CreateView from '../views/CreateView.vue'
import IdeView from '../views/CreateView.vue'
import OfflineView from '../views/OfflineView.vue'

const routes = [
  {path: '/',
    name: 'join',
    component: JoinView
  },
  {
    path: '/chat',
    name: 'chat',
    component: ChatView,
    meta: {hideNavbar: true}
  },
  {
    path: '/create',
    name: 'create',
    component: CreateView
  },
  {
    path: '/ide',
    name: 'ide',
    component: IdeView,
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
