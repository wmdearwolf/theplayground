# Deployment Guide for Learning Adventure

This guide will walk you through deploying the Learning Adventure application to Netlify, a recommended platform for hosting Next.js applications.

## Prerequisites

Before you begin, make sure you have:
- A GitHub repository with your project code
- A Netlify account (free tier is sufficient)
- Your Supabase project URL and API key

## Step 1: Push Your Code to GitHub

If you haven't already, push your project to a GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo-name.git
git push -u origin main
```

## Step 2: Set Up Netlify

1. **Sign in to Netlify**
   - Go to [netlify.com](https://netlify.com) and sign in or create an account

2. **Create a New Site**
   - Click on "Add new site" or "New site from Git"
   - Select GitHub as your Git provider
   - Authorize Netlify to access your GitHub account if prompted

3. **Select Your Repository**
   - Find and select the repository containing your Learning Adventure project
   - If you don't see your repository, you may need to configure GitHub access in Netlify

4. **Configure Build Settings**
   - Netlify should automatically detect that this is a Next.js project
   - If not, configure the build settings manually:
     - Build command: `npm run build`
     - Publish directory: `.next`

5. **Set Environment Variables**
   - Go to the "Environment variables" section in your site settings
   - Add the following environment variables from your `.env.local` file:
     - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - Click "Deploy site"

## Step 3: Configure Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to "Domain management" in your site settings
   - Click "Add custom domain"
   - Enter your domain name (e.g., learning-adventure.com)
   - Follow the instructions to update your DNS settings

2. **Enable HTTPS**
   - Netlify automatically provisions SSL certificates for all sites
   - Once your DNS is configured, HTTPS will be enabled automatically

## Step 4: Set Up Form Handling (If Needed)

If your application includes forms that need to be processed:

1. **Enable Form Detection**
   - Go to "Forms" in your site settings
   - Netlify automatically detects HTML forms in your Next.js application
   - Form submissions will appear in the "Forms" section of your dashboard

2. **Configure Form Notifications**
   - Set up email notifications for form submissions
   - Connect to external services like Zapier if needed

## Step 5: Deploy Updates

Your site is now set up for automatic deployments:

1. **Automatic Deploys**
   - Every push to your main branch will trigger a new deployment
   - Pull requests will trigger deploy previews

2. **Manual Deploys**
   - You can trigger manual deployments from the Netlify dashboard
   - Go to "Deploys" and click "Trigger deploy"

## Step 6: Monitor and Optimize

1. **Analytics**
   - Netlify provides built-in analytics for your site
   - Monitor bandwidth, visitors, and form submissions

2. **Performance Optimization**
   - Enable asset optimization in "Build & deploy" settings
   - Configure caching headers for better performance

3. **Function Logs**
   - If you're using Netlify Functions, monitor their performance
   - Check logs for any errors or issues

## Alternative Deployment Options

### Railway

If you prefer to use Railway instead of Netlify:

1. **Sign up for Railway**
   - Go to [railway.app](https://railway.app) and create an account

2. **Create a New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Environment Variables**
   - Add your Supabase credentials as environment variables

4. **Build Settings**
   - Railway should automatically detect the Next.js configuration
   - If not, set the build command to `npm run build` and start command to `npm start`

### Render

If you prefer to use Render:

1. **Sign up for Render**
   - Go to [render.com](https://render.com) and create an account

2. **Create a New Web Service**
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository

3. **Configure Service**
   - Set the runtime to "Node"
   - Build command: `npm run build`
   - Start command: `npm start`
   - Add your environment variables

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check the build logs for specific error messages
   - Ensure all dependencies are properly listed in package.json
   - Verify that your environment variables are correctly set

2. **Environment Variables Not Working**
   - Make sure variables are prefixed with `NEXT_PUBLIC_` for client-side access
   - Check that you've added them in the correct format in Netlify

3. **Routing Issues**
   - Ensure you've configured Netlify to handle Next.js routing correctly
   - Create a `netlify.toml` file if needed for custom redirects

### Getting Help

- Netlify Documentation: [docs.netlify.com](https://docs.netlify.com/)
- Next.js Deployment Guide: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- Supabase Documentation: [supabase.com/docs](https://supabase.com/docs)

## Conclusion

Your Learning Adventure application is now ready for deployment! By following this guide, you've set up a robust, scalable hosting solution that will automatically update as you continue to develop your application.