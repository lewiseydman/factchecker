# Deployment Guide

## GitHub Setup and Continuous Development

### Initial Upload to GitHub

1. **Create GitHub Repository**
   - Visit GitHub.com and create a new repository
   - Name: `context-aware-fact-checker`
   - Description: "AI-powered fact-checking platform with context-aware analysis and misinformation tracking"
   - Keep it public or private as preferred
   - Do not initialize with README/gitignore

2. **Upload from Replit**
   ```bash
   # Clean any git locks
   rm -f .git/*.lock
   
   # Stage all files
   git add .
   
   # Initial commit
   git commit -m "Initial commit: Context-aware fact checking platform"
   
   # Connect to GitHub (replace with your repo URL)
   git remote add origin https://github.com/YOUR_USERNAME/context-aware-fact-checker.git
   
   # Push to GitHub
   git push -u origin main
   ```

### Ongoing Development Workflow

After initial upload, use this workflow for changes:

```bash
# Make changes in Replit
# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add new feature: [description]"

# Push to GitHub
git push origin main
```

### Common Git Commands

```bash
# Check status
git status

# See changes
git diff

# View commit history
git log --oneline

# Create new branch for features
git checkout -b feature/new-feature

# Switch back to main
git checkout main

# Merge feature branch
git merge feature/new-feature
```

## Environment Variables

### Required for Production
```env
DATABASE_URL=postgresql://[credentials]
SESSION_SECRET=[secure-random-string]
COHERE_API_KEY=[your-key]
GEMINI_API_KEY=[your-key]
MISTRAL_API_KEY=[your-key]
PERPLEXITY_API_KEY=[your-key]
```

### Optional Services
```env
ANTHROPIC_API_KEY=[your-key]
OPENAI_API_KEY=[your-key]
SENDGRID_API_KEY=[your-key]
```

## Deployment Platforms

### Replit (Current)
- Environment variables managed in Secrets
- Automatic SSL and domain
- Built-in database support

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
# ... add all required env vars
```

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up

# Set environment variables in Railway dashboard
```

### Render
1. Connect GitHub repository
2. Select Node.js environment
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables in dashboard

## Database Setup

### Neon (Recommended)
1. Create account at neon.tech
2. Create new project
3. Copy connection string to DATABASE_URL
4. Run migrations: `npm run db:push`

### Supabase
1. Create project at supabase.com
2. Get PostgreSQL connection string
3. Set as DATABASE_URL
4. Run migrations: `npm run db:push`

## Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate enabled
- [ ] API keys valid and active
- [ ] Session secret is secure
- [ ] Error logging configured
- [ ] Performance monitoring enabled
- [ ] Backup strategy implemented

## Monitoring and Maintenance

### Health Checks
- Monitor API response times
- Check database connection status
- Verify AI service availability
- Track error rates

### Regular Updates
- Update dependencies monthly
- Review AI model performance
- Monitor usage patterns
- Update security configurations

### Backup Strategy
- Database backups (daily)
- Environment variable backup
- Code repository backup
- User data export capability