import { createRouter, createWebHashHistory } from 'vue-router'
import JoinView from '../views/JoinView.vue'
import CreateView from '../views/CreateView.vue'
import IdeView from '../views/CreateView.vue'
import OfflineView from '../views/OfflineView.vue'
import StudentView from '../views/StudentView.vue'
import ProfessorView from '../views/ProfessorView.vue'

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
  },
  {
      path: '/student',
      name: 'student',
      component: StudentView,
      meta: {hideNavbar: true}
  },
  {
      path: '/professor',
      name: 'professor',
      component: ProfessorView,
      meta: {hideNavbar: true}
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
