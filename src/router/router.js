import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import VerbsView from '@/views/VerbsView.vue'
import AudioView from '@/views/AudioView.vue'

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
    path: '/audio',
    name: 'audio',
    component: AudioView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router