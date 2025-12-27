# 🚀 Quick Start Onboarding Guide

Welcome to AI Workflow Architect! This guide will get you up and running in **under 10 minutes** with minimal setup and zero surprises.

## 🎯 What You'll Accomplish

By the end of this guide, you'll have:
- ✅ A working account with your first project
- ✅ At least one AI provider connected (we'll start with the **free/cheap** ones)
- ✅ Your first AI agent run completed
- ✅ Budget controls in place to prevent surprise costs
- ✅ Understanding of where to get help when things go wrong

## 📋 Prerequisites (5 minutes)

### Required (Free)
- **PostgreSQL Database**: Automatically configured if using Replit
- **Node.js 18+**: For local development
- **Email**: For account creation

### Optional (But Recommended)
- **Groq API Key**: Free tier, fastest setup - [Get it here](https://console.groq.com/)
- **Ollama**: Self-hosted, 100% free - [Install guide](https://ollama.ai/download)

### ❌ What You DON'T Need to Start
- No OpenAI account required (expensive)
- No Claude API key needed (expensive)
- No credit card to get started
- No complex configuration files

## 🏁 Step 1: First Login (2 minutes)

### Create Your Account
1. Navigate to `/signup`
2. Enter your email and password
3. Click "Create Account"
4. You're in! Your organization is automatically created.

### What Just Happened?
- ✅ Organization created with you as Owner
- ✅ Default project initialized
- ✅ Free maintenance quota activated
- ✅ Security features enabled (encryption, audit logs)

**Cost So Far**: $0.00

## 🔌 Step 2: Connect Your First AI Provider (3 minutes)

### Recommended Path: Start Free/Cheap

#### Option A: Groq (Recommended for First-Timers)
**Why?** 5x cheaper than OpenAI, super fast, generous free tier

1. Get API key from [console.groq.com](https://console.groq.com/)
2. Go to **Settings → Integrations**
3. Find "Groq" and click **Connect**
4. Paste your API key
5. Click **Test Connection**
6. When it shows ✅, click **Save**

**Cost**: $0.59 per 1M tokens (~2000 pages of text)

#### Option B: Ollama (100% Free)
**Why?** Runs on your computer, no API costs ever

1. Install Ollama: `curl https://ollama.ai/install.sh | sh`
2. Pull a model: `ollama pull llama3.1:8b`
3. Start server: `ollama serve`
4. In app: Settings → Integrations → Ollama
5. Set URL to `http://localhost:11434`
6. Test and Save

**Cost**: $0.00 forever

#### Option C: Skip for Now
The app has built-in **stub mode** - all features work, but AI calls return placeholder responses. Perfect for exploring the interface!

## 🎛️ Step 3: Set Your Budget (1 minute)

**Why this matters**: You should NEVER worry about surprise bills. Let's cap it.

1. Go to **Settings → Budgets**
2. Click **Create Budget**
3. Set:
   - **Period**: Daily
   - **Limit**: $5.00 (or whatever you're comfortable with)
4. Click **Save**

### What This Does
- 🛑 Automatically blocks agent runs when limit reached
- 📧 Sends email alerts at 80% and 100%
- 🔄 Resets every day (or month, your choice)
- ✅ Gives you peace of mind

**The assistant and auto-fix features run on a separate FREE quota**, so they never count against this budget.

## 🤖 Step 4: Run Your First Agent (3 minutes)

Let's do something useful: **analyze your GitHub activity**.

### Quick Test
1. Go to **Dashboard** or **Agents** page
2. Click **Start New Agent**
3. Fill in:
   - **Goal**: "List my recent projects and summarize their activity"
   - **Provider**: Groq (or whatever you connected)
   - **Project**: Select "Default Project"
4. Click **Run Agent**

### Watch it Work
- Real-time logs appear showing AI thinking
- Cost estimate shown (usually < $0.01)
- Results appear in ~10-30 seconds

### Stuck? Ask the Assistant!
At any point, click the **💬 Assistant** button (bottom right) and ask:
- "What does this error mean?"
- "How do I connect GitHub?"
- "What's my current spend?"

**Cost So Far**: ~$0.00 - $0.01

## 🎉 You're Ready!

### What You've Accomplished
- ✅ Account created with cost controls
- ✅ AI provider connected (free or cheap)
- ✅ First agent run completed successfully
- ✅ Budget protection in place
- ✅ Assistant available for help

### 🚦 Next Steps (Optional)

#### Beginner Path
1. **Explore the Dashboard**: See all your stats in one place
2. **Try More Agents**: Code generation, content creation, data analysis
3. **Connect Integrations**: GitHub, Google Drive, Notion

#### Intermediate Path
1. **Create Projects**: Organize work by client or topic
2. **Use Memory System**: Store important context for agents
3. **Set Up Workflows**: Automate recurring tasks

#### Advanced Path
1. **Multi-Agent Orchestration**: Coordinate multiple AI models
2. **Custom Agent Templates**: Reusable configurations
3. **API Access**: Programmatic control

## 🆘 Getting Help

### Built-In Assistant (Free, Always Available)
Click **💬 Assistant** anytime to:
- Explain errors in plain English
- Get step-by-step guidance
- Debug failed runs
- Learn about features

### Documentation
- **Troubleshooting Guide**: `docs/TROUBLESHOOTING_GUIDE.md`
- **Cost Optimization**: `docs/COST_OPTIMIZATION_QUICK_REF.md`
- **Full Feature List**: `docs/FULL_FEATURE_LIST.md`

### Common First-Day Questions

**Q: I see "Provider not configured" - what do I do?**  
A: This means you haven't added an API key yet. Go to Settings → Integrations and connect a provider. Or use stub mode to explore!

**Q: How much will this really cost?**  
A: With Groq: ~$0.50-2/month for light use. With Ollama: $0. You set the limits!

**Q: Can I try this without spending anything?**  
A: Yes! Use Ollama (self-hosted) or explore in stub mode.

**Q: What if an agent fails?**  
A: The assistant will automatically explain why, show you the error, and offer to fix it in a safe branch. No main branch changes without your approval.

**Q: Can I get help without paying for OpenAI?**  
A: Absolutely. The built-in assistant runs on your **free maintenance quota** - it never counts against your budget.

## 💡 Success Tips

### Cost Management
- ✅ Start with Groq or Ollama (cheap/free)
- ✅ Set daily budget to $1-5 initially
- ✅ Monitor spending in Dashboard
- ✅ Use memory system to avoid re-processing

### Productivity
- ✅ Keep tasks focused (one clear goal per agent)
- ✅ Use the assistant liberally (it's free!)
- ✅ Organize with projects
- ✅ Build up memory over time

### Learning
- ✅ Start with simple agents
- ✅ Read error messages (they're helpful!)
- ✅ Explore one feature at a time
- ✅ Check the docs when stuck

## 🎊 Welcome to the Future!

You now have a **personal AI control center** that:
- Won't surprise you with costs
- Explains everything it does
- Fixes problems automatically
- Keeps all your context in one place

**Ready to build something amazing?** 🚀

---

*Having trouble with any step? Click the 💬 Assistant button - it's here to help!*

*Questions not answered here? Check [docs/TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md)*
