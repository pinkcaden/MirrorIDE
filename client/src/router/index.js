import { createRouter, createWebHashHistory } from 'vue-router'
import JoinView from '../views/JoinView.vue'
import CreateView from '../views/CreateView.vue'
import OfflineView from '../views/OfflineView.vue'
import StudentView from '../views/StudentView.vue'
import ProfessorView from '../views/ProfessorView.vue'
import loadtesting from '../views/loadtesting.vue'
import idetesting from '../views/idetesting.vue'

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
  },
  {
      path: '/simulate',
      name: 'simulate',
      component: loadtesting,
      meta: {hideNavbar: true}
  },
    {
        path: '/rundemo',
        name: 'rundemo',
        component: idetesting
    }

]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
