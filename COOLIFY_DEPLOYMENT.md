# Coolify Deployment Guide for The Playground

This guide will help you deploy The Playground educational app using Coolify, a self-hosted alternative to Vercel/Netlify.

## Prerequisites

1. **Coolify Server Setup**
   - A server with Coolify installed (minimum 2GB RAM, 20GB storage)
   - Docker and Docker Compose installed
   - Domain name pointing to your server

2. **Supabase Project**
   - Active Supabase project with database configured
   - API keys and database URL ready

## Step 1: Prepare Your Repository

1. **Push to Git Repository**
   ```bash
   git add .
   git commit -m "Prepare for Coolify deployment"
   git push origin main
   ```

2. **Environment Variables Setup**
   **IMPORTANT**: Do NOT create a `.env.production` file in your repository. Instead, set these environment variables directly in Coolify's dashboard. Use the `.env.production.example` file as a reference for the variables you need to set.

   Required environment variables for Coolify:
   ```env
   # Required Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   
   # Required Application Configuration
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   NODE_ENV=production
   
   # Required for Authentication
   NEXTAUTH_SECRET=your_super_secret_key_minimum_32_characters
   NEXTAUTH_URL=https://your-domain.com
   
   # Next.js Configuration
   NEXT_TELEMETRY_DISABLED=1
   PORT=3000
   HOSTNAME=0.0.0.0
   ```

## Step 2: Coolify Configuration

### 2.1 Create New Application

1. **Login to Coolify Dashboard**
   - Access your Coolify instance at `https://your-coolify-domain.com`
   - Navigate to "Applications" → "New Application"

2. **Application Settings**
   - **Name**: `the-playground`
   - **Git Repository**: Your repository URL
   - **Branch**: `main`
   - **Build Pack**: `Docker`

### 2.2 Docker Configuration

1. **Dockerfile Location**
   - Ensure `Dockerfile` is in the root directory (already created)
   - Build context: `/`

2. **Port Configuration**
   - **Internal Port**: `3000`
   - **External Port**: `80` or `443` (for HTTPS)

### 2.3 Environment Variables in Coolify

**CRITICAL**: Set these environment variables in Coolify's dashboard under your application settings:

```env
# 🔑 Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 🌐 Application Configuration (REQUIRED)
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# 🔐 Authentication (REQUIRED)
NEXTAUTH_SECRET=your_super_secret_key_minimum_32_characters
NEXTAUTH_URL=https://your-domain.com

# 🚀 Next.js Configuration
NEXT_TELEMETRY_DISABLED=1
PORT=3000
HOSTNAME=0.0.0.0
```

**How to set environment variables in Coolify:**
1. Go to your application in Coolify dashboard
2. Navigate to "Environment Variables" tab
3. Add each variable one by one
4. Make sure to save after adding all variables
5. Redeploy your application after setting variables

### 2.4 Domain Configuration

1. **Custom Domain**
   - Add your domain in Coolify
   - Configure DNS A record pointing to your server IP
   - Enable SSL/TLS certificate (Let's Encrypt)

2. **Health Check**
   - **Path**: `/api/health` (we'll create this)
   - **Port**: `3000`
   - **Interval**: `30s`

## Step 3: Database Migration

### 3.1 Supabase Setup

1. **Database Schema**
   - Ensure all tables are created in Supabase
   - Run the SQL scripts from `SUPABASE_SETUP.md`

2. **Row Level Security (RLS)**
   - Enable RLS on all tables
   - Configure policies for user access

### 3.2 Initial Data

1. **Seed Data**
   - Quiz questions and answers
   - Research articles
   - Badge configurations

## Step 4: Build and Deploy

### 4.1 Build Configuration

1. **Build Command**
   ```bash
   npm ci && npm run build
   ```

2. **Start Command**
   ```bash
   node server.js
   ```

### 4.2 Deploy Process

1. **Trigger Deployment**
   - Push changes to your repository
   - Coolify will automatically detect changes and rebuild
   - Monitor build logs in Coolify dashboard

2. **Verify Deployment**
   - Check application logs
   - Test all features
   - Verify database connections

## Step 5: Monitoring and Maintenance

### 5.1 Health Monitoring

Create a health check endpoint:

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0'
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    }, { status: 500 })
  }
}
```

### 5.2 Backup Strategy

1. **Database Backups**
   - Supabase provides automatic backups
   - Configure additional backup schedule if needed

2. **Application Backups**
   - Git repository serves as code backup
   - Environment variables backup

### 5.3 Scaling

1. **Horizontal Scaling**
   - Add more Coolify instances
   - Load balancer configuration

2. **Vertical Scaling**
   - Increase server resources
   - Monitor resource usage

## Step 6: CI/CD Pipeline

### 6.1 Automatic Deployments

1. **Git Webhooks**
   - Configure automatic deployments on push
   - Set up staging and production environments

2. **Build Optimization**
   - Use Docker layer caching
   - Optimize build times

### 6.2 Testing Integration

1. **Pre-deployment Tests**
   - Run test suite before deployment
   - Prevent broken deployments

2. **Post-deployment Verification**
   - Automated health checks
   - Feature testing

## Troubleshooting

### Common Issues and Solutions

1. **Build Failures**
   ```bash
   # Check if package.json and package-lock.json are in sync
   npm ci
   
   # Verify Node.js version (should be 18+)
   node --version
   
   # Check build logs in Coolify dashboard
   ```

2. **Environment Variables Not Working**
   - **Problem**: App can't connect to Supabase or shows undefined variables
   - **Solution**:
     ```bash
     # In Coolify dashboard, verify these variables are set:
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
     NODE_ENV=production
     ```
   - **Important**: Variables starting with `NEXT_PUBLIC_` are exposed to the browser
   - **Redeploy** after setting environment variables

3. **Database Connection Issues**
   - Verify Supabase URL format: `https://project-id.supabase.co`
   - Check if Supabase project is active and not paused
   - Verify RLS policies allow public access where needed
   - Test connection: Visit `/api/health` endpoint

4. **Docker Build Issues**
   ```bash
   # Test build locally first
   docker build -t playground-test .
   docker run -p 3000:3000 playground-test
   ```

5. **Health Check Failures**
   - Ensure `/api/health` endpoint exists and works
   - Check if port 3000 is properly exposed
   - Verify container starts successfully

### Debug Commands

```bash
# Check Coolify application logs
# (Available in Coolify dashboard under "Logs" tab)

# Test locally with production build
npm run build
npm start

# Check environment variables in container
docker exec -it container_name env | grep NEXT_PUBLIC

# Test health endpoint
curl http://localhost:3000/api/health

# Check if Supabase connection works
curl -X GET "https://your-project-id.supabase.co/rest/v1/" \
  -H "apikey: your_anon_key" \
  -H "Authorization: Bearer your_anon_key"
```

### Environment Variable Checklist

Before deploying, ensure these are set in Coolify:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- [ ] `NEXT_PUBLIC_APP_URL` - Your domain (https://your-domain.com)
- [ ] `NODE_ENV=production` - Set to production
- [ ] `NEXTAUTH_SECRET` - Random 32+ character string
- [ ] `NEXTAUTH_URL` - Same as NEXT_PUBLIC_APP_URL
- [ ] `NEXT_TELEMETRY_DISABLED=1` - Disable telemetry
- [ ] `PORT=3000` - Application port
- [ ] `HOSTNAME=0.0.0.0` - Bind to all interfaces

### Quick Fix Steps

1. **If deployment fails:**
   - Check Coolify build logs
   - Verify all environment variables are set
   - Ensure Dockerfile is in root directory
   - Try rebuilding from scratch

2. **If app loads but features don't work:**
   - Check browser console for errors
   - Verify Supabase connection at `/api/health`
   - Check if environment variables are properly set
   - Ensure database tables exist and RLS is configured

3. **If getting "Internal Server Error":**
   - Check application logs in Coolify
   - Verify database connection
   - Check if all required environment variables are set
   - Test health endpoint

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive data to Git
   - Use Coolify's encrypted environment variables
   - Rotate keys regularly

2. **Network Security**
   - Configure firewall rules
   - Use HTTPS only
   - Implement rate limiting

3. **Database Security**
   - Enable RLS on all tables
   - Use least privilege access
   - Monitor database access logs

## Performance Optimization

1. **Caching**
   - Enable Next.js caching
   - Use CDN for static assets
   - Implement Redis for session storage

2. **Image Optimization**
   - Use Next.js Image component
   - Optimize image sizes
   - Implement lazy loading

3. **Bundle Optimization**
   - Analyze bundle size
   - Remove unused dependencies
   - Use dynamic imports

## Support and Resources

- **Coolify Documentation**: https://coolify.io/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Supabase Documentation**: https://supabase.com/docs
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/

For additional support, check the project's GitHub repository or contact the development team.