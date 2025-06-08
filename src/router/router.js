import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import VerbsView from '@/views/VerbsView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/verbs',
    name: 'verbs',
    component: VerbsView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router