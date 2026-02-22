// Импортируем axios для выполнения HTTP-запросов к серверу
import axios from 'axios';

// Получаем адрес backend из переменной окружения
// В Vite переменные окружения доступны через import.meta.env
// Префикс VITE_ обязателен для переменных, доступных в браузере
// По умолчанию используем localhost:8090
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8090';

// Создаём экземпляр axios с базовой конфигурацией
const apiClient = axios.create({
  // Базовая часть URL для всех запросов
  // Запросы будут уходить напрямую на этот адрес
  baseURL: backendUrl,

  // Заголовки по умолчанию для всех запросов
  headers: {
    'Content-Type': 'application/json'  // говорим серверу, что отправляем JSON
  }
});

/**
 * Получает статистику выполнения задач за текущую неделю
 * 
 * API endpoint: GET /api/completed-weekly/v1/statistics/current-week
 * 
 * Возвращает объект с двумя массивами:
 * - completedTasks: выполненные задачи на этой неделе
 * - incompleteTasks: невыполненные задачи на этой неделе
 * 
 * @returns {Promise} Промис с данными от сервера
 */
export const getWeeklyTaskStatistics = async () => {
  try {
    // Выполняем GET-запрос к API
    const response = await apiClient.get('/api/completed-weekly/v1/statistics/current-week');
    // Возвращаем данные из ответа сервера
    return response.data;
  } catch (error) {
    // Если произошла ошибка, выводим её в консоль для отладки
    console.error('Ошибка при получении статистики:', error);
    // Пробрасываем ошибку дальше, чтобы компонент мог её обработать
    throw error;
  }
};

/**
 * Отмечает задачу как выполненную
 * 
 * API endpoint: POST /api/completed-weekly/v1
 * 
 * @param {number} weeklyEntityId - ID задачи (weekly entity), которую нужно отметить выполненной
 * @returns {Promise} Промис с данными от сервера
 */
export const completeWeeklyTask = async (weeklyEntityId) => {
  try {
    // Формируем тело запроса согласно спецификации OpenAPI
    // completedDate - текущая дата и время в формате ISO
    const requestBody = {
      weeklyEntityId: weeklyEntityId,
      completedDate: new Date().toISOString()
    };
    
    // Выполняем POST-запрос для создания записи о выполненной задаче
    const response = await apiClient.post('/api/completed-weekly/v1', requestBody);
    // Возвращаем данные из ответа сервера
    return response.data;
  } catch (error) {
    // Если произошла ошибка, выводим её в консоль для отладки
    console.error('Ошибка при отметке задачи:', error);
    // Пробрасываем ошибку дальше
    throw error;
  }
};

// Экспортируем объект apiClient на случай, если нужно будет делать другие запросы
export default apiClient;
