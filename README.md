# 🧠 Mind Mate - AI Assistant for Google Workspace University

An intelligent system for university teachers and staff with AI features and Google Workspace integration.

## 🚀 Status

**In Active Development** - Core infrastructure complete, Docker support added, ready for deployment

**Completed:**
- ✅ Next.js 15 application with TypeScript
- ✅ Google OAuth authentication (NextAuth)
- ✅ Supabase database integration
- ✅ Gmail API integration
- ✅ AI-powered features (Google Gemini)
- ✅ Docker containerization
- ✅ Health check endpoints

**In Development:**
- 🔄 Google Apps Script integration
- 🔄 Real-time AI generation
- 🔄 Advanced analytics

## ✨ Features

### 📧 Gmail Assistant
- AI-powered email categorization and prioritization
- Smart reply templates
- AI-generated email responses using Google Gemini
- Email search and filtering
- Label management

### 📊 Analytics Dashboard
- Email statistics and productivity metrics
- Data visualization with charts
- Activity tracking
- Performance analysis

### 📄 AI Documents
- Automated document creation (lectures, study materials)
- Google Docs/Sheets/Slides integration
- Document versioning
- Template system

### 👥 Collaboration
- Real-time collaboration features
- Access control and permissions
- Document sharing
- Comment system

### 🎓 Grading System
- Automated grading with AI analysis
- Grade tracking and analytics
- Student performance insights

### ⚙️ Settings
- User profile management
- Google Workspace integration settings
- Security preferences
- API key management

## 🛠 Tech Stack

**Frontend:**
- Next.js 15.5.2 (App Router)
- React 19.1.0
- TypeScript 5
- Tailwind CSS 3.4
- React Context for state management

**Backend:**
- Next.js API Routes
- NextAuth 4.24 (Google OAuth)
- Supabase (PostgreSQL database)
- Google Apps Script

**AI/ML:**
- Google Gemini AI (gemini-2.5-flash)
- Google Generative AI SDK
- Natural Language Processing

**Infrastructure:**
- Docker & Docker Compose
- Supabase (database & auth)
- Google Cloud Platform
- Google Workspace APIs (Gmail, Drive, Docs, Sheets)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Docker & Docker Compose (optional, for containerized deployment)
- Google Cloud Project with OAuth credentials
- Supabase project

### Local Development

```bash
# Clone repository
git clone <repository-url>
cd mind-mate

# Install dependencies
npm install

# Set up environment variables
cp env.local.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open http://localhost:3000

### Docker Deployment

```bash
# Create environment file for Docker
cp env.local.example .env.docker
# Edit .env.docker with your credentials

# Build and run with Docker Compose
docker-compose build
docker-compose up -d

# View logs
docker-compose logs -f
```

See [DOCKER.md](./DOCKER.md) for detailed Docker setup instructions.

### Environment Setup

Create `.env.local` with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id_here
NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id_here
NEXT_PUBLIC_GOOGLE_CLOUD_REGION=us-central1

# Google Apps Script
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=your_script_url_here

# Google AI (Gemini)
GOOGLE_AI_API_KEY=your_gemini_api_key_here
GOOGLE_AI_MODEL=gemini-2.5-flash

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_NAME=Mind Mate
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Google Cloud Setup

1. Create a Google Cloud Project
2. Enable required APIs:
   - Gmail API
   - Google Drive API
   - Google Docs API
   - Google Sheets API
   - Google Calendar API
3. Create OAuth 2.0 credentials:
   - Go to APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs:
     - Development: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://yourdomain.com/api/auth/callback/google`
4. Enable Google AI (Gemini) API and generate API key
5. Deploy Google Apps Script from `google-apps-script/` folder

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql` in the SQL Editor
3. Get your project URL and API keys from Settings → API
4. Add keys to `.env.local`

## 📊 Project Structure

```
mind-mate/
├── src/
│   ├── app/              # Next.js App Router pages and API routes
│   ├── components/       # React components
│   ├── contexts/        # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and configurations
│   └── types/           # TypeScript type definitions
├── supabase/            # Database schema
├── google-apps-script/  # Google Apps Script code
├── public/              # Static assets
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose configuration
└── DOCKER.md            # Docker documentation
```

## 🧪 Development

### Available Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Testing

The application includes:
- Health check endpoint: `/api/health`
- Test Gemini endpoint: `/api/ai/test-gemini`
- Dashboard analytics: `/api/analytics/dashboard`

## 📚 Documentation

- [DOCKER.md](./DOCKER.md) - Docker setup and deployment guide
- [env.local.example](./env.local.example) - Environment variables reference

## 🤝 Contributing

This is a university thesis project. Contributions and feedback are welcome!

## 📄 License

This project is being developed as a thesis work. All rights reserved.

## 🙏 Acknowledgments

- Google Workspace APIs
- Supabase for database infrastructure
- Next.js team for the amazing framework
- Google AI (Gemini) for AI capabilities
