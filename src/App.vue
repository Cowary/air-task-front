<script setup>
/**
 * Главный компонент приложения
 * 
 * Использует vue-router для навигации между страницами:
 * - HomePage: главная страница с названием проекта
 * - WeeklyTaskTracker: страница еженедельных задач
 */
</script>

<template>
  <router-view />
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
  background-color: #f5f5f5;
  min-height: 100vh;
}
</style>
