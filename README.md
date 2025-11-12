# Immobiliare Maggiolini - Real Estate Platform

> **✅ Split Architecture Completed** - Project now uses cost-optimized deployment with separate frontend and backend.

## 🏗️ Architecture

This project is structured as two independent applications for optimal deployment costs:

- **Frontend** (React + Vite) → Vercel **FREE** hosting
- **Backend** (Express API) → Railway **~$2-3/month**

**Monthly savings**: ~40-50% compared to monolithic deployment

## 📁 Project Structure

```
/
├── frontend/          # React application
├── backend/           # Express API server
└── docs/             # Documentation and QA checklists
```

## 🚀 Quick Start

### Development

1. **Start Backend**:
```bash
cd backend
npm install
cp .env.example .env  # Configure DATABASE_URL and other vars
npm run dev           # Runs on http://localhost:5000
```

2. **Start Frontend** (in another terminal):
```bash
cd frontend
npm install
cp .env.example .env  # Set VITE_API_URL=http://localhost:5000
npm run dev          # Runs on http://localhost:5173
```

3. Open `http://localhost:5173` in your browser

### Production Deployment

**See complete guide**: [DEPLOYMENT.md](DEPLOYMENT.md)

**Quick steps**:
1. Deploy database on [Neon.tech](https://neon.tech) (free)
2. Deploy backend on [Railway](https://railway.app) → [Guide](backend/RAILWAY.md)
3. Deploy frontend on [Vercel](https://vercel.com) → [Guide](frontend/VERCEL.md)

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[frontend/VERCEL.md](frontend/VERCEL.md)** - Frontend deployment
- **[backend/RAILWAY.md](backend/RAILWAY.md)** - Backend deployment  
- **[replit.md](replit.md)** - Technical architecture
- **[docs/QA_CHECKLIST.md](docs/QA_CHECKLIST.md)** - QA testing checklist

## 🎯 Features

- Property listings (sale & rent) with image galleries
- Blog with rich text editor
- Newsletter system with preferences
- Contact forms and lead management
- Admin panel
- Email notifications (Brevo)
- Image storage (Cloudinary/R2)
- PostgreSQL database
- SEO optimized

## 🔧 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- TanStack Query
- Tailwind CSS + shadcn/ui
- Wouter (routing)

### Backend
- Node.js + Express
- PostgreSQL (Neon.tech)
- Drizzle ORM
- Session-based auth
- Cloudinary/R2 storage
- Brevo email service

## 💰 Costs

| Service | Cost | Notes |
|---------|------|-------|
| Vercel (Frontend) | **$0** | Free plan |
| Railway (Backend) | **~$2-3/month** | Compute only |
| Neon (Database) | **$0** | Free tier (0.5GB) |
| **Total** | **~$2-3/month** | Plus external services |

*External services (Cloudinary, Brevo) have free tiers sufficient for small projects*

## 🚨 Important Notes

### For Deployment

- **CORS**: Backend is configured for strict origin checking
- **Sessions**: Use PostgreSQL sessions in production (not in-memory)
- **Environment Variables**: Never commit `.env` files
- **Database Migrations**: Run manually after backend deployment

### For Development

- Backend and frontend run on separate ports
- Frontend proxies API requests in development
- Shared types are in `shared/` directory (duplicated in both projects)

## 📞 Support

For deployment issues:
- Vercel: https://vercel.com/support
- Railway: https://railway.app/help  
- Neon: https://neon.tech/docs

---

**Ready to deploy?** Start with [DEPLOYMENT.md](DEPLOYMENT.md)
