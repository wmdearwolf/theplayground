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

2. **Environment Variables**
   Create a `.env.production` file with your production environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXTAUTH_SECRET=your_nextauth_secret_key
   NEXTAUTH_URL=https://your-domain.com
   NODE_ENV=production
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

### 2.3 Environment Variables

Add these environment variables in Coolify:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Next.js Configuration
NEXTAUTH_SECRET=your_super_secret_key_here
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production

# Optional: Disable telemetry
NEXT_TELEMETRY_DISABLED=1
```

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

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs

2. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check network connectivity
   - Review RLS policies

3. **Environment Variables**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify variable values

### Debug Commands

```bash
# Check container logs
docker logs container_name

# Access container shell
docker exec -it container_name /bin/sh

# Check environment variables
docker exec container_name env

# Test database connection
docker exec container_name node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

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