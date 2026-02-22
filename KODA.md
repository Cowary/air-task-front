` tags with the edit from the `<edit>` tags. Looking at both, they appear to be documentation files (KODA.md) rather than actual code. 

The edit seems to be an updated version of the documentation with some additions and modifications. I need to apply these changes to the original code.

Looking at the structure:
- The original code has sections like "Архитектура", "Сборка и запуск", "Взаимодействие с Backend", etc.
- The edit adds new sections and modifies existing ones

Let me compare the two to understand what changes need to be made:

1. In "Архитектура" section - the edit adds `├── public/                         # Статические файлы (пустая директория)`, changes `nginx.conf` to `nginx.conf.template`, and adds `├── Jenkinsfile                     # Конвейер CI/CD для Jenkins`

2. In "Локальная разработка" - adds info about backend URL and how to change it

3. In "Запуск в Docker" - adds info about changing backend URL in Docker

4. "Взаимодействие с Backend" section is modified to include info about VITE_BACKEND_URL environment variable

5. "Структура кода" section - modified to explain the apiClient and VITE_BACKEND_URL

6. "Особенности разработки" section - completely restructured to focus on backend configuration

7. Adds new "CI/CD" section with Jenkins info

8. "Правила разработки" - modified to mention Composition API via `<script setup>` in App.vue

9. Various other modifications throughout

Since this is a documentation file (markdown), I need to apply the edits as described. The format shows that the edit contains the new full version of the documentation. So I should output the merged result which would be the content from the edit tags.

Wait, let me re-read the instructions. The edit shows:


I'll carefully compare the original and edited sections to ensure precise merging. The edit appears to be a comprehensive update to the entire documentation, so I'll focus on capturing all the nuanced changes and additions across different sections of the markdown file.

The key is to integrate the new information seamlessly, preserving the original document's structure while incorporating the expanded details about configuration, CI/CD, and development practices.

I'll meticulously review each section, ensuring that the modifications enhance the original documentation without losing its core intent. The goal is to create a cohesive, updated version that reflects the latest insights and best practices.


<code>
# KODA.md — Инструкции для работы с проектом air-task-front

## Обзор проекта

**air-task-front** — это frontend-приложение для отслеживания выполнения еженедельных задач. Разработано с использованием Vue 3, Vite и Axios. Приложение взаимодействует с backend-сервером (air-task-back) для получения и управления задачами.

### Основные технологии

| Технология | Версия | Назначение |
|------------|--------|------------|
| Vue | ^3.5.25 | JavaScript-фреймворк для создания пользовательских интерфейсов |
| Vite | ^7.3.1 | Инструмент для сборки и разработки |
| Axios | ^1.13.5 | HTTP-клиент для выполнения запросов к API |
| Nginx | alpine | Веб-сервер для production-сборки |
| Docker | — | Контейнеризация приложения |

### Архитектура

```
air-task-front/
├── src/
│   ├── api/
│   │   └── weeklyTasks.js          # API-сервис для работы с backend
│   ├── components/
│   │   ├── HelloWorld.vue          # Шаблонный компонент (не используется)
│   │   └── WeeklyTaskTracker.vue   # Основной компонент трекера задач
│   ├── App.vue                     # Главный компонент приложения
│   ├── main.js                     # Точка входа
│   └── style.css                   # Базовые стили
├── public/                         # Статические файлы (пустая директория)
├── Dockerfile                      # Multi-stage сборка для Docker
├── docker-compose.yml              # Конфигурация Docker Compose
├── nginx.conf.template             # Шаблон конфигурации nginx для production
├── vite.config.js                  # Конфигурация Vite
├── Jenkinsfile                     # Конвейер CI/CD для Jenkins
├── package.json                    # Зависимости проекта
└── air-task-back-spec.json         # OpenAPI спецификация backend (справочно)
```

---

## Сборка и запуск

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера с горячей перезагрузкой
npm run dev

# Сборка для production
npm run build

# Предпросмотр production-сборки
npm run preview
```

**URL приложения в режиме разработки:** http://localhost:5173

**Адрес backend по умолчанию:** http://localhost:8090

**Изменение адреса backend в режиме разработки:**
```bash
VITE_BACKEND_URL=http://your-backend-url:8090 npm run dev
```

### Запуск в Docker

```bash
# Сборка и запуск контейнера
docker-compose up --build

# Запуск в фоновом режиме
docker-compose up -d

# Остановка контейнера
docker-compose down
```

**URL приложения в Docker:** http://localhost:8080

**Изменение адреса backend при запуске в Docker:**
```bash
VITE_BACKEND_URL=http://air-task-back:8090 docker-compose up -d
```

---

## Взаимодействие с Backend

### Требования к Backend

- Backend должен быть запущен по адресу `http://localhost:8090` (по умолчанию)
- Адрес backend настраивается через переменную окружения `VITE_BACKEND_URL`
- Для production необходимо настроить проксирование в nginx

### API-эндпоинты

Приложение использует следующие endpoints backend:

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/completed-weekly/v1/statistics/current-week` | Получение статистики задач за текущую неделю |
| POST | `/api/completed-weekly/v1` | Создание записи о выполненной задаче |

### Формат данных

**GET /api/completed-weekly/v1/statistics/current-week**

Ответ:
```json
{
  "isSuccess": true,
  "data": {
    "completedTasks": [
      {
        "weeklyTaskId": 1,
        "weeklyTaskName": "Задача 1",
        "requiredCount": 5,
        "completedCount": 5,
        "completionPercentage": "100%",
        "projectId": 1,
        "projectName": "Проект А",
        "completedToday": true
      }
    ],
    "incompleteTasks": [
      {
        "weeklyTaskId": 2,
        "weeklyTaskName": "Задача 2",
        "requiredCount": 3,
        "completedCount": 1,
        "completionPercentage": "33%",
        "projectId": 1,
        "projectName": "Проект А",
        "completedToday": false
      }
    ]
  }
}
```

**POST /api/completed-weekly/v1**

Тело запроса:
```json
{
  "weeklyEntityId": 2,
  "completedDate": "2025-01-15T10:30:00.000Z"
}
```

---

## Структура кода

### API-сервис (src/api/weeklyTasks.js)

Содержит функции для взаимодействия с backend:
- `getWeeklyTaskStatistics()` — получение статистики за текущую неделю
- `completeWeeklyTask(weeklyEntityId)` — отметка задачи выполненной
- `apiClient` — экземпляр axios с настроенным baseURL

**Важно:** Axios настроен с использованием переменной окружения `VITE_BACKEND_URL`, которая:
- Встраивается в код при сборке (префикс `VITE_` обязателен)
- По умолчанию использует значение `http://localhost:8090`

### Основной компонент (src/components/WeeklyTaskTracker.vue)

Компонент реализует:
- Загрузку и отображение статистики задач
- Выбор невыполненной задачи для отметки выполненной
- Визуальное отображение прогресса выполнения
- Обработку ошибок и состояний загрузки

### Конфигурация Vite (vite.config.js)

Ключевые настройки:
- **Проксирование API:** Все запросы к `/api` перенаправляются на backend (значение из `VITE_BACKEND_URL`)
- **Порт dev-сервера:** 5173
- **Папка сборки:** `dist`
- **Базовый путь:** `/` (корневой путь домена)

---

## Особенности разработки

### Конфигурация адреса backend

Адрес backend настраивается через переменную окружения `VITE_BACKEND_URL`:

| Способ | Команда |
|--------|---------|
| Локальная разработка | `VITE_BACKEND_URL=http://localhost:8090 npm run dev` |
| Docker сборка | `docker build --build-arg VITE_BACKEND_URL=http://host.docker.internal:8090 .` |
| Docker Compose | `VITE_BACKEND_URL=http://air-task-back:8090 docker-compose up -d` |

### Режим разработки

В режиме разработки (`npm run dev`) API-запросы проксируются через Vite. Это позволяет избежать проблем с CORS, так как запросы к `/api` фактически уходят на backend без прямого обращения к другому домену.

### Production-режим

В production-режиме (Docker) используется nginx с настроенным проксированием:
- Статические файлы раздаются из папки `/usr/share/nginx/html`
- Запросы к `/api/*` проксируются на backend (адрес подставляется через переменную окружения `BACKEND_URL`)
- Используется шаблон `nginx.conf.template` с подстановкой переменных через `envsubst`

**Настройка адреса backend в production:**

В Dockerfile и docker-compose.yml используется переменная `BACKEND_URL` (без префикса VITE_), которая подставляется в nginx.conf.template при запуске контейнера.

---

## CI/CD

### Jenkins

Проект включает `Jenkinsfile` для автоматической сборки и пуша Docker-образа:

**Параметры сборки:**
| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| DOCKER_REGISTRY | cowary | Docker registry (пользователь или организация) |
| IMAGE_NAME | air-task-front | Название образа |
| DOCKER_TAG | latest | Тег образа |
| BACKEND_URL | http://localhost:8090 | URL backend сервера |

**Этапы:**
1. Clean — очистка рабочей директории
2. Checkout — получение исходного кода
3. Build Docker Image — сборка образа
4. Docker Login — вход в Docker Hub (если настроены credentials)
5. Push Image — пуш образа в registry
6. Cleanup — очистка локальных образов

---

## Правила разработки

### Стиль кода

- Используется Vue 3 (Composition API через `<script setup>` в App.vue, Options API в WeeklyTaskTracker.vue)
- JavaScript ES6+ модули
- Подробные комментарии в коде для объяснения логики
- CSS-in-JS через `<style scoped>` в Vue-компонентах
- Названия файлов: kebab-case для компонентов (.vue), camelCase для JS-файлов

### Версионирование

- package.json: `"version": "0.0.0"` (изменяется при необходимости)
- Формат: semver (major.minor.patch)

### Тестирование

Тесты в проекте отсутствуют. При необходимости можно добавить:
- Vitest для unit-тестов
- Cypress или Playwright для E2E-тестов

---

## Расширение функциональности

### Добавление новых API-эндпоинтов

1. Добавить новые функции в `src/api/weeklyTasks.js`
2. Использовать тот же `apiClient` с настроенным baseURL
3. Импортировать функции в нужных компонентах

### Добавление новых компонентов

1. Создать файл в `src/components/`
2. Использовать `.vue` расширение
3. Импортировать в App.vue или другие компоненты

### Изменение адреса backend

Для изменения адреса backend необходимо:
1. **Режим разработки:** Задать переменную `VITE_BACKEND_URL` перед запуском
2. **Docker сборка:** Передать `--build-arg VITE_BACKEND_URL=...` при сборке
3. **Production (Docker Compose):** Задать переменную `VITE_BACKEND_URL` в docker-compose.yml или при запуске

---

## Часто возникающие проблемы

### CORS-ошибки

**Проблема:** `CORS Missing Allow Origin` при запросах к backend

**Решение:**
- Убедиться, что используется правильный адрес backend (проверить переменную VITE_BACKEND_URL)
- Проверить настройки проксирования в vite.config.js (режим разработки) или nginx.conf.template (production)
- Убедиться, что backend разрешает запросы с домена приложения

### Ошибка сборки

**Проблема:** `Failed to resolve import "./App.vue"`

**Решение:** Проверить наличие файла `src/App.vue` в корневой директории src

### Backend недоступен

**Проблема:** Ошибка `Не удалось загрузить данные`

**Решение:**
- Проверить, что backend запущен на правильном порту
- Проверить значение переменной VITE_BACKEND_URL
- Проверить сетевое соединение
- Проверить консоль браузера для деталей ошибки

### Ошибка "Failed to load resource" в production

**Проблема:** Приложение не может загрузить данные после деплоя

**Решение:**
- Проверить, что переменная BACKEND_URL правильно передана в контейнер
- Проверить логи контейнера: `docker logs air-task-front`
- Убедиться, что nginx.conf.template содержит правильную подстановку переменной ${BACKEND_URL}

---

## Контакты и поддержка

Проект разработан для личного использования. При вопросах обращаться к документации или исходному коду.
