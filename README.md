# 🧠 Mind Mate - AI Assistant for Google Workspace University

An intelligent system for university teachers and staff with AI features and Google Workspace integration.

## 🚀 Status

**Ready for Testing** - Gmail module 95% complete, all UI components ready

**In Development:** Google Apps Script integration, real AI generation, Google Sheets database

## ✨ Features

- **Gmail Assistant** - AI categorization, smart prioritization, reply templates, AI-generated responses
- **Analytics Dashboard** - Email statistics, productivity analysis, data visualization
- **AI Documents** - Automated lecture and study material creation
- **Collaboration** - Real-time collaboration with access control
- **Grading System** - Automated grading with AI-powered analysis
- **Settings** - User profile, security, Google Workspace integration

## 🛠 Tech Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, React Context  
**Backend:** Google Apps Script, Google Workspace APIs  
**AI/ML:** Google AI API, Natural Language API

## 🚀 Quick Start

```bash
git clone <repository-url>
cd mind-mate
npm install
npm run dev
```

Open http://localhost:3000

### Environment Setup

Create `.env.local`:
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_AI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=your-script-url
```

### Google Cloud Setup

1. Create Google Cloud Project
2. Enable APIs: Gmail, Drive, Docs, Sheets, Calendar
3. Create OAuth 2.0 credentials
4. Deploy Google Apps Script from `google-apps-script/` folder

## 📊 Progress

| Module | Status | Completion |
|--------|--------|------------|
| Gmail | 🟢 Ready | 95% |
| Dashboard | 🟡 Demo | 80% |
| Documents | 🟡 Demo | 70% |
| Collaboration | 🟡 Demo | 70% |
| Grading | 🟡 Demo | 70% |
| Settings | 🟡 Demo | 80% |

**Overall: 78% Complete**

## 🎯 Roadmap

**Completed:** Planning, Infrastructure, Gmail Module (95%)  
**In Progress:** Testing, Performance Optimization  
**Planned:** AI Reply Assistant, Analytics Dashboard, Document Generator, Collaboration, Grading System

**Next Milestone:** Complete Gmail testing and begin AI assistant implementation

## 🧪 Testing

### Quick Test Checklist
- [ ] Navigation works across all modules
- [ ] Gmail module loads email list (`/email`)
- [ ] Search and filters work
- [ ] Email detail view opens
- [ ] AI reply generation (demo) works
- [ ] Dashboard shows statistics (`/dashboard`)
- [ ] Responsive design on mobile/tablet

### Known Limitations
- API requests use test data
- AI generation is simulated
- Attachments not loaded
- Data not persisted between sessions

## 🤝 Contributing

Contributions welcome! Please test, document, suggest UI/UX improvements, or contribute code.

## 📄 License

This project is being developed as a thesis work. All rights reserved.
