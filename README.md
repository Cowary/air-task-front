` block contains a Vue 3 + Vite template description (markdown-like text, not actual code)
2. The `<edit>` block contains a README/documentation in Russian about an Air Task Frontend application

The instructions say the edit is in the form of:
```
// ... existing code ...
FIRST_EDIT
// ... existing code ...
SECOND_EDIT
// ... existing code ...
```

But the edit provided doesn't follow this pattern. It seems like the user wants to replace the content in the code block with the content from the edit block.

Looking at the task more carefully:
- The code block has a Vue 3 + Vite template description
- The edit block has a complete README for "Air Task Frontend"

It appears the user wants to replace the content in the `<code>` tags with the content from the `<edit>` tags.

Since the code block contains documentation/markdown (not actual code), and the edit also contains documentation/markdown, I should simply replace the code content with the edit content.

Let me output the result wrapped in `<code>` tags:


<code>
# Air Task Frontend

Frontend-приложение для отслеживания выполнения еженедельных задач. Разработано с использованием Vue 3, Vite и Axios.

## Возможности

- Просмотр статистики выполнения задач за текущую неделю
- Отображение списка выполненных и невыполненных задач
- Визуальный прогресс выполнения каждой задачи
- Отметка задач как выполненных

## Требования

- Node.js версии 18 или выше
- Docker и Docker Compose (для запуска в контейнере)

## Установка и запуск

### Локальная разработка

1. Установите зависимости:
```bash
npm install
```

2. Запустите dev-сервер:
```bash
npm run dev
```

Приложение будет доступно по адресу http://localhost:5173

3. Убедитесь, что backend-сервер запущен по адресу http://localhost:8090

### Docker

```bash
# Сборка и запуск
docker-compose up --build

# Запуск в фоновом режиме
docker-compose up -d
```

Приложение будет доступно по адресу http://localhost:8080

## Структура проекта

- `src/api/weeklyTasks.js` - API-сервис для работы с задачами
- `src/components/WeeklyTaskTracker.vue` - Основной компонент
- `Dockerfile` - Конфигурация Docker
- `docker-compose.yml` - Конфигурация Docker Compose
- `nginx.conf` - Конфигурация nginx
