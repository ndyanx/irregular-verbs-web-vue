import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import VerbsView from '@/views/VerbsView.vue'
import WordView from '@/views/WordView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

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
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notfound',
    component: NotFoundView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
