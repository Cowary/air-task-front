<template>
  <div class="container">
    <!-- Кнопка возврата на главную -->
    <router-link to="/" class="back-button">← На главную</router-link>

    <!-- Заголовок приложения -->
    <h1>📋 Еженедельные задачи</h1>
    <p class="subtitle">Отслеживание выполнения задач на текущей неделе</p>

    <!-- Переключатель режима просмотра -->
    <div class="view-toggle">
      <button 
        @click="viewMode = 'statistics'" 
        class="toggle-btn"
        :class="{ active: viewMode === 'statistics' }"
      >
        📊 Статистика
      </button>
      <button 
        @click="viewMode = 'manage'" 
        class="toggle-btn"
        :class="{ active: viewMode === 'manage' }"
      >
        ⚙️ Управление задачами
      </button>
    </div>

    <!-- Режим статистики -->
    <div v-if="viewMode === 'statistics'">
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

    <!-- Режим управления задачами -->
    <div v-if="viewMode === 'manage'" class="manage-view">
      <div class="manage-header">
        <h2>Управление задачами</h2>
        <button @click="openCreateModal" class="create-btn">+ Создать задачу</button>
      </div>

      <div v-if="loadingTasks" class="loading">
        <div class="spinner"></div>
        <p>Загрузка задач...</p>
      </div>

      <div v-else-if="errorTasks" class="error-message">
        <p>❌ {{ errorTasks }}</p>
        <button @click="loadAllTasks" class="retry-btn">Повторить</button>
      </div>

      <div v-else>
        <div v-if="allTasks.length === 0" class="empty-message">
          <p>Нет задач. Создайте первую задачу!</p>
        </div>

        <div v-else class="task-list">
          <div v-for="task in allTasks" :key="task.id" class="task-card manage-card">
            <div class="task-info">
              <div class="task-project" v-if="getProjectName(task.projectId)">
                📁 {{ getProjectName(task.projectId) }}
              </div>
              <div class="task-name">{{ task.name }}</div>
              <div class="task-meta">
                <span class="task-count">Количество: {{ task.count }}</span>
                <span class="task-priority" :class="`priority-${task.priority.toLowerCase()}`">
                  {{ getPriorityLabel(task.priority) }}
                </span>
                <span class="task-status" :class="`status-${task.status.toLowerCase()}`">
                  {{ getStatusLabel(task.status) }}
                </span>
              </div>
            </div>
            <div class="task-actions">
              <button @click="openEditModal(task)" class="action-btn edit-btn">✏️</button>
              <button @click="confirmDelete(task)" class="action-btn delete-btn">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для создания/редактирования задачи -->
    <div v-if="showTaskModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3>{{ editingTask ? 'Редактировать задачу' : 'Создать новую задачу' }}</h3>
        
        <form @submit.prevent="saveTask" class="task-form">
          <div class="form-group">
            <label for="taskName">Название задачи *</label>
            <input 
              id="taskName" 
              v-model="taskForm.name" 
              type="text" 
              required 
              placeholder="Введите название задачи"
            />
          </div>

          <div class="form-group">
            <label for="taskCount">Требуемое количество *</label>
            <input 
              id="taskCount" 
              v-model.number="taskForm.count" 
              type="number" 
              min="1" 
              required 
              placeholder="1"
            />
          </div>

          <div class="form-group">
            <label for="taskProject">Проект *</label>
            <select 
              id="taskProject" 
              v-model.number="taskForm.projectId" 
              required
            >
              <option value="" disabled>Выберите проект</option>
              <option 
                v-for="project in projects" 
                :key="project.id" 
                :value="project.id"
              >
                {{ project.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="taskPriority">Приоритет</label>
            <select 
              id="taskPriority" 
              v-model="taskForm.priority"
            >
              <option value="HIGH">Высокий</option>
              <option value="MIDDLE">Средний</option>
              <option value="LOW">Низкий</option>
            </select>
          </div>

          <div class="form-group">
            <label for="taskStatus">Статус</label>
            <select 
              id="taskStatus" 
              v-model="taskForm.status"
            >
              <option value="IN_PROGRESS">В работе</option>
              <option value="DONE">Выполнено</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">Отмена</button>
            <button type="submit" class="save-btn" :disabled="saving">
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content modal-small" @click.stop>
        <h3>Подтверждение удаления</h3>
        <p>Вы уверены, что хотите удалить задачу "{{ taskToDelete?.name }}"?</p>
        <div class="form-actions">
          <button @click="closeDeleteModal" class="cancel-btn">Отмена</button>
          <button @click="deleteTask" class="delete-btn" :disabled="deleting">
            {{ deleting ? 'Удаление...' : 'Удалить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Импортируем функции для работы с API
import { 
  getWeeklyTaskStatistics, 
  completeWeeklyTask,
  getAllWeeklyTasks,
  getAllProjects,
  createWeeklyTask,
  updateWeeklyTask,
  deleteWeeklyTask
} from '../api/weeklyTasks.js';

export default {
  name: 'WeeklyTaskTracker',
  
  data() {
    return {
      // Режим просмотра: 'statistics' или 'manage'
      viewMode: 'statistics',
      
      // Статистика
      incompleteTasks: [],
      completedTasks: [],
      loading: true,
      completing: false,
      selectedTaskId: null,
      error: null,
      
      // Управление задачами
      allTasks: [],
      loadingTasks: false,
      errorTasks: null,
      projects: [],
      loadingProjects: false,
      
      // Модальное окно задачи
      showTaskModal: false,
      editingTask: null,
      saving: false,
      taskForm: {
        name: '',
        count: 1,
        projectId: null,
        priority: 'MIDDLE',
        status: 'IN_PROGRESS'
      },
      
      // Модальное окно удаления
      showDeleteModal: false,
      taskToDelete: null,
      deleting: false
    };
  },
  
  methods: {
    /* --- Статистика --- */
    
    async loadStatistics() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await getWeeklyTaskStatistics();
        
        if (response.isSuccess) {
          const data = response.data;
          this.completedTasks = data.completedTasks || [];
          this.incompleteTasks = data.incompleteTasks || [];
        } else {
          this.error = response.errorMessage || 'Неизвестная ошибка';
        }
      } catch (err) {
        this.error = 'Не удалось загрузить данные. Проверьте, запущен ли сервер.';
        console.error('Ошибка загрузки:', err);
      } finally {
        this.loading = false;
      }
    },
    
    selectTask(task) {
      if (this.selectedTaskId === task.weeklyTaskId) {
        this.selectedTaskId = null;
      } else {
        this.selectedTaskId = task.weeklyTaskId;
      }
    },
    
    async completeTask() {
      if (!this.selectedTaskId) {
        return;
      }
      
      this.completing = true;
      
      try {
        const response = await completeWeeklyTask(this.selectedTaskId);
        
        if (response.isSuccess) {
          this.selectedTaskId = null;
          await this.loadStatistics();
        } else {
          alert('Не удалось отметить задачу: ' + (response.errorMessage || 'Неизвестная ошибка'));
        }
      } catch (err) {
        alert('Ошибка при отправке данных');
        console.error('Ошибка отправки:', err);
      } finally {
        this.completing = false;
      }
    },
    
    /* --- Управление задачами --- */
    
    async loadAllTasks() {
      this.loadingTasks = true;
      this.errorTasks = null;
      
      try {
        const response = await getAllWeeklyTasks();
        
        if (response.isSuccess) {
          this.allTasks = response.data || [];
        } else {
          this.errorTasks = response.errorMessage || 'Неизвестная ошибка';
        }
      } catch (err) {
        this.errorTasks = 'Не удалось загрузить список задач';
        console.error('Ошибка загрузки задач:', err);
      } finally {
        this.loadingTasks = false;
      }
    },
    
    async loadProjects() {
      this.loadingProjects = true;
      
      try {
        const response = await getAllProjects();
        
        if (response.isSuccess) {
          this.projects = response.data.projects || [];
        }
      } catch (err) {
        console.error('Ошибка загрузки проектов:', err);
      } finally {
        this.loadingProjects = false;
      }
    },
    
    getProjectName(projectId) {
      const project = this.projects.find(p => p.id === projectId);
      return project ? project.name : 'Неизвестный проект';
    },
    
    getPriorityLabel(priority) {
      const labels = {
        'HIGH': 'Высокий',
        'MIDDLE': 'Средний',
        'LOW': 'Низкий'
      };
      return labels[priority] || priority;
    },
    
    getStatusLabel(status) {
      const labels = {
        'IN_PROGRESS': 'В работе',
        'DONE': 'Выполнено'
      };
      return labels[status] || status;
    },
    
    /* --- Создание/редактирование задач --- */
    
    openCreateModal() {
      this.editingTask = null;
      this.taskForm = {
        name: '',
        count: 1,
        projectId: this.projects.length > 0 ? this.projects[0].id : null,
        priority: 'MIDDLE',
        status: 'IN_PROGRESS'
      };
      this.showTaskModal = true;
    },
    
    openEditModal(task) {
      this.editingTask = task;
      this.taskForm = {
        name: task.name,
        count: task.count,
        projectId: task.projectId,
        priority: task.priority,
        status: task.status
      };
      this.showTaskModal = true;
    },
    
    closeModal() {
      this.showTaskModal = false;
      this.editingTask = null;
      this.taskForm = {
        name: '',
        count: 1,
        projectId: null,
        priority: 'MIDDLE',
        status: 'IN_PROGRESS'
      };
    },
    
    async saveTask() {
      if (!this.taskForm.name || !this.taskForm.count || !this.taskForm.projectId) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
      }
      
      this.saving = true;
      
      try {
        let response;
        
        if (this.editingTask) {
          response = await updateWeeklyTask(this.editingTask.id, this.taskForm);
        } else {
          response = await createWeeklyTask(this.taskForm);
        }
        
        if (response.isSuccess) {
          this.closeModal();
          await this.loadAllTasks();
        } else {
          alert('Не удалось сохранить задачу: ' + (response.errorMessage || 'Неизвестная ошибка'));
        }
      } catch (err) {
        alert('Ошибка при сохранении задачи');
        console.error('Ошибка сохранения:', err);
      } finally {
        this.saving = false;
      }
    },
    
    /* --- Удаление задач --- */
    
    confirmDelete(task) {
      this.taskToDelete = task;
      this.showDeleteModal = true;
    },
    
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.taskToDelete = null;
    },
    
    async deleteTask() {
      if (!this.taskToDelete) {
        return;
      }
      
      this.deleting = true;
      
      try {
        const response = await deleteWeeklyTask(this.taskToDelete.id);
        
        if (response.isSuccess) {
          this.closeDeleteModal();
          await this.loadAllTasks();
        } else {
          alert('Не удалось удалить задачу: ' + (response.errorMessage || 'Неизвестная ошибка'));
        }
      } catch (err) {
        alert('Ошибка при удалении задачи');
        console.error('Ошибка удаления:', err);
      } finally {
        this.deleting = false;
      }
    }
  },
  
  watch: {
    viewMode(newMode) {
      if (newMode === 'manage') {
        this.loadAllTasks();
        this.loadProjects();
      }
    }
  },
  
  mounted() {
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

/* Переключатель режима просмотра */
.view-toggle {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
}

.toggle-btn {
  padding: 10px 20px;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background-color: var(--border-color);
}

.toggle-btn.active {
  background-color: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

/* Режим управления задачами */
.manage-view {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.manage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--border-color);
}

.manage-header h2 {
  color: var(--text-primary);
  margin: 0;
}

.create-btn {
  padding: 10px 20px;
  background-color: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.create-btn:hover {
  background-color: #5a6fd6;
}

/* Карточка задачи в режиме управления */
.manage-card {
  cursor: default;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.manage-card:hover {
  box-shadow: 0 2px 8px var(--shadow-color);
}

.task-info {
  flex: 1;
}

.task-meta {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.task-count {
  font-size: 12px;
  color: var(--text-secondary);
}

.task-priority,
.task-status {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 500;
}

/* Приоритеты */
.priority-high {
  background-color: var(--accent-red-light);
  color: var(--accent-red);
}

.priority-middle {
  background-color: var(--accent-orange-light);
  color: var(--accent-orange);
}

.priority-low {
  background-color: var(--accent-green-light);
  color: var(--accent-green);
}

/* Статусы */
.status-in_progress {
  background-color: var(--accent-blue-light);
  color: var(--accent-blue);
}

.status-done {
  background-color: var(--accent-green-light);
  color: var(--accent-green);
}

/* Кнопки действий */
.task-actions {
  display: flex;
  gap: 8px;
  margin-left: 15px;
}

.action-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background-color: var(--bg-tertiary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background-color: var(--border-color);
}

.edit-btn:hover {
  background-color: var(--accent-blue-light);
  color: var(--accent-blue);
}

.delete-btn:hover {
  background-color: var(--accent-red-light);
  color: var(--accent-red);
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background-color: var(--bg-primary);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-small {
  max-width: 400px;
}

.modal-content h3 {
  color: var(--text-primary);
  margin-top: 0;
  margin-bottom: 20px;
}

.modal-content p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

/* Форма */
.task-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-group input,
.form-group select {
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.form-group select {
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.cancel-btn,
.save-btn,
.delete-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.cancel-btn:hover {
  background-color: var(--border-color);
}

.save-btn {
  background-color: var(--accent-primary);
  color: white;
}

.save-btn:hover:not(:disabled) {
  background-color: #5a6fd6;
}

.save-btn:disabled {
  background-color: var(--text-muted);
  cursor: not-allowed;
}

.delete-btn {
  background-color: var(--accent-red);
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background-color: #d32f2f;
}

.delete-btn:disabled {
  background-color: var(--text-muted);
  cursor: not-allowed;
}
</style>
