# Mind Mate - Інструкція по налаштуванню

## Опис проекту

Mind Mate - це інтелектуальний AI-помічник для Google Workspace університету, який автоматизує рутинні завдання та покращує продуктивність викладачів та працівників.

## Технологічний стек

- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS
- **Backend**: Google Apps Script + Google Cloud Functions
- **База даних**: Google Sheets + Firestore
- **AI/ML**: Google AI + Natural Language API
- **Інтеграція**: Google Workspace APIs (Gmail, Docs, Sheets, Calendar)

## Структура проекту

```
mind-mate/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── email/             # Gmail модуль
│   │   ├── dashboard/         # Аналітика
│   │   ├── documents/         # AI-документи
│   │   ├── collaboration/     # Колаборація
│   │   ├── grading/           # Оцінювання
│   │   └── settings/          # Налаштування
│   ├── components/            # React компоненти
│   │   ├── ui/               # UI компоненти
│   │   ├── email/            # Gmail компоненти
│   │   ├── dashboard/        # Аналітика компоненти
│   │   └── ...
│   ├── lib/                  # Утиліти та API
│   │   ├── api/              # API клієнт
│   │   ├── types/            # TypeScript типи
│   │   └── utils/            # Допоміжні функції
│   ├── contexts/             # React контексти
│   └── hooks/                # React хуки
├── google-apps-script/        # Google Apps Script backend
├── public/                    # Статичні файли
└── package.json               # Залежності
```

## Крок 1: Налаштування Next.js проекту

### 1.1 Встановлення залежностей

```bash
cd mind-mate
npm install
```

### 1.2 Запуск проекту в режимі розробки

```bash
npm run dev
```

Проект буде доступний за адресою: http://localhost:3000

## Крок 2: Налаштування Google Cloud Project

### 2.1 Створення Google Cloud Project

1. Перейдіть до [Google Cloud Console](https://console.cloud.google.com/)
2. Створіть новий проект або виберіть існуючий
3. Запишіть Project ID

### 2.2 Включення необхідних API

У Google Cloud Console включіть наступні API:

- Gmail API
- Google Drive API
- Google Docs API
- Google Sheets API
- Google Calendar API
- Google Apps Script API
- Google Cloud Functions API

### 2.3 Створення Service Account

1. Перейдіть до "IAM & Admin" > "Service Accounts"
2. Створіть новий Service Account
3. Завантажте JSON ключ
4. Надайте необхідні ролі (Editor, Apps Script Developer)

## Крок 3: Налаштування Google Apps Script

### 3.1 Створення Google Apps Script проекту

1. Перейдіть до [Google Apps Script](https://script.google.com/)
2. Створіть новий проект
3. Назвіть проект "Mind Mate Backend"

### 3.2 Налаштування файлів

1. Скопіюйте код з `google-apps-script/Code.gs` до основного файлу проекту
2. Створіть новий файл `appsscript.json` та скопіюйте конфігурацію

### 3.3 Налаштування OAuth

1. У файлі `appsscript.json` перевірте OAuth scopes
2. При першому запуску надайте необхідні дозволи

### 3.4 Розгортання як Web App

1. Натисніть "Deploy" > "New deployment"
2. Виберіть тип "Web app"
3. Налаштуйте доступ:
   - Execute as: "Me"
   - Who has access: "Anyone within [your domain]"
4. Натисніть "Deploy"
5. Скопіюйте Web App URL

### 3.5 Налаштування змінних середовища

Створіть файл `.env.local` в корені проекту:

```env
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

## Крок 4: Налаштування Google Sheets

### 4.1 Створення Google Sheets

1. Створіть новий Google Sheets документ
2. Назвіть його "Mind Mate Database"
3. Скопіюйте ID з URL

### 4.2 Створення листів

Створіть наступні листи:

#### EmailTemplates
| ID | Name | Subject | Body | Category | Variables | IsActive |
|----|------|---------|------|----------|-----------|----------|
| template_1 | Відповідь студенту | Відповідь на запит | Доброго дня! Дякую за ваш запит... | student_inquiry | name,question | TRUE |

#### Documents
| ID | Title | Content | Type | Author | Collaborators | Version | LastModified | Tags | Status |
|----|-------|---------|------|--------|---------------|---------|--------------|------|--------|

#### Grades
| ID | StudentID | AssignmentID | Criteria | TotalPoints | Percentage | Grade | SubmittedAt | GradedAt |
|----|-----------|--------------|----------|-------------|------------|-------|-------------|----------|

#### Analytics
| ID | Date | EmailsProcessed | DocumentsCreated | GradesProcessed | ProductivityScore |
|----|------|-----------------|------------------|-----------------|-------------------|

### 4.3 Налаштування доступу

1. Надайте доступ до Google Sheets вашому Service Account
2. Оновіть `SPREADSHEET_ID` в `Code.gs`

## Крок 5: Налаштування Google Workspace

### 5.1 Налаштування Gmail

1. Перейдіть до Gmail налаштувань
2. Увімкніть Gmail API
3. Створіть необхідні мітки (Labels):
   - Academic
   - Administrative
   - Student Inquiry
   - Meeting
   - Deadline
   - Urgent

### 5.2 Налаштування Google Drive

1. Створіть папку "Mind Mate Documents"
2. Налаштуйте права доступу
3. Створіть шаблони документів

## Крок 6: Тестування системи

### 6.1 Тестування Gmail модуля

1. Запустіть Next.js проект
2. Перейдіть до `/email`
3. Перевірте завантаження листів
4. Тестуйте категорізацію та пріоритизацію

### 6.2 Тестування API

1. Перевірте health check: `GET /health`
2. Тестуйте Gmail API: `GET /gmail/emails`
3. Перевірте створення шаблонів: `POST /gmail/templates`

## Крок 7: Розгортання в продакшн

### 7.1 Налаштування домену

1. Налаштуйте кастомний домен для Next.js проекту
2. Оновіть CORS налаштування в Google Apps Script

### 7.2 Налаштування SSL

1. Налаштуйте HTTPS для продакшн середовища
2. Оновіть OAuth redirect URIs

### 7.3 Моніторинг та логування

1. Налаштуйте Google Cloud Logging
2. Створіть алерти для критичних помилок
3. Налаштуйте метрики продуктивності

## Поширені проблеми та рішення

### Проблема: CORS помилки

**Рішення**: Перевірте CORS заголовки в Google Apps Script та налаштування Next.js

### Проблема: Помилки авторизації

**Рішення**: Перевірте OAuth scopes та права доступу Service Account

### Проблема: Помилки Gmail API

**Рішення**: Перевірте налаштування Gmail API та квоти

### Проблема: Повільна робота

**Рішення**: Оптимізуйте запити до API, використовуйте кешування

## Наступні кроки розробки

### Етап 2: AI-асистент для відповідей
- Інтеграція з Google AI
- Генерація відповідей
- Аналіз тону та стилю

### Етап 3: Дашборд аналітики
- Візуалізація даних
- Аналіз продуктивності
- Прогнозування

### Етап 4: AI-документи
- Генерація контенту
- Автоматичне форматування
- Шаблони документів

### Етап 5: Система колаборації
- Управління доступом
- Коментарі та версіонування
- Спільна робота

### Етап 6: Система оцінювання
- Автоматичний розрахунок балів
- Аналіз успішності
- Прогнозування результатів

## Корисні посилання

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google Workspace APIs](https://developers.google.com/workspace)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Підтримка

Для отримання допомоги з налаштуванням або розробкою:

1. Перевірте документацію
2. Подивіться логи в Google Apps Script
3. Перевірте консоль браузера
4. Зверніться до команди розробки

---

**Успіхів у розробці Mind Mate! 🚀**
