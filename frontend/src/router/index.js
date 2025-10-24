import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'
import Home from '../views/Home.vue'
import Listar from '../views/Listar.vue'
import Criar from '../views/Criar.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Home',
        component: Home
      },
      {
        path: 'listar',
        name: 'Listar',
        component: Listar
      },
      {
        path: 'criar',
        name: 'Criar',
        component: Criar
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
