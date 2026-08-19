# Deployment Guide

This guide covers deploying both the public website and admin dashboard for the Sofa Shop website.

## Architecture Overview

```
Public Website (GitHub Pages)
    ↓ (fetches content from)
Contentful CDN
    ↑ (managed by)
Admin Dashboard (Vercel/Netlify Functions)
    ↓ (secure API)
Contentful Management API
```

## Option 1: GitHub Pages (Public Website) + Vercel (Admin API)

### Step 1: Deploy Public Website to GitHub Pages

1. **Initialize Git Repository**
```bash
cd D:\Downloads\Home-Sofa
git init
git add .
git commit -m "Initial commit"
```

2. **Create GitHub Repository**
   - Go to github.com and create a new repository
   - Name it something like "sofa-shop-website"

3. **Push to GitHub**
```bash
git remote add origin https://github.com/your-username/sofa-shop-website.git
git branch -M main
git push -u origin main
```

4. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Click Save

5. **Configure Public Directory**
   - GitHub Pages will serve the `public/` directory
   - Create a `.github/workflows/deploy.yml` file if you want automated deployments

### Step 2: Deploy Admin API to Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Create Vercel Project**
```bash
cd admin
vercel
```

3. **Configure Environment Variables**
   - Go to Vercel dashboard → your project → Settings → Environment Variables
   - Add:
     - `CONTENTFUL_SPACE_ID`
     - `CONTENTFUL_ACCESS_TOKEN`
     - `CONTENTFUL_MANAGEMENT_TOKEN`
     - `JWT_SECRET`

4. **Deploy Functions**
   - Vercel automatically detects functions in the `api/` directory
   - Move the functions from `admin/functions/` to `admin/api/`

5. **Update Admin Dashboard URLs**
   - Update the API calls in `admin/assets/js/dashboard.js` to use Vercel function URLs

## Option 2: Netlify (Both Public Site and Admin API)

### Step 1: Deploy to Netlify

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Create Netlify Site**
```bash
netlify init
```

3. **Configure Netlify**
   - Choose "Create & deploy a new site"
   - Set publish directory to `public`
   - Set functions directory to `admin/functions`

4. **Add Environment Variables**
   - In Netlify dashboard → Site settings → Environment variables
   - Add the same variables as above

5. **Deploy**
```bash
netlify deploy --prod
```

## Option 3: Traditional Hosting (cPanel, etc.)

### Step 1: Prepare Files

1. **Compress public directory**
```bash
cd public
zip -r ../public-site.zip .
```

2. **Upload to hosting**
   - Use file manager or FTP to upload `public-site.zip`
   - Extract to public_html directory

### Step 2: Deploy Admin API

1. **Set up a separate subdomain**
   - Create `admin.yourdomain.com`
   - Point it to a different directory

2. **Upload admin files**
   - Upload admin directory contents
   - Configure your hosting to serve the admin dashboard

3. **Set up server-side scripts**
   - You'll need to implement the API functions in PHP, Node.js, or Python
   - Configure your hosting to execute server-side scripts

## Contentful Configuration

### For Production

1. **Update API Configuration**
   - In `public/assets/js/main.js`:
   ```javascript
   const CONTENTFUL_CONFIG = {
       spaceId: 'YOUR_PRODUCTION_SPACE_ID',
       accessToken: 'YOUR_PRODUCTION_ACCESS_TOKEN'
   };
   ```

2. **Update Admin Configuration**
   - In `admin/assets/js/dashboard.js`:
   ```javascript
   const CONTENTFUL_CONFIG = {
       spaceId: 'YOUR_PRODUCTION_SPACE_ID',
       accessToken: 'YOUR_PRODUCTION_ACCESS_TOKEN',
       managementToken: 'YOUR_PRODUCTION_MANAGEMENT_TOKEN'
   };
   ```

### Security Best Practices

1. **Never commit API tokens to git**
   - Use environment variables
   - Add `.env` to `.gitignore`

2. **Use different Contentful environments**
   - Use `master` for production
   - Use `staging` for testing
   - Use development spaces for development

3. **Implement proper authentication**
   - Use JWT tokens for admin dashboard
   - Set appropriate token expiration times
   - Implement token refresh mechanisms

## Domain Configuration

### Custom Domain for Public Site

1. **GitHub Pages**
   - Go to repository Settings → Pages
   - Add custom domain
   - Configure DNS records (CNAME)

2. **Netlify**
   - Go to Domain settings
   - Add custom domain
   - Configure DNS records

### Custom Domain for Admin Dashboard

1. **Vercel**
   - Go to project settings → Domains
   - Add admin subdomain (e.g., admin.yourdomain.com)
   - Configure DNS records

2. **Netlify**
   - Go to Domain settings
   - Add admin subdomain
   - Configure DNS records

## SSL/HTTPS Configuration

### GitHub Pages
- Automatically provides HTTPS
- No additional configuration needed

### Vercel
- Automatically provides HTTPS
- Automatic SSL certificates

### Netlify
- Automatically provides HTTPS
- Let's Encrypt integration

### Traditional Hosting
- Install SSL certificate
- Configure HTTPS redirect
- Update all API calls to use HTTPS

## Performance Optimization

### Image Optimization
- Use Contentful's image API for optimization
- Implement lazy loading
- Use WebP format when possible

### Caching
- Configure CDN caching headers
- Implement browser caching
- Use Contentful's built-in CDN

### Code Optimization
- Minify CSS and JavaScript
- Enable gzip compression
- Implement critical CSS

## Monitoring and Analytics

### Google Analytics
1. Add Google Analytics tracking code to `public/index.html`
2. Track page views, user interactions, and conversions

### Error Tracking
- Implement error logging
- Use services like Sentry for error tracking
- Set up alerts for critical errors

### Performance Monitoring
- Use Google PageSpeed Insights
- Monitor Core Web Vitals
- Track load times

## Backup Strategy

### Contentful Backups
- Contentful automatically backs up content
- Export content regularly as JSON
- Keep backups in secure location

### Code Backups
- Git provides version control
- Regular commits to main branch
- Tag releases for major versions

## Post-Deployment Checklist

- [ ] Test all website sections load correctly
- [ ] Verify images display properly
- [ ] Test contact forms work
- [ ] Verify WhatsApp integration
- [ ] Test admin login
- [ ] Verify admin CRUD operations
- [ ] Test content updates appear on public site
- [ ] Check mobile responsiveness
- [ ] Verify SSL/HTTPS is working
- [ ] Test performance (load times)
- [ ] Set up monitoring and analytics
- [ ] Configure email notifications
- [ ] Test backup and restore procedures

## Troubleshooting

### Common Issues

**Website not loading**
- Check GitHub Pages deployment status
- Verify custom domain DNS settings
- Check browser console for errors

**Admin dashboard not working**
- Verify API endpoints are accessible
- Check environment variables are set
- Verify authentication tokens

**Content not updating**
- Check Contentful API credentials
- Verify content is published
- Clear browser cache

**Images not loading**
- Check Contentful asset URLs
- Verify image permissions
- Check CDN settings

### Getting Help

- GitHub Pages: https://docs.github.com/pages
- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com
- Contentful: https://www.contentful.com/docs/

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review and optimize images
- Monitor performance metrics
- Check for security updates
- Backup content regularly

### Content Updates
- Use admin dashboard for content changes
- Test changes on staging environment first
- Schedule updates during low-traffic periods

### Security Updates
- Keep dependencies updated
- Monitor security advisories
- Update SSL certificates
- Review access controls regularly
## GitHub Integration Setup

### GitHub Personal Access Token Configuration

The admin dashboard uses GitHub's Contents API to directly update data files in the repository. This requires a Personal Access Token (PAT) with proper permissions.

#### Required Token Permissions

**Classic PAT (Recommended):**
- **repo** scope (full repository access)
  - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`

**Fine-grained PAT:**
- **Contents**: Read and write
- **Metadata**: Read (required for API access)

#### Token Creation Steps

1. Go to GitHub Settings ? Developer settings ? Personal access tokens ? Tokens (classic)
2. Click "Generate new token (classic)"
3. Set token name: "Home-Sofa Admin Dashboard"
4. Select scopes: Check the **repo** checkbox (this gives full repository access)
5. Click "Generate token"
6. **IMPORTANT**: Copy the token immediately - you won't see it again

#### Token Storage

The token is stored in the browser's localStorage under the key `githubToken`:
- Enter the token in the admin dashboard settings form
- Or enter it when prompted during manual deployment
- The token persists in localStorage for future sessions

#### Security Notes

- ?? **Never commit the token to git** - admin/github-config.js is in .gitignore
- ?? **Token provides full repository access** - keep it secure
- ? **Token is only stored client-side** in localStorage
- ? **Token is only used for GitHub Contents API** calls
- Consider using repository secrets for automated deployments instead

#### Current GitHub Configuration

- **Owner**: salimkhandev622
- **Repository**: Home-Sofa-fork  
- **Branch**: main
- **Deploy Path**: public/data/*.json files
- **Workflow**: .github/workflows/static.yml deploys public/ directory to GitHub Pages

#### Data Write Paths

The admin dashboard writes to these paths via GitHub API:
- `public/data/products.json`
- `public/data/services.json`
- `public/data/reviews.json`
- `public/data/hero-slides.json`
- `public/data/business-info.json`

All paths are within the `public/` directory that gets deployed to GitHub Pages.
