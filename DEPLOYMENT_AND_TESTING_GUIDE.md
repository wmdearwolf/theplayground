# Complete Deployment and Testing Guide for The Playground

This comprehensive guide covers deployment with Coolify, testing strategies, content management, and maintaining user data integrity.

## Table of Contents

1. [Pre-Deployment Setup](#pre-deployment-setup)
2. [Coolify Deployment](#coolify-deployment)
3. [Testing Strategy](#testing-strategy)
4. [Content Management](#content-management)
5. [Database Management](#database-management)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

## Pre-Deployment Setup

### 1. Environment Configuration

Create production environment variables:

```bash
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXTAUTH_SECRET=your_super_secret_key_here
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 2. Database Setup

Run the content management schema:

```sql
-- Execute CONTENT_MANAGEMENT_SETUP.sql in your Supabase SQL editor
-- This creates the content management tables and functions
```

### 3. Content Migration

Use the content manager to migrate existing content:

```typescript
import { ContentManager } from '@/lib/content-manager'

// Example migration script
const migrateExistingContent = async () => {
  const adminUserId = 'your-admin-user-id'
  
  // Migrate quizzes
  const existingQuizzes = await getExistingQuizzes() // Your existing data
  for (const quiz of existingQuizzes) {
    await ContentManager.createContent('quiz', quiz.title, quiz, adminUserId)
  }
  
  // Migrate research articles
  const existingArticles = await getExistingArticles()
  for (const article of existingArticles) {
    await ContentManager.createContent('research_article', article.title, article, adminUserId)
  }
}
```

## Coolify Deployment

### 1. Repository Preparation

```bash
# Ensure all files are committed
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 2. Coolify Configuration

1. **Create New Application**
   - Name: `the-playground-prod`
   - Repository: Your Git repository URL
   - Branch: `main`
   - Build Pack: `Docker`

2. **Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=https://your-domain.com
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   ```

3. **Domain Configuration**
   - Add your custom domain
   - Enable SSL/TLS (Let's Encrypt)
   - Configure health checks: `/api/health`

4. **Build Configuration**
   - Build Command: `npm ci && npm run build`
   - Start Command: `node server.js`
   - Port: `3000`

### 3. Deployment Process

1. **Initial Deployment**
   ```bash
   # Coolify will automatically build and deploy
   # Monitor the build logs in Coolify dashboard
   ```

2. **Verify Deployment**
   ```bash
   # Check health endpoint
   curl https://your-domain.com/api/health
   
   # Should return:
   # {
   #   "status": "healthy",
   #   "database": "connected",
   #   "timestamp": "...",
   #   "version": "1.0.0"
   # }
   ```

## Testing Strategy

### 1. Unit Tests (Jest)

```bash
# Install dependencies
npm install

# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### 2. End-to-End Tests (Playwright)

```bash
# Install Playwright
npx playwright install

# Run E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run specific test
npx playwright test homepage.spec.ts
```

### 3. Manual Testing Checklist

#### Authentication Flow
- [ ] User registration works
- [ ] User login works
- [ ] Password reset works
- [ ] Profile management works
- [ ] Session persistence works

#### Core Features
- [ ] Quiz functionality works
- [ ] Research articles load
- [ ] Calculator functions properly
- [ ] Dashboard displays correctly
- [ ] Badge system works
- [ ] Points system works

#### Content Management
- [ ] Content loads from database
- [ ] Content updates don't affect users
- [ ] Version control works
- [ ] Rollback functionality works

#### Performance
- [ ] Page load times < 3 seconds
- [ ] Images load properly
- [ ] Mobile responsiveness
- [ ] Accessibility compliance

### 4. Automated Testing Pipeline

Create a GitHub Actions workflow:

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:coverage
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run linting
      run: npm run lint
    
    - name: Install Playwright
      run: npx playwright install --with-deps
    
    - name: Run E2E tests
      run: npm run test:e2e
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## Content Management

### 1. Safe Content Updates

The content management system ensures user data is never affected:

```typescript
// Example: Adding new quiz without affecting users
import { QuizManager } from '@/lib/content-manager'

const addNewQuiz = async () => {
  const newQuiz = {
    title: "Advanced Mathematics",
    description: "Test your advanced math skills",
    questions: [
      // Quiz questions
    ]
  }
  
  // Create as draft first
  const { data } = await QuizManager.createQuiz(newQuiz, adminUserId)
  
  // Test the quiz
  await testQuizFunctionality(data.id)
  
  // Publish when ready
  await ContentManager.publishContent(data.id, adminUserId)
}
```

### 2. Content Deployment Workflow

```typescript
// Create deployment snapshot before major updates
const deployContent = async () => {
  // 1. Create snapshot of current state
  const snapshotId = await createDeploymentSnapshot(
    'Release v1.2.0',
    adminUserId,
    'Added new math quizzes and science articles'
  )
  
  // 2. Deploy new content
  await deployNewContent()
  
  // 3. Test in production
  const testResults = await runProductionTests()
  
  // 4. Rollback if needed
  if (!testResults.success) {
    await rollbackToDeployment(snapshotId, adminUserId)
  }
}
```

### 3. Content Versioning

```typescript
// Update existing content safely
const updateQuiz = async (quizId: string) => {
  // Get current version
  const { data: currentQuiz } = await ContentManager.getContentById(quizId)
  
  // Create new version with updates
  const updatedContent = {
    ...currentQuiz.content,
    questions: [...currentQuiz.content.questions, newQuestion]
  }
  
  // Update creates new version automatically
  await QuizManager.updateQuiz(quizId, updatedContent, adminUserId)
  
  // Previous version is preserved for rollback
}
```

## Database Management

### 1. User Data Protection

User data tables are separate from content tables:

```sql
-- User data (protected)
- users
- user_quiz_attempts  
- user_badges
- saved_research

-- Content data (manageable)
- content_items
- content_versions
- content_deployments
```

### 2. Backup Strategy

```bash
# Automated daily backups (Supabase provides this)
# Additional manual backup before major deployments

# Create manual backup
pg_dump -h your-db-host -U postgres -d your-db > backup_$(date +%Y%m%d).sql
```

### 3. Migration Scripts

```sql
-- Example migration for new features
-- migrations/001_add_content_management.sql

-- Add new tables without affecting existing data
CREATE TABLE IF NOT EXISTS content_items (...);

-- Migrate existing data safely
INSERT INTO content_items (type, title, content, status)
SELECT 'quiz', title, row_to_json(quizzes.*), 'published'
FROM quizzes
WHERE NOT EXISTS (
  SELECT 1 FROM content_items 
  WHERE content_items.content->>'id' = quizzes.id::text
);
```

## Monitoring and Maintenance

### 1. Health Monitoring

```bash
# Set up monitoring for health endpoint
curl -f https://your-domain.com/api/health || exit 1

# Monitor key metrics
- Response time < 2s
- Database connectivity
- Error rates < 1%
- Uptime > 99.9%
```

### 2. Log Monitoring

```typescript
// Application logging
import { logger } from '@/lib/logger'

logger.info('User completed quiz', { 
  userId, 
  quizId, 
  score,
  timestamp: new Date().toISOString()
})

logger.error('Database connection failed', { 
  error: error.message,
  stack: error.stack
})
```

### 3. Performance Monitoring

```typescript
// Performance tracking
const trackPerformance = (action: string, duration: number) => {
  if (duration > 1000) {
    logger.warn('Slow operation detected', { action, duration })
  }
}
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check Node.js version
   node --version  # Should be 18+
   
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Database Connection Issues**
   ```bash
   # Test connection
   curl https://your-domain.com/api/health
   
   # Check environment variables
   echo $NEXT_PUBLIC_SUPABASE_URL
   ```

3. **Content Not Loading**
   ```sql
   -- Check content status
   SELECT type, status, COUNT(*) 
   FROM content_items 
   GROUP BY type, status;
   
   -- Publish content if needed
   UPDATE content_items 
   SET status = 'published' 
   WHERE status = 'draft' AND type = 'quiz';
   ```

### Emergency Procedures

1. **Rollback Deployment**
   ```typescript
   // Use content management system
   await rollbackToDeployment(lastKnownGoodSnapshotId, adminUserId)
   ```

2. **Database Recovery**
   ```bash
   # Restore from backup
   psql -h your-db-host -U postgres -d your-db < backup_20240130.sql
   ```

3. **Quick Fixes**
   ```bash
   # Hotfix deployment
   git checkout main
   git pull origin main
   # Make minimal fix
   git add .
   git commit -m "Hotfix: critical issue"
   git push origin main
   # Coolify will auto-deploy
   ```

## Best Practices

1. **Always test in staging first**
2. **Create deployment snapshots before major changes**
3. **Monitor health endpoints continuously**
4. **Keep user data and content data separate**
5. **Use feature flags for gradual rollouts**
6. **Maintain comprehensive test coverage**
7. **Document all changes and deployments**
8. **Regular security updates**
9. **Performance optimization**
10. **User feedback integration**

## Support and Resources

- **Coolify Documentation**: https://coolify.io/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Playwright Testing**: https://playwright.dev/docs
- **Project Repository**: Your GitHub repository URL

For additional support, check the project's GitHub repository or contact the development team.