import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import WeeklyTaskTracker from '../components/WeeklyTaskTracker.vue'

// Определение маршрутов приложения
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage
  },
  {
    path: '/weekly-tasks',
    name: 'weekly-tasks',
    component: WeeklyTaskTracker
  }
]

// Создание и экспорт роутера
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
