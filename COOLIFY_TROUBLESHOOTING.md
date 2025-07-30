# 🚨 Coolify Deployment Troubleshooting Guide

This guide addresses common issues when deploying The Playground to Coolify and provides step-by-step solutions.

## 🔧 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] **Repository pushed to Git** with all latest changes
- [ ] **Dockerfile** in the root directory
- [ ] **Environment variables** ready (use `.env.production.example` as reference)
- [ ] **Supabase project** active and configured
- [ ] **Domain name** pointing to your Coolify server

## 🚀 Environment Variables Setup

### ❌ Common Mistake
**DO NOT** create `.env.production` or `.env.local` files in your repository for production deployment.

### ✅ Correct Setup
Set these variables in **Coolify Dashboard > Your App > Environment Variables**:

```env
# 🔑 Required Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 🌐 Required Application Configuration  
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# 🔐 Required Authentication
NEXTAUTH_SECRET=your_super_secret_key_minimum_32_characters
NEXTAUTH_URL=https://your-domain.com

# 🚀 Next.js Configuration
NEXT_TELEMETRY_DISABLED=1
PORT=3000
HOSTNAME=0.0.0.0
```

### 🔍 How to Verify Environment Variables

1. **In Coolify Dashboard:**
   - Go to your application
   - Click "Environment Variables" tab
   - Verify all variables are listed
   - Check for typos in variable names

2. **Test in Container:**
   ```bash
   # Access container shell in Coolify
   docker exec -it your_container_name /bin/sh
   
   # Check if variables are set
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NODE_ENV
   ```

## 🐛 Common Build Errors

### Error: "Module not found" or "Cannot resolve module"

**Cause:** Missing dependencies or incorrect import paths

**Solution:**
```bash
# 1. Check package.json for missing dependencies
# 2. Verify import paths are correct
# 3. Clear node_modules and reinstall locally
rm -rf node_modules package-lock.json
npm install

# 4. Test build locally
npm run build
```

### Error: "ENOENT: no such file or directory"

**Cause:** Missing files or incorrect file paths

**Solution:**
1. Ensure all referenced files exist in the repository
2. Check `.dockerignore` - make sure required files aren't ignored
3. Verify file paths are relative to project root

### Error: "Cannot connect to Supabase" during build

**Cause:** Environment variables not available during build

**Solution:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is set in Coolify
2. Check Supabase project is active (not paused)
3. Test connection locally:
   ```bash
   curl -X GET "https://your-project-id.supabase.co/rest/v1/" \
     -H "apikey: your_anon_key"
   ```

## 🔄 Runtime Errors

### Error: "Application failed to start"

**Symptoms:** Container starts but app doesn't respond

**Debugging Steps:**
1. **Check Coolify Logs:**
   - Go to your app in Coolify
   - Click "Logs" tab
   - Look for error messages

2. **Verify Port Configuration:**
   ```env
   PORT=3000
   HOSTNAME=0.0.0.0
   ```

3. **Test Health Endpoint:**
   ```bash
   curl http://your-domain.com/api/health
   ```

### Error: "Database connection failed"

**Symptoms:** App loads but features don't work, `/api/health` returns 500

**Solutions:**
1. **Verify Supabase Configuration:**
   ```bash
   # Test Supabase connection
   curl -X GET "https://your-project-id.supabase.co/rest/v1/users?select=count" \
     -H "apikey: your_anon_key" \
     -H "Authorization: Bearer your_anon_key"
   ```

2. **Check RLS Policies:**
   - Ensure Row Level Security allows necessary operations
   - Verify policies for `users`, `quizzes`, `articles` tables

3. **Verify Environment Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` format: `https://project-id.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` should be the anon/public key

### Error: "Authentication not working"

**Symptoms:** Can't sign up/login, auth redirects fail

**Solutions:**
1. **Check Auth URLs:**
   ```env
   NEXTAUTH_URL=https://your-domain.com  # Must match your actual domain
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

2. **Verify NEXTAUTH_SECRET:**
   - Must be at least 32 characters
   - Should be a random string
   - Generate with: `openssl rand -base64 32`

3. **Supabase Auth Settings:**
   - Go to Supabase Dashboard > Authentication > URL Configuration
   - Add your domain to "Site URL"
   - Add redirect URLs if needed

## 🔧 Docker-Specific Issues

### Error: "Docker build failed"

**Common Causes & Solutions:**

1. **Node.js Version Mismatch:**
   ```dockerfile
   # Ensure using Node 18
   FROM node:18-alpine AS base
   ```

2. **Package Manager Issues:**
   ```bash
   # Delete lock files and reinstall
   rm -rf node_modules package-lock.json
   npm install
   git add package-lock.json
   git commit -m "Update package-lock.json"
   ```

3. **Build Context Issues:**
   - Ensure Dockerfile is in project root
   - Check `.dockerignore` doesn't exclude necessary files

### Error: "Health check failed"

**Symptoms:** Container starts but health checks fail

**Solutions:**
1. **Verify Health Endpoint:**
   ```bash
   # Test locally
   npm run build && npm start
   curl http://localhost:3000/api/health
   ```

2. **Check Health Check Configuration:**
   ```dockerfile
   HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
     CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
   ```

## 🌐 Domain and SSL Issues

### Error: "Site can't be reached"

**Solutions:**
1. **DNS Configuration:**
   - Verify A record points to Coolify server IP
   - Check DNS propagation: `nslookup your-domain.com`

2. **Coolify Domain Settings:**
   - Add domain in Coolify dashboard
   - Enable SSL/TLS certificate
   - Wait for certificate generation

### Error: "SSL certificate issues"

**Solutions:**
1. **Let's Encrypt Setup:**
   - Ensure domain is publicly accessible
   - Check Coolify SSL settings
   - Regenerate certificate if needed

2. **Firewall Configuration:**
   - Open ports 80 and 443
   - Check server firewall rules

## 🔄 Deployment Process

### Step-by-Step Deployment

1. **Prepare Repository:**
   ```bash
   git add .
   git commit -m "Prepare for Coolify deployment"
   git push origin main
   ```

2. **Create Application in Coolify:**
   - Name: `the-playground`
   - Repository: Your Git URL
   - Branch: `main`
   - Build Pack: `Docker`

3. **Set Environment Variables:**
   - Use the checklist above
   - Double-check all variable names and values

4. **Configure Domain:**
   - Add your domain
   - Enable SSL
   - Wait for certificate

5. **Deploy:**
   - Trigger deployment
   - Monitor build logs
   - Test application

### Redeploy After Changes

```bash
# After making changes
git add .
git commit -m "Your changes"
git push origin main

# Coolify will auto-deploy, or manually trigger in dashboard
```

## 🧪 Testing Your Deployment

### Quick Health Check

```bash
# Test basic connectivity
curl -I https://your-domain.com

# Test health endpoint
curl https://your-domain.com/api/health

# Test Supabase connection
curl https://your-domain.com/api/health | jq '.database'
```

### Feature Testing

1. **Authentication:**
   - Try signing up with a new account
   - Test login/logout functionality

2. **Database Operations:**
   - Take a quiz
   - Check if points are awarded
   - Verify profile updates work

3. **API Endpoints:**
   - Test research articles loading
   - Verify calculator functions

## 📞 Getting Help

### Logs to Check

1. **Coolify Build Logs:**
   - Dashboard > Your App > Deployments > View Logs

2. **Application Logs:**
   - Dashboard > Your App > Logs

3. **Container Logs:**
   ```bash
   docker logs your_container_name
   ```

### Information to Gather

When seeking help, provide:
- Coolify version
- Error messages from logs
- Environment variables (without sensitive values)
- Steps that led to the error
- Browser console errors (if applicable)

### Useful Commands

```bash
# Check container status
docker ps

# Inspect container
docker inspect your_container_name

# Check resource usage
docker stats your_container_name

# Test network connectivity
docker exec your_container_name ping google.com
```

## 🎯 Quick Fixes

### "It was working, now it's not"

1. Check if Supabase project is paused
2. Verify domain/SSL certificate status
3. Check if environment variables were accidentally changed
4. Look for recent commits that might have broken something

### "Build succeeds but app doesn't work"

1. Check environment variables are set correctly
2. Test `/api/health` endpoint
3. Check browser console for JavaScript errors
4. Verify Supabase connection and RLS policies

### "Slow performance"

1. Check server resources (CPU, memory)
2. Monitor database performance in Supabase
3. Consider enabling caching
4. Check for memory leaks in application logs

---

## 📚 Additional Resources

- [Coolify Documentation](https://coolify.io/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Troubleshooting](https://supabase.com/docs/guides/platform/troubleshooting)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

Remember: Most deployment issues are related to environment variables or network configuration. Start with the basics and work your way up! 🚀