<script setup>
import packageJson from '../../package.json'

/**
 * Главная страница приложения
 * Отображает название проекта и навигацию
 */
const version = packageJson.version
</script>

<template>
  <div class="home-container">
    <div class="home-content">
      <h1 class="project-title">Air-Task</h1>
      <p class="project-subtitle">Система отслеживания еженедельных задач</p>
      <p class="version">Версия {{ version }}</p>

      <router-link to="/weekly-tasks" class="nav-button">
        Еженедельные задачи
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.home-content {
  text-align: center;
  padding: 40px;
  background: var(--bg-secondary);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  transition: background-color 0.3s ease;
}

.project-title {
  font-size: 3rem;
  margin: 0 0 10px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.project-subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0 0 10px 0;
}

.version {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0 0 20px 0;
}

.nav-button {
  display: inline-block;
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
}

.nav-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.nav-button:active {
  transform: translateY(0);
}
</style>
