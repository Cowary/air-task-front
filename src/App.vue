<script setup>
import { ref, onMounted } from 'vue'

/**
 * Главный компонент приложения
 * 
 * Использует vue-router для навигации между страницами:
 * - HomePage: главная страница с названием проекта
 * - WeeklyTaskTracker: страница еженедельных задач
 */

// Состояние темы
const isDark = ref(false)

/**
 * Переключение между светлой и тёмной темой
 */
const toggleTheme = () => {
  isDark.value = !isDark.value
  applyTheme()
}

/**
 * Применение темы к документу
 */
const applyTheme = () => {
  if (isDark.value) {
    document.documentElement.setAttribute('data-theme', 'dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('theme', 'light')
  }
}

/**
 * Загрузка сохранённой темы при монтировании
 */
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
  }
  applyTheme()
})
</script>

<template>
  <div class="app-wrapper">
    <!-- Кнопка переключения темы -->
    <button
      class="theme-toggle"
      @click="toggleTheme"
      :title="isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'"
    >
      {{ isDark ? '☀️' : '🌙' }}
    </button>

    <router-view />
  </div>
</template>

<style>
/* 
 * Глобальные стили приложения
 * Эти стили применяются ко всему приложению
 */

/* Сброс базовых отступов */
body {
  margin: 0;
  padding: 0;
}

/* Цвет фона страницы */
#app {
  background-color: var(--bg-primary);
  min-height: 100vh;
  transition: background-color 0.3s ease;
}

/* Обертка приложения */
.app-wrapper {
  position: relative;
}

/* Кнопка переключения темы */
.theme-toggle {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1000;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 2px 8px var(--shadow-color);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.theme-toggle:active {
  transform: scale(0.95);
}
</style>
