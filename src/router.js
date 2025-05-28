import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
// import SketchMap from '@/views/SketchMap.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  // {
  //   path: '/croquis',
  //   name: 'croquis',
  //   component: SketchMap
  // }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router