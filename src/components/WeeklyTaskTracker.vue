<template>
  <div class="container">
    <!-- Кнопка возврата на главную -->
    <router-link to="/" class="back-button">← На главную</router-link>

    <!-- Заголовок приложения -->
    <h1>📋 Еженедельные задачи</h1>
    <p class="subtitle">Отслеживание выполнения задач на текущей неделе</p>

    <!-- Состояние загрузки: показываем, если данные ещё загружаются -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Загрузка данных...</p>
    </div>

    <!-- Состояние ошибки: показываем, если произошла ошибка при загрузке -->
    <div v-else-if="error" class="error-message">
      <p>❌ {{ error }}</p>
      <!-- Кнопка для повторной попытки загрузки -->
      <button @click="loadStatistics" class="retry-btn">Повторить</button>
    </div>

    <!-- Основной контент: показываем, когда данные загружены и нет ошибок -->
    <div v-else class="content">
      
      <!-- Секция невыполненных задач -->
      <div class="section incomplete-section">
        <h2>⏳ Невыполненные задачи</h2>
        
        <!-- Проверяем, есть ли невыполненные задачи -->
        <div v-if="incompleteTasks.length === 0" class="empty-message">
          <p>Все задачи выполнены! 🎉</p>
        </div>
        
        <!-- Список невыполненных задач -->
        <div v-else class="task-list">
          <div 
            v-for="task in incompleteTasks" 
            :key="task.weeklyTaskId" 
            class="task-card incomplete"
            :class="{ selected: selectedTaskId === task.weeklyTaskId }"
            @click="selectTask(task)"
          >
            <!-- Название проекта (если есть) -->
            <div class="task-project" v-if="task.projectName">
              📁 {{ task.projectName }}
            </div>
            
            <!-- Название задачи -->
            <div class="task-name">{{ task.weeklyTaskName }}</div>
            
            <!-- Прогресс выполнения -->
            <div class="task-progress">
              <div class="progress-bar">
                <!-- Ширина бара зависит от процента выполнения -->
                <div 
                  class="progress-fill" 
                  :style="{ width: task.completionPercentage }"
                ></div>
              </div>
              <span class="progress-text">
                {{ task.completedCount }} / {{ task.requiredCount }} ({{ task.completionPercentage }})
              </span>
            </div>
            
            <!-- Индикатор выбора задачи -->
            <div v-if="selectedTaskId === task.weeklyTaskId" class="selected-indicator">
              ✓ Выбрано
            </div>
          </div>
        </div>

        <!-- Кнопка для отметки выбранной задачи выполненной -->
        <button 
          v-if="incompleteTasks.length > 0"
          @click="completeTask" 
          class="complete-btn"
          :disabled="!selectedTaskId || completing"
        >
          {{ completing ? 'Отправка...' : 'Отметить выполненной' }}
        </button>
      </div>

      <!-- Секция выполненных задач -->
      <div class="section completed-section">
        <h2>✅ Выполненные задачи</h2>
        
        <!-- Проверяем, есть ли выполненные задачи -->
        <div v-if="completedTasks.length === 0" class="empty-message">
          <p>Пока нет выполненных задач</p>
        </div>
        
        <!-- Список выполненных задач -->
        <div v-else class="task-list">
          <div 
            v-for="task in completedTasks" 
            :key="task.weeklyTaskId" 
            class="task-card completed"
          >
            <!-- Название проекта (если есть) -->
            <div class="task-project" v-if="task.projectName">
              📁 {{ task.projectName }}
            </div>
            
            <!-- Название задачи -->
            <div class="task-name">{{ task.weeklyTaskName }}</div>
            
            <!-- Прогресс выполнения -->
            <div class="task-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width: 100%"></div>
              </div>
              <span class="progress-text">
                {{ task.completedCount }} / {{ task.requiredCount }} (100%)
              </span>
            </div>
            
            <!-- Статус "Выполнено сегодня" -->
            <div v-if="task.completedToday" class="completed-today">
              ✓ Выполнено сегодня
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
// Импортируем функции для работы с API
import { getWeeklyTaskStatistics, completeWeeklyTask } from '../api/weeklyTasks.js';

export default {
  // Имя компонента (полезно для отладки)
  name: 'WeeklyTaskTracker',
  
  // Данные (состояние) компонента
  data() {
    return {
      // Массив невыполненных задач
      incompleteTasks: [],
      // Массив выполненных задач
      completedTasks: [],
      // Флаг загрузки данных
      loading: true,
      // Флаг процесса отправки данных
      completing: false,
      // ID выбранной задачи (для отметки выполненной)
      selectedTaskId: null,
      // Текст ошибки (если есть)
      error: null
    };
  },
  
  // Методы компонента
  methods: {
    /**
     * Загружает статистику задач с сервера
     * Вызывается при монтировании компонента и при нажатии кнопки "Повторить"
     */
    async loadStatistics() {
      // Устанавливаем флаги загрузки и сбрасываем ошибку
      this.loading = true;
      this.error = null;
      
      try {
        // Делаем запрос к API
        const response = await getWeeklyTaskStatistics();
        
        // Проверяем, успешен ли ответ от сервера
        if (response.isSuccess) {
          // Извлекаем данные из ответа
          const data = response.data;
          
          // Сохраняем задачи в соответствующие массивы
          this.completedTasks = data.completedTasks || [];
          this.incompleteTasks = data.incompleteTasks || [];
        } else {
          // Если сервер вернул ошибку, показываем её сообщение
          this.error = response.errorMessage || 'Неизвестная ошибка';
        }
      } catch (err) {
        // Если произошла ошибка сети или другая ошибка
        this.error = 'Не удалось загрузить данные. Проверьте, запущен ли сервер.';
        console.error('Ошибка загрузки:', err);
      } finally {
        // В любом случае сбрасываем флаг загрузки
        this.loading = false;
      }
    },
    
    /**
     * Выбирает задачу для отметки выполненной
     * @param {Object} task - Объект задачи
     */
    selectTask(task) {
      // Если уже выбрана эта же задача - снимаем выбор
      if (this.selectedTaskId === task.weeklyTaskId) {
        this.selectedTaskId = null;
      } else {
        // Иначе выбираем новую задачу
        this.selectedTaskId = task.weeklyTaskId;
      }
    },
    
    /**
     * Отмечает выбранную задачу выполненной
     */
    async completeTask() {
      // Проверяем, что задача выбрана
      if (!this.selectedTaskId) {
        return;
      }
      
      // Устанавливаем флаг процесса отправки
      this.completing = true;
      
      try {
        // Отправляем запрос на сервер
        const response = await completeWeeklyTask(this.selectedTaskId);
        
        if (response.isSuccess) {
          // Если успешно - сбрасываем выбор
          this.selectedTaskId = null;
          // Перезагружаем данные, чтобы получить актуальную статистику
          await this.loadStatistics();
        } else {
          // Если сервер вернул ошибку
          alert('Не удалось отметить задачу: ' + (response.errorMessage || 'Неизвестная ошибка'));
        }
      } catch (err) {
        // Если произошла ошибка
        alert('Ошибка при отправке данных');
        console.error('Ошибка отправки:', err);
      } finally {
        // Сбрасываем флаг процесса отправки
        this.completing = false;
      }
    }
  },
  
  // Хук жизненного цикла: вызывается после монтирования компонента в DOM
  mounted() {
    // Загружаем статистику при открытии страницы
    this.loadStatistics();
  }
};
</script>

<style scoped>
/* 
 * Основной контейнер
 * Ограничиваем ширину и добавляем отступы
 */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Заголовок */
h1 {
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 5px;
}

.subtitle {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 30px;
}

/* Состояние загрузки */
.loading {
  text-align: center;
  padding: 50px;
}

.spinner {
  border: 4px solid var(--spinner-bg);
  border-top: 4px solid var(--accent-primary);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Сообщение об ошибке */
.error-message {
  text-align: center;
  padding: 30px;
  background-color: var(--accent-red-light);
  border-radius: 8px;
  color: var(--accent-red);
}

.retry-btn {
  margin-top: 15px;
  padding: 10px 20px;
  background-color: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.retry-btn:hover {
  background-color: #5a6fd6;
}

/* Секции */
.section {
  margin-bottom: 30px;
}

.section h2 {
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.incomplete-section h2 {
  border-bottom-color: var(--accent-orange);
}

.completed-section h2 {
  border-bottom-color: var(--accent-green);
}

/* Пустое состояние */
.empty-message {
  text-align: center;
  padding: 20px;
  color: var(--text-muted);
  background-color: var(--bg-tertiary);
  border-radius: 8px;
}

/* Список задач */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Карточка задачи */
.task-card {
  padding: 15px;
  border-radius: 8px;
  background-color: var(--bg-secondary);
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.task-card:hover {
  box-shadow: 0 2px 8px var(--shadow-color);
}

/* Стили для невыполненных задач */
.task-card.incomplete {
  border-left: 4px solid var(--accent-orange);
}

.task-card.incomplete:hover,
.task-card.incomplete.selected {
  background-color: var(--accent-orange-light);
  border-color: var(--accent-orange);
}

.task-card.incomplete.selected {
  box-shadow: 0 0 0 2px var(--accent-orange);
}

/* Стили для выполненных задач */
.task-card.completed {
  border-left: 4px solid var(--accent-green);
  background-color: var(--accent-green-light);
}

/* Название проекта */
.task-project {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 5px;
}

/* Название задачи */
.task-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 10px;
}

/* Прогресс выполнения */
.task-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: var(--border-light);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--accent-orange);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.task-card.completed .progress-fill {
  background-color: var(--accent-green);
}

.progress-text {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}

/* Индикатор выбора */
.selected-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--accent-orange);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* Индикатор "Выполнено сегодня" */
.completed-today {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--accent-green);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* Кнопка отметки выполненной */
.complete-btn {
  display: block;
  width: 100%;
  padding: 15px;
  margin-top: 15px;
  background-color: var(--accent-orange);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.complete-btn:hover:not(:disabled) {
  background-color: #f57c00;
}

.complete-btn:disabled {
  background-color: var(--text-muted);
  cursor: not-allowed;
}

/* Кнопка возврата на главную */
.back-button {
  display: inline-block;
  padding: 8px 16px;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  text-decoration: none;
  border-radius: 5px;
  font-size: 14px;
  margin-bottom: 15px;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: var(--border-color);
}
</style>
