# 🔐 Налаштування Google інтеграції для Mind Mate

## 📋 **Що потрібно налаштувати**

### **1. Google Cloud Project**
- Створити проект в Google Cloud Console
- Увімкнути необхідні API
- Створити OAuth 2.0 credentials

### **2. Google OAuth 2.0**
- Налаштувати OAuth consent screen
- Створити OAuth client ID та secret
- Налаштувати redirect URIs

### **3. Google Workspace APIs**
- Gmail API
- Google Drive API
- Google Docs API
- Google Sheets API
- Google Calendar API

---

## 🚀 **Покрокова інструкція**

### **Крок 1: Створення Google Cloud Project**

1. **Перейдіть на** [Google Cloud Console](https://console.cloud.google.com/)
2. **Створіть новий проект** або виберіть існуючий
3. **Запишіть Project ID** - він знадобиться пізніше

### **Крок 2: Увімкнення необхідних API**

У вашому проекті увімкніть наступні API:

```bash
# Gmail API
https://console.cloud.google.com/apis/library/gmail.googleapis.com

# Google Drive API
https://console.cloud.google.com/apis/library/drive.googleapis.com

# Google Docs API
https://console.cloud.google.com/apis/library/docs.googleapis.com

# Google Sheets API
https://console.cloud.google.com/apis/library/sheets.googleapis.com

# Google Calendar API
https://console.cloud.google.com/apis/library/calendar.googleapis.com

# Google AI API (опціонально)
https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
```

### **Крок 3: Налаштування OAuth Consent Screen**

1. **Перейдіть на** [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. **Виберіть User Type:**
   - `External` - для тестування
   - `Internal` - якщо у вас Google Workspace
3. **Заповніть обов'язкові поля:**
   - App name: `Mind Mate`
   - User support email: ваш email
   - Developer contact information: ваш email
4. **Додайте scopes:**
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `.../auth/gmail.readonly`
   - `.../auth/gmail.modify`
   - `.../auth/drive`
   - `.../auth/documents`
   - `.../auth/spreadsheets`
   - `.../auth/calendar`

### **Крок 4: Створення OAuth 2.0 Credentials**

1. **Перейдіть на** [Credentials](https://console.cloud.google.com/apis/credentials)
2. **Натисніть "Create Credentials" → "OAuth 2.0 Client IDs"**
3. **Виберіть Application type: `Web application`**
4. **Заповніть поля:**
   - Name: `Mind Mate Web Client`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `http://localhost:3001/api/auth/callback/google`
     - `http://localhost:3002/api/auth/callback/google`
5. **Натисніть "Create"**
6. **Запишіть Client ID та Client Secret**

### **Крок 5: Налаштування змінних середовища**

1. **Створіть файл `.env.local` в корені проекту**
2. **Додайте наступні змінні:**

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_REGION=us-central1

# Google AI Configuration (optional)
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Google Sheets Configuration
GOOGLE_SHEETS_ID=your-google-sheets-id

# App Configuration
NEXT_PUBLIC_APP_NAME=Mind Mate
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Крок 6: Генерація NEXTAUTH_SECRET**

```bash
# В терміналі виконайте:
openssl rand -base64 32
# Або використайте онлайн генератор: https://generate-secret.vercel.app/32
```

---

## 🔧 **Тестування налаштування**

### **1. Запуск проекту**
```bash
npm run dev
```

### **2. Перевірка авторизації**
1. **Відкрийте** http://localhost:3000
2. **Натисніть "Увійти через Google"**
3. **Авторизуйтесь** через Google
4. **Перевірте** чи з'явився ваш профіль

### **3. Перевірка доступу до Gmail**
1. **Перейдіть на** `/email`
2. **Перевірте** чи завантажуються листи
3. **Перевірте** чи працюють дії з листами

---

## 🐛 **Розв'язання проблем**

### **Проблема: "redirect_uri_mismatch"**
**Рішення:** Перевірте, чи правильно налаштовані redirect URIs в Google Cloud Console

### **Проблема: "access_denied"**
**Рішення:** Перевірте, чи увімкнені необхідні API та scopes

### **Проблема: "invalid_client"**
**Рішення:** Перевірте Client ID та Client Secret в .env.local

### **Проблема: "insufficient_permissions"**
**Рішення:** Перевірте, чи додано всі необхідні scopes в OAuth consent screen

---

## 📚 **Корисні посилання**

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google Drive API Documentation](https://developers.google.com/drive/api)
- [NextAuth.js Documentation](https://next-auth.js.org/)

---

## ✅ **Чек-лист налаштування**

- [ ] Створено Google Cloud Project
- [ ] Увімкнено необхідні API
- [ ] Налаштовано OAuth consent screen
- [ ] Створено OAuth 2.0 credentials
- [ ] Налаштовано .env.local
- [ ] Протестовано авторизацію
- [ ] Перевірено доступ до Gmail

---

## 🚀 **Наступні кроки**

Після успішного налаштування Google інтеграції:

1. **Реалізувати реальну роботу з Gmail API**
2. **Додати Google Drive інтеграцію**
3. **Налаштувати Google Sheets як базу даних**
4. **Реалізувати Google AI функції**

---

**🎉 Успіхів у налаштуванні Google інтеграції!**
