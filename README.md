# AI Orchestration Hub - Production Deployment Guide

A full-stack AI multi-agent orchestration platform with **free-first AI models**, cost controls, secure integrations, and centralized memory.

## 💡 Key Highlights

- 🎉 **Free-First AI Strategy**: Run on $0-5/month using Ollama and open-source models
- 🤖 **Multi-Agent Orchestration**: Coordinate multiple AI models with intelligent selection
- 🔐 **Integration Vault**: Connect GitHub, Google Drive, Dropbox, Notion, Zapier, and more
- 💰 **Smart Cost Controls**: Automatic fallback from expensive to free models
- 🧠 **Memory Layer**: Centralized and decentralized memory with keyword search
- 📊 **Cost Dashboard**: Real-time tracking and budget alerts
- 🔒 **Security**: RBAC, audit logging, rate limiting, and secure credential storage
- 🌿 **Branch-First Git**: Safe repository operations (no direct main pushes)
- 🔧 **Self-Healing**: Automatic error diagnosis and fix attempts in safe branches
- 💬 **Built-in Assistant**: Context-aware help system that's always free

> **🚀 New User?** Start with the [Quick Onboarding Guide](docs/ONBOARDING_GUIDE.md) - get running in under 10 minutes!
> 
> **💸 Cost Conscious?** See [Cost Transparency Guide](docs/COST_TRANSPARENCY_GUIDE.md) for complete cost control.
>
> **🆘 Having Issues?** Check [Troubleshooting Guide](docs/TROUBLESHOOTING_GUIDE.md) for instant solutions.

## 🎯 Addressing User Pain Points

This platform is designed to eliminate the top 5 pain points for freelance developers:

1. **✅ Setup Friction**: Quick start guide gets you running in 10 minutes, no complex env vars required
2. **✅ Context Switching**: Everything in one dashboard - no tab hopping between GitHub, email, docs
3. **✅ Cost Anxiety**: Transparent pricing, hard budget caps, free assistant, no surprise bills
4. **✅ AI Tool Skepticism**: Real GitHub integration, automatic fixes, clear value from day one
5. **✅ Lack of Control**: Budget controls, usage tracking, audit logs, safe-branch-only changes

## Features

- **Free-First AI Models**: Ollama (self-hosted), Groq, Together AI, Perplexity - avoid expensive APIs
- **Multi-Agent Orchestration**: Coordinate OpenAI, Anthropic, xAI, and Perplexity models
- **Integration Vault**: Connect GitHub, Google Drive, Dropbox, Notion, Zapier, and more
- **Cost Governance**: Daily/monthly budgets with automatic enforcement
- **Memory Layer**: Centralized and decentralized memory with keyword search
- **Audit Logging**: Complete audit trail for all operations
- **RBAC**: Owner, Admin, Member, Viewer roles
- **Rate Limiting**: Protection against abuse
- **Branch-First Git**: Safe repository operations (no direct main pushes)
- **Intelligent Failure Handling**: Auto-diagnose errors, attempt fixes, escalate if needed
- **Always-Free Assistant**: Built-in help system powered by free-tier AI

## Required Environment Variables (Replit Secrets)

### Core (Required)
- `DATABASE_URL` - PostgreSQL connection string (auto-configured by Replit)
- `SESSION_SECRET` - Secure random string for session encryption
- `APP_ORIGIN` - Your app URL (e.g., https://your-app.replit.app)

### AI Providers (Recommended for Free/Cheap Tier)
- `OLLAMA_BASE_URL` - Ollama server URL (default: http://localhost:11434) - **FREE**
- `GROQ_API_KEY` - Groq API key for cheap fallback ($0.59/1M tokens)
- `TOGETHER_API_KEY` - Together AI key for cheap fallback ($0.90/1M tokens)
- `HUGGINGFACE_TOKEN` - HuggingFace token for free inference

### AI Providers (Expensive - User Keys Only)
- `OPENAI_API_KEY` - OpenAI API key ($3/1M tokens) - Only use if user provides their own key
- `ANTHROPIC_API_KEY` - Anthropic (Claude) API key ($3-15/1M tokens) - User key only
- `XAI_API_KEY` - xAI (Grok) API key - User key only
- `PERPLEXITY_API_KEY` - Perplexity API key ($0.05/1M tokens) - Cheap option for search

### Integrations (Optional - add as needed)
- `GITHUB_TOKEN` - GitHub Personal Access Token for repo operations
- `GOOGLE_DRIVE_CLIENT_ID` - Google Drive OAuth client ID
- `GOOGLE_DRIVE_CLIENT_SECRET` - Google Drive OAuth secret
- `DROPBOX_ACCESS_TOKEN` - Dropbox access token
- `NOTION_TOKEN` - Notion integration token

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start dev server (backend + frontend)
npm run dev
```

The app will be available at `http://localhost:5000`

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Deployment Checklist

- [ ] **Add Required Secrets**: SESSION_SECRET, APP_ORIGIN
- [ ] **Add AI Provider Keys**: At least one of OPENAI_API_KEY, ANTHROPIC_API_KEY, XAI_API_KEY
- [ ] **Verify Database**: DATABASE_URL is set (Replit auto-configures this)
- [ ] **Test Auth Flow**: Create account, login, logout
- [ ] **Test Agent Run**: Execute at least one agent with stub or real provider
- [ ] **Configure Budgets**: Set daily/monthly budgets via API
- [ ] **Test Integrations**: Connect at least one integration
- [ ] **Review Audit Logs**: Verify logging works via GET /api/audit
- [ ] **Deploy**: Use Replit's "Publish" button to make the app live

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project

### Integrations
- `GET /api/integrations` - List integrations
- `POST /api/integrations/connect` - Connect provider
- `POST /api/integrations/disconnect` - Disconnect provider

### Agent Orchestration
- `POST /api/agents/run` - Start agent run
- `GET /api/agents/run/:runId` - Get run status
- `GET /api/agents/stream/:runId` - Stream run logs (SSE)

### Memory
- `POST /api/memory/add` - Add memory item
- `GET /api/memory/search?projectId=X&q=query` - Search memory

### Git Operations
- `GET /api/repos` - List configured repos
- `POST /api/repos/commit` - Create branch-first commit

### Health
- `GET /api/health` - Health check

## Security Features

- **Helmet**: Security headers
- **CORS**: Locked to APP_ORIGIN
- **Rate Limiting**: 
  - Auth: 5 attempts per 15 min
  - API: 100 requests per 15 min
  - Agents: 10 runs per minute
- **Session Management**: HTTP-only cookies
- **RBAC**: Role-based access control
- **Audit Logging**: All sensitive operations logged

## Architecture

```
client/              # React frontend (Vite)
  src/
    pages/          # All UI pages
    components/     # Shared components
    
server/             # Express backend
  auth.ts           # Authentication & RBAC
  db.ts             # Database connection
  routes.ts         # All API routes
  storage.ts        # Database operations
  middleware/       # Rate limiting, cost control
  services/         # Orchestrator, provider adapters
  
shared/             # Shared types
  schema.ts         # Drizzle schema & types
```

## Provider Adapters

The system includes safe stub adapters for all providers. When API keys are not configured:
- Providers return a "not configured" message
- UI remains functional
- Logs indicate missing configuration
- No crashes or errors

To enable real provider calls, add the appropriate API keys to Replit Secrets.

## Cost Optimization Strategy 💰

This platform uses a **free-first approach** to minimize AI costs:

### Tier 1: Free (Primary) 🎉
- **Ollama** (self-hosted): $0/month
- Models: llama3.1:8b, codellama:13b, mistral:7b, phi-3
- Setup: `curl https://ollama.ai/install.sh | sh && ollama pull llama3.1:8b`

### Tier 2: Cheap Fallback 💚
- **Groq**: $0.59/1M tokens (5x cheaper than OpenAI)
- **Together AI**: $0.90/1M tokens (3x cheaper than OpenAI)
- **Perplexity**: $0.05/1M tokens (60x cheaper than OpenAI)

### Tier 3: Expensive (User Keys Only) 💸
- **OpenAI**: $3-10/1M tokens - Only use with user's own API key
- **Claude**: $3-15/1M tokens - Only use with user's own API key

**Target**: <$5/month per user by using free models for 90%+ of requests.

📖 **See**: [Cost Optimization Quick Reference](docs/COST_OPTIMIZATION_QUICK_REF.md) for details.

## Cost Controls

1. **Set Budgets**: Create daily/monthly budgets via API
2. **Automatic Enforcement**: Agent runs blocked when budget exceeded
3. **Smart Model Selection**: Automatically choose cheapest model for task
4. **Cost Tracking**: Each run estimates and tracks costs
5. **Audit Trail**: All cost events logged

Example budget creation:
```bash
curl -X POST /api/budgets \
  -H "Content-Type: application/json" \
  -d '{"orgId":"<org-id>","period":"daily","limitUsd":"10.00"}'
```

## Troubleshooting

**Quick Help**: Click the **💬 Assistant** button in the app - it can diagnose and fix most issues automatically (FREE!).

### Common Issues at a Glance

| Issue | Quick Fix | Details |
|-------|-----------|---------|
| "Database connection failed" | Run `npm run db:push` | [Troubleshooting Guide](docs/TROUBLESHOOTING_GUIDE.md#database-errors) |
| "Session secret not set" | Add SESSION_SECRET to Secrets | [Onboarding Guide](docs/ONBOARDING_GUIDE.md#step-1) |
| "Provider not configured" | Connect provider in Settings | [Troubleshooting Guide](docs/TROUBLESHOOTING_GUIDE.md#provider-not-configured) |
| "Budget exceeded" | Increase limit or wait for reset | [Cost Guide](docs/COST_TRANSPARENCY_GUIDE.md#budget-exceeded) |
| Agent fails | Ask assistant: "Why did my agent fail?" | [Troubleshooting Guide](docs/TROUBLESHOOTING_GUIDE.md#agent-fails) |
| Slow performance | Switch to Groq (faster + cheaper) | [Cost Guide](docs/COST_TRANSPARENCY_GUIDE.md#provider-speed) |

**For detailed troubleshooting**: See [docs/TROUBLESHOOTING_GUIDE.md](docs/TROUBLESHOOTING_GUIDE.md)

## Documentation

### 🚀 Getting Started
- 📗 **[Quick Onboarding Guide](docs/ONBOARDING_GUIDE.md)** - Your first 10 minutes, step-by-step
- 📘 **[Troubleshooting Guide](docs/TROUBLESHOOTING_GUIDE.md)** - Diagnose and fix common issues instantly
- 📙 **[Cost Transparency Guide](docs/COST_TRANSPARENCY_GUIDE.md)** - Complete cost control and budgeting
- 📕 **[App Usage Guide](APP_USAGE_GUIDE.md)** - Detailed feature walkthrough

### 💰 Cost Management
- 📘 [Cost Optimization Quick Reference](docs/COST_OPTIMIZATION_QUICK_REF.md) - Fast guide to minimizing AI costs
- 📙 [Cost Transparency Guide](docs/COST_TRANSPARENCY_GUIDE.md) - Understanding every dollar spent

### 🛠️ Advanced Topics
- 📗 [Free-First AI Strategy](docs/FREE_FIRST_AI_STRATEGY_ISSUE.md) - Complete implementation plan
- 📙 [Free AI Implementation Guide](docs/FREE_AI_IMPLEMENTATION_GUIDE.md) - Developer guide with code templates
- 📕 [Full Feature List](docs/FULL_FEATURE_LIST.md) - Complete feature documentation
- 📔 [Project Documentation](docs/PROJECT_DOCUMENTATION.md) - Detailed project information

## Built-In Assistant 💬

The platform includes an **always-free AI assistant** that:

- ✅ Explains errors in plain English
- ✅ Diagnoses root causes automatically
- ✅ Attempts to fix issues in safe branches
- ✅ Escalates to smarter AI if needed
- ✅ Creates structured issues for complex problems
- ✅ Never counts against your budget

**How to Use**:
1. Click the **💬 Assistant** button (available on every page)
2. Ask questions like:
   - "Why did my agent fail?"
   - "How do I connect GitHub?"
   - "What's my current spending?"
   - "Can you fix this error?"
3. Get instant help, diagnosis, and fixes

**Cost**: $0.00 - Runs on free maintenance quota

## Self-Healing System 🔧

When workflows fail, the system automatically:

1. **Diagnoses** the root cause using AI
2. **Creates** a safe fix branch (never touches main)
3. **Tests** the fix automatically
4. **Opens PR** for your review if successful
5. **Escalates** to smarter AI if first attempt fails
6. **Creates Issue** with full context if all attempts fail

**Example Flow**:
```
❌ npm install fails with peer dependency error
    ↓
🔍 AI diagnoses: "Peer dependency conflict with React 19"
    ↓
🔧 Creates branch: ai-fix/deps-1234567
    ↓
✅ Adds .npmrc with legacy-peer-deps=true
    ↓
🧪 Tests pass
    ↓
📝 Opens PR: "🤖 Auto-fix: Resolve peer dependency conflicts"
    ↓
👍 You review and merge
```

**All free** - runs on maintenance quota!

## Support

### Self-Service (Fastest)
1. **Click 💬 Assistant** in the app - instant help for 90% of issues
2. **Check [Troubleshooting Guide](docs/TROUBLESHOOTING_GUIDE.md)** - symptom → cause → fix format
3. **Review logs** - Replit console shows detailed error messages
4. **Ask the assistant** - "Explain this error: [paste error message]"

### Documentation
1. [Quick Onboarding](docs/ONBOARDING_GUIDE.md) - For setup issues
2. [Troubleshooting](docs/TROUBLESHOOTING_GUIDE.md) - For runtime issues
3. [Cost Guide](docs/COST_TRANSPARENCY_GUIDE.md) - For billing questions
4. [Full Docs](docs/) - For everything else

### Community & Issues
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community help
- **Self-Healing System**: Automatically files issues for complex failures

**Pro Tip**: The assistant can search documentation and explain any concept - just ask!

## License

MIT
