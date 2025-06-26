import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import VerbsView from '@/views/VerbsView.vue'
import WordView from '@/views/WordView.vue'

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
  },
  {
    path: '/word',
    name: 'word',
    component: WordView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router