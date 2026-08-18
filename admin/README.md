# Admin Dashboard - File-Based CMS with GitHub Integration

## Overview
This admin dashboard uses a file-based CMS system with GitHub API integration. All content is stored in JSON files and changes can be automatically committed to GitHub to trigger deployment.

## How It Works

### Data Storage
- **Admin Data**: `admin/data/*.json` - Editable via admin dashboard
- **Public Data**: `public/data/*.json` - Read by the public website
- **Browser Storage**: Temporary storage for testing changes
- **GitHub Repository**: Permanent storage with automatic deployment

### Workflow Options

#### Option 1: Automatic Deployment (Recommended)
1. **Configure GitHub API**: Go to Settings and add your GitHub credentials
2. **Make Changes**: Use the admin dashboard to add/edit/delete content
3. **Save Changes**: Click save - changes are automatically committed to GitHub
4. **Auto-Deploy**: GitHub Actions automatically deploys your changes to the website

#### Option 2: Manual Deployment
1. **Make Changes**: Use the admin dashboard to add/edit/delete content
2. **Test Changes**: Changes are saved to browser localStorage for immediate testing
3. **Export Data**: Copy JSON from localStorage to admin data files
4. **Manual Deploy**: Commit and push changes to GitHub

## Data Files

### Products (`admin/data/products.json`)
```json
[
  {
    "id": 1,
    "name": "Product Name",
    "price": 1000,
    "shortDescription": "Short description",
    "fullDescription": "Full description",
    "category": "sofa",
    "mainImage": "assets/images/product.jpg",
    "galleryImages": [],
    "featured": true,
    "bestSeller": false,
    "available": true,
    "displayOrder": 1
  }
]
```

### Services (`admin/data/services.json`)
```json
[
  {
    "id": 1,
    "title": "Service Title",
    "description": "Service description",
    "image": "assets/images/service.jpg",
    "features": ["Feature 1", "Feature 2"]
  }
]
```

### Reviews (`admin/data/reviews.json`)
```json
[
  {
    "id": 1,
    "name": "Customer Name",
    "rating": 5,
    "reviewText": "Review text",
    "status": "approved"
  }
]
```

### Hero Slides (`admin/data/hero-slides.json`)
```json
[
  {
    "id": 1,
    "image": "assets/images/hero.jpg",
    "title": "Slide Title",
    "description": "Slide description text",
    "order": 1,
    "active": true
  }
]
```

### Business Info (`admin/data/business-info.json`)
```json
{
  "shopName": "Shop Name",
  "phone": "+971 50 000 0000",
  "whatsapp": "+971 50 000 0000",
  "email": "info@example.com",
  "address": "Address",
  "openingHours": "9:00 AM - 10:00 PM"
}
```

### Contact Requests (`admin/data/contact-requests.json`)
```json
[
  {
    "id": 1,
    "name": "Name",
    "email": "email@example.com",
    "phone": "+971 50 000 0000",
    "service": "service-name",
    "message": "Message",
    "date": "2024-01-15",
    "status": "pending"
  }
]
```

## GitHub API Setup

### Step 1: Create GitHub Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select the following scopes:
   - `repo` (full control of private repositories)
4. Generate token and copy it (you won't see it again)

### Step 2: Configure Admin Dashboard
1. Go to Settings in the admin dashboard
2. Fill in the GitHub API configuration:
   - **Repository Owner**: Your GitHub username (e.g., `salimkhandev622`)
   - **Repository Name**: Your repository name (e.g., `Home-Sofa-fork`)
   - **Personal Access Token**: The token you created in Step 1
   - **Branch Name**: Usually `main`
3. Click "Save Configuration"

### Step 3: Test Configuration
1. Click "Check Deployment Status" in Settings
2. You should see the latest GitHub Actions workflow run status
3. If configured correctly, all save operations will now trigger automatic deployment

## Deployment Process

### Automatic Deployment (Recommended)
1. **Configure GitHub API** in Settings:
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` scope
   - Enter token and repository details in admin dashboard Settings
2. **Make changes** in the admin dashboard
3. **Click save** - changes are automatically committed to GitHub
4. **Auto-deploy** - GitHub Actions automatically deploys to the website
5. **Changes appear** on the website in 2-5 minutes

### Manual Deployment
1. Make changes in the admin dashboard
2. Test changes in the browser
3. Open browser DevTools → Application → Local Storage
4. Copy the JSON data from localStorage
5. Update the corresponding file in `admin/data/`
6. Copy updated files to `public/data/`
7. Commit and push to GitHub
8. GitHub Actions will automatically deploy

### Quick Update Script:
```javascript
// In browser console after making changes:
console.log(JSON.parse(localStorage.getItem('products.json')));
```

## Login Credentials
- **Email**: admin@homesofa.ae
- **Password**: admin123

## Security Notes
- Change the admin credentials before production deployment
- Currently uses client-side authentication (for demo purposes)
- For production, implement proper server-side authentication
- Never commit sensitive data to repository

## Features
- ✅ Product management (CRUD)
- ✅ Service management (CRUD)
- ✅ Review moderation
- ✅ Hero slider management
- ✅ Business info management
- ✅ Contact request tracking
- ✅ Real-time preview via localStorage
- ✅ GitHub API integration for automatic deployment
- ✅ Deployment status monitoring
- ✅ File-based deployment

## Troubleshooting
- **Changes not appearing**: Clear browser cache and localStorage
- **Data not persisting**: Check browser localStorage has space available
- **Deployment issues**: Verify GitHub Actions workflow is running