// Admin Dashboard JavaScript
let state = {
    products: [],
    services: [],
    reviews: [],
    heroSlides: [],
    businessInfo: {},
    contactRequests: [],
    currentSection: 'dashboard'
};

// Track if GitHub is configured
let isGitHubConfigured = false;

// Data Management Functions
async function loadDataFromFile(filename) {
    try {
        const timestamp = new Date().getTime();
        // Try loading from admin data folder first
        let response = await fetch(`data/${filename}?t=${timestamp}`);
        if (!response.ok) {
            // Fall back to public data folder
            response = await fetch(`../public/data/${filename}?t=${timestamp}`);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}`);
            }
        }
        const data = await response.json();

        // Also save to localStorage for deployment
        localStorage.setItem(filename, JSON.stringify(data));

        return data;
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        return null;
    }
}

async function saveDataToFile(filename, data) {
    try {
        // Save to localStorage for instant local preview
        localStorage.setItem(filename, JSON.stringify(data));
        console.log(`Data saved to localStorage ${filename}:`, data);

        // Update local state immediately
        if (filename === 'products.json') state.products = data;
        if (filename === 'services.json') state.services = data;
        if (filename === 'reviews.json') state.reviews = data;
        if (filename === 'hero-slides.json') state.heroSlides = data;
        if (filename === 'business-info.json') state.businessInfo = data;
        if (filename === 'contact-requests.json') state.contactRequests = data;

        // Auto commit & push directly to GitHub repository
        const config = getGitHubConfig();
        if (config.githubToken) {
            console.log(`Pushing ${filename} to GitHub repository...`);
            await saveToGitHub(`public/data/${filename}`, data, config);
            await saveToGitHub(`admin/data/${filename}`, data, config);
        }

        return true;
    } catch (error) {
        console.error(`Error saving ${filename}:`, error);
        throw error;
    }
}

// GitHub API Functions
function getGitHubConfig() {
    if (typeof GITHUB_CONFIG !== 'undefined' && GITHUB_CONFIG && GITHUB_CONFIG.githubToken) {
        return GITHUB_CONFIG;
    }
    return {
        githubOwner: 'salimkhandev622',
        githubRepo: 'Home-Sofa-fork',
        githubToken: localStorage.getItem('githubToken') || '',
        githubBranch: 'main'
    };
}

// UTF-8 safe base64 encoding for Arabic text and special characters
function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Save image to GitHub / Vercel API
async function saveImageToGitHub(filename, base64Content) {
    try {
        const filePath = `public/assets/images/${filename}`;
        return await saveFileContent(filePath, base64Content, `Upload image ${filename} via admin dashboard`);
    } catch (error) {
        console.error('Error uploading image:', error);
        return false;
    }
}

async function saveToGitHub(filePath, data, config) {
    const content = utf8ToBase64(JSON.stringify(data, null, 2));
    return await saveFileContent(filePath, content, `Update ${filePath} via admin dashboard`);
}

const VERCEL_API_ENDPOINT = 'https://home-sofa-fork.vercel.app/api/save';

async function saveFileContent(filePath, base64Content, message) {
    // 1. Try Vercel Serverless API first (secure backend with GITHUB_TOKEN in Vercel .env)
    try {
        const res = await fetch(VERCEL_API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath, content: base64Content, message })
        });
        if (res.ok) {
            console.log(`✅ Saved ${filePath} via Vercel Serverless API`);
            return true;
        }
        const errData = await res.json().catch(() => ({}));
        console.warn('Vercel API error, falling back to direct GitHub API:', errData);
    } catch (err) {
        console.warn('Vercel API unreachable, falling back to direct GitHub API:', err);
    }

    // 2. Direct GitHub REST API fallback
    const githubConfig = getGitHubConfig();
    if (!githubConfig.githubToken) {
        throw new Error('Deployment error: Unable to connect to Vercel API or GitHub.');
    }

    let sha = null;
    try {
        const getFileResponse = await fetch(
            `https://api.github.com/repos/${githubConfig.githubOwner}/${githubConfig.githubRepo}/contents/${filePath}?ref=${githubConfig.githubBranch}&t=${Date.now()}`,
            {
                headers: {
                    'Authorization': `token ${githubConfig.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (getFileResponse.ok) {
            const fileData = await getFileResponse.json();
            sha = fileData.sha;
        }
    } catch (error) {
        console.log(`File ${filePath} does not exist yet on remote, creating new`);
    }

    const putData = {
        message: message || `Update ${filePath} via admin dashboard`,
        content: base64Content,
        branch: githubConfig.githubBranch
    };

    if (sha) {
        putData.sha = sha;
    }

    const putResponse = await fetch(
        `https://api.github.com/repos/${githubConfig.githubOwner}/${githubConfig.githubRepo}/contents/${filePath}`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubConfig.githubToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify(putData)
        }
    );

    if (!putResponse.ok) {
        const errorText = await putResponse.text();
        console.error('GitHub API error details:', errorText);
        throw new Error(`GitHub API error: ${putResponse.status} - ${errorText}`);
    }

    console.log(`✅ File ${filePath} successfully committed to GitHub`);
    return true;
}

async function manualDeploy() {
    const deployBtn = document.getElementById('deployBtn');
    const originalText = deployBtn ? deployBtn.innerHTML : 'Publish';

    let githubConfig = getGitHubConfig();
    showLoading('Pushing all data and deploying to GitHub Pages...');

    if (deployBtn) {
        deployBtn.innerHTML = '🔄 Deploying...';
        deployBtn.disabled = true;
    }

    try {
        const products = JSON.parse(localStorage.getItem('products.json') || '[]');
        const services = JSON.parse(localStorage.getItem('services.json') || '[]');
        const reviews = JSON.parse(localStorage.getItem('reviews.json') || '[]');
        const heroSlides = JSON.parse(localStorage.getItem('hero-slides.json') || '[]');
        const businessInfo = JSON.parse(localStorage.getItem('business-info.json') || '{}');

        // Deploy products
        await saveToGitHub('public/data/products.json', products, githubConfig);
        await saveToGitHub('admin/data/products.json', products, githubConfig);

        // Deploy services
        await saveToGitHub('public/data/services.json', services, githubConfig);
        await saveToGitHub('admin/data/services.json', services, githubConfig);

        // Deploy reviews
        await saveToGitHub('public/data/reviews.json', reviews, githubConfig);
        await saveToGitHub('admin/data/reviews.json', reviews, githubConfig);

        // Deploy hero slides
        await saveToGitHub('public/data/hero-slides.json', heroSlides, githubConfig);
        await saveToGitHub('admin/data/hero-slides.json', heroSlides, githubConfig);

        // Deploy business info
        await saveToGitHub('public/data/business-info.json', businessInfo, githubConfig);
        await saveToGitHub('admin/data/business-info.json', businessInfo, githubConfig);

        showSuccess('Changes committed and pushed to GitHub! Site will update in ~1 min.');
        checkDeploymentStatus();
    } catch (error) {
        console.error('Deployment error:', error);
        showError('Deployment failed: ' + error.message);
    } finally {
        if (deployBtn) {
            deployBtn.innerHTML = originalText;
            deployBtn.disabled = false;
        }
        hideLoading();
    }
}

async function checkDeploymentStatus() {
    const config = getGitHubConfig();
    const statusDiv = document.getElementById('deploymentStatus');
    if (!statusDiv) return;

    if (!config.githubToken) {
        statusDiv.innerHTML = '<p class="status-warning">⚠️ GitHub token not configured. Please configure GitHub token in settings.</p>';
        return;
    }

    try {
        statusDiv.innerHTML = '<p class="status-loading">🔄 Checking deployment status...</p>';

        const response = await fetch(
            `https://api.github.com/repos/${config.githubOwner}/${config.githubRepo}`,
            {
                headers: {
                    'Authorization': `token ${config.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();
        const lastUpdated = new Date(data.pushed_at).toLocaleString();

        statusDiv.innerHTML = `
                <div class="status-item">
                    <span class="status-icon">✅</span>
                    <span class="status-text">Repository: ${config.githubOwner}/${config.githubRepo}</span>
                </div>
                <div class="status-item">
                    <span class="status-icon">🌿</span>
                    <span class="status-text">Branch: ${config.githubBranch}</span>
                </div>
                <div class="status-item">
                    <span class="status-icon">📅</span>
                    <span class="status-text">Last Updated: ${lastUpdated}</span>
                </div>
                <a href="/public/index.html" target="_blank" class="btn btn-secondary btn-sm">View Live Site</a>
            `;
    } catch (error) {
        console.error('Error checking deployment status:', error);
        statusDiv.innerHTML = `<p class="status-error">❌ Error checking deployment status: ${error.message}</p>`;
    }
}

// DOM Elements
const elements = {
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    menuToggle: document.getElementById('menuToggle'),
    currentSection: document.getElementById('currentSection'),
    navLinks: document.querySelectorAll('.sidebar-nav a')
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    initializeDashboard();
    initializeGitHubConfigForm();
    initializeBusinessInfoAutoSave();
});

function initializeGitHubConfigForm() {
    const tokenInput = document.getElementById('githubToken');
    const form = document.getElementById('apiConfigForm');
    if (tokenInput) {
        tokenInput.value = localStorage.getItem('githubToken') || '';

        tokenInput.addEventListener('input', () => {
            localStorage.setItem('githubToken', tokenInput.value.trim());
        });
    }
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (tokenInput) localStorage.setItem('githubToken', tokenInput.value.trim());
            showSuccess('GitHub API configuration saved successfully!');
        });
    }
}

// Auto-save: debounce timer for business info form
let _businessAutoSaveTimer = null;

function setAutoSaveStatus(state) {
    const el = document.getElementById('autoSaveStatus');
    if (!el) return;
    el.className = 'auto-save-status ' + state;
    if (state === 'saving') el.textContent = '⏳ Saving...';
    else if (state === 'saved') el.textContent = '✓ Saved';
    else if (state === 'error') el.textContent = '✗ Save failed';
    else el.textContent = 'Unsaved changes';
}

/* Attach debounced auto-save listeners to all business info inputs.
   Called after DOM is ready; safe to call even before the section is visible. */
function initializeBusinessInfoAutoSave() {
    const form = document.getElementById('businessInfoForm');
    if (!form) return;

    form.addEventListener('input', () => {
        setAutoSaveStatus('unsaved');
        clearTimeout(_businessAutoSaveTimer);
        // 1.5s debounce — save only after user stops typing
        _businessAutoSaveTimer = setTimeout(() => {
            saveBusinessInfo(true); // silent = true
        }, 1500);
    });

    form.addEventListener('change', () => {
        setAutoSaveStatus('unsaved');
        clearTimeout(_businessAutoSaveTimer);
        _businessAutoSaveTimer = setTimeout(() => {
            saveBusinessInfo(true);
        }, 1500);
    });
}

function checkAuthentication() {
    // Secret route direct access - authentication bypassed
    return true;
}

async function initializeDashboard() {
    showLoading('Loading dashboard data...');

    try {
        // Load all data
        await loadDashboardData();

        // Initialize navigation
        initializeNavigation();

        // Render dashboard
        renderDashboard();

        // Initialize mobile menu
        initializeMobileMenu();

    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showError('Failed to load dashboard data');
    } finally {
        hideLoading();
    }
}

async function loadDashboardData() {
    // Load data from JSON files first (source of truth)
    // Then sync to localStorage for deployment
    state.products = await loadDataFromFile('products.json') || [];
    state.services = await loadDataFromFile('services.json') || [];
    state.reviews = await loadDataFromFile('reviews.json') || [];
    state.heroSlides = await loadDataFromFile('hero-slides.json') || [];
    state.businessInfo = await loadDataFromFile('business-info.json') || {};
    state.contactRequests = await loadDataFromFile('contact-requests.json') || [];

    // Sync all data to localStorage for deployment
    localStorage.setItem('products.json', JSON.stringify(state.products));
    localStorage.setItem('services.json', JSON.stringify(state.services));
    localStorage.setItem('reviews.json', JSON.stringify(state.reviews));
    localStorage.setItem('hero-slides.json', JSON.stringify(state.heroSlides));
    localStorage.setItem('business-info.json', JSON.stringify(state.businessInfo));
    localStorage.setItem('contact-requests.json', JSON.stringify(state.contactRequests));

    console.log('Dashboard data loaded:', {
        products: state.products.length,
        services: state.services.length,
        reviews: state.reviews.length,
        heroSlides: state.heroSlides.length
    });
}

// Sync admin data with public data
async function syncAdminToPublic(filename) {
    try {
        const adminData = await loadDataFromFile(filename.replace('public/', ''));
        if (adminData) {
            localStorage.setItem(filename, JSON.stringify(adminData));
            console.log(`Synced ${filename} from admin to public`);
        }
    } catch (error) {
        console.log(`Could not sync ${filename} from admin to public`);
    }
}



function renderDashboard() {
    // Update stats
    document.getElementById('totalProducts').textContent = state.products.length;
    document.getElementById('totalReviews').textContent = state.reviews.length;
    document.getElementById('pendingInquiries').textContent = state.contactRequests.filter(r => r.status === 'pending').length;
    document.getElementById('pendingReviews').textContent = state.reviews.filter(r => r.status === 'pending').length;

    // Render recent activity
    renderRecentActivity();

    // Render products table
    renderProductsTable();

    // Render services table
    renderServicesTable();

    // Render reviews table
    renderReviewsTable();

    // Render hero slides table
    renderHeroTable();

    // Render contact requests table
    renderContactTable();

    // Populate business info form
    populateBusinessInfo();
}

function renderRecentActivity() {
    const tbody = document.getElementById('recentActivity');
    if (!tbody) return;

    // Show no recent activity message instead of fake data
    tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #666;">No recent activity to display</td>
            </tr>
        `;
}

function renderProductsTable() {
    const tbody = document.getElementById('productsTable');
    tbody.innerHTML = state.products.map(product => {
        // Fix image path for admin dashboard - images are in public/assets/images/
        const imagePath = product.mainImage.startsWith('http')
            ? product.mainImage
            : (product.mainImage.startsWith('../')
                ? product.mainImage
                : `../public/${product.mainImage}`);

        return `
            <tr>
                <td><img src="${imagePath}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" onerror="this.src='https://via.placeholder.com/50x50?text=No+Image'"></td>
                <td>${product.name}</td>
                <td>AED ${product.price.toLocaleString()}</td>
                <td>${product.category || 'N/A'}</td>
                <td>
                    <span class="badge badge-${product.available ? 'success' : 'danger'}">${product.available ? 'Available' : 'Unavailable'}</span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="table-btn edit" onclick="editProduct(${product.id})">Edit</button>
                        <button class="table-btn delete" onclick="deleteProduct(${product.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderServicesTable() {
    const tbody = document.getElementById('servicesTable');
    tbody.innerHTML = state.services.map(service => {
        // Fix image path for admin dashboard
        const imagePath = service.image.startsWith('http')
            ? service.image
            : (service.image.startsWith('../')
                ? service.image
                : `../public/${service.image}`);

        return `
            <tr>
                <td><img src="${imagePath}" alt="${service.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" onerror="this.src='https://via.placeholder.com/50x50?text=No+Image'"></td>
                <td>${service.title}</td>
                <td>${service.description.substring(0, 50)}...</td>
                <td>
                    <div class="table-actions">
                        <button class="table-btn edit" onclick="editService(${service.id})">Edit</button>
                        <button class="table-btn delete" onclick="deleteService(${service.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderReviewsTable() {
    const tbody = document.getElementById('reviewsTable');
    tbody.innerHTML = state.reviews.map(review => `
            <tr>
                <td>${review.name}</td>
                <td>${'⭐'.repeat(review.rating)}</td>
                <td>${review.reviewText.substring(0, 50)}...</td>
                <td>
                    <span class="badge badge-${review.status === 'approved' ? 'success' : review.status === 'rejected' ? 'danger' : 'warning'}">${review.status}</span>
                </td>
                <td>
                    <div class="table-actions">
                        ${review.status === 'pending' ? `
                            <button class="table-btn view" onclick="approveReview(${review.id})">Approve</button>
                            <button class="table-btn delete" onclick="rejectReview(${review.id})">Reject</button>
                        ` : `
                            <button class="table-btn delete" onclick="deleteReview(${review.id})">Delete</button>
                        `}
                    </div>
                </td>
            </tr>
        `).join('');
}

function renderHeroTable() {
    const tbody = document.getElementById('heroTable');
    tbody.innerHTML = state.heroSlides.map(slide => {
        // Fix image path for admin dashboard
        const imagePath = slide.image.startsWith('http')
            ? slide.image
            : (slide.image.startsWith('../')
                ? slide.image
                : `../public/${slide.image}`);

        return `
            <tr>
                <td><img src="${imagePath}" alt="${slide.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" onerror="this.src='https://via.placeholder.com/50x50?text=No+Image'"></td>
                <td>${slide.title}</td>
                <td>${slide.order}</td>
                <td>
                    <span class="badge badge-${slide.active ? 'success' : 'danger'}">${slide.active ? 'Active' : 'Inactive'}</span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="table-btn edit" onclick="editHeroSlide(${slide.id})">Edit</button>
                        <button class="table-btn delete" onclick="deleteHeroSlide(${slide.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderContactTable() {
    const tbody = document.getElementById('contactTable');
    tbody.innerHTML = state.contactRequests.map(request => `
            <tr>
                <td>${request.name}</td>
                <td>${request.email}</td>
                <td>${request.phone}</td>
                <td>${request.service}</td>
                <td>${request.date}</td>
                <td>
                    <div class="table-actions">
                        <button class="table-btn view" onclick="viewContactRequest(${request.id})">View</button>
                        <button class="table-btn delete" onclick="deleteContactRequest(${request.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
}



// Navigation
function initializeNavigation() {
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            navigateToSection(section);
        });
    });
}

function navigateToSection(section) {
    // Update active nav link
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === section) {
            link.classList.add('active');
        }
    });

    // Update current section text
    elements.currentSection.textContent = section.charAt(0).toUpperCase() + section.slice(1);

    // Show/hide sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });

    const targetSection = document.getElementById(`${section}-section`);
    if (targetSection) {
        targetSection.style.display = 'block';
    }

    state.currentSection = section;

    // Close mobile menu
    closeSidebar();
}

function closeSidebar() {
    if (elements.sidebar) elements.sidebar.classList.remove('active');
    if (elements.sidebarOverlay) elements.sidebarOverlay.classList.remove('active');
}
window.closeSidebar = closeSidebar;

// Mobile Menu
function initializeMobileMenu() {
    if (elements.menuToggle) {
        elements.menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (elements.sidebar) elements.sidebar.classList.toggle('active');
            if (elements.sidebarOverlay) elements.sidebarOverlay.classList.toggle('active');
        });
    }
}

// Product Management
function showProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const form = document.getElementById('productForm');

    if (productId) {
        title.textContent = 'Edit Product';
        const product = state.products.find(p => p.id === productId);
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productShortDescription').value = product.shortDescription;
            document.getElementById('productFullDescription').value = product.fullDescription;
            document.getElementById('productDisplayOrder').value = product.displayOrder;
            document.getElementById('productFeatured').checked = product.featured;
            document.getElementById('productBestSeller').checked = product.bestSeller;
            document.getElementById('productAvailable').checked = product.available;

            // Show main image preview
            const mainImagePreview = document.getElementById('mainImagePreview');
            const imagePath = product.mainImage.startsWith('http')
                ? product.mainImage
                : `../public/${product.mainImage}`;
            mainImagePreview.innerHTML = `<img src="${imagePath}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">`;

            // Show gallery images preview
            const galleryImagesPreview = document.getElementById('galleryImagesPreview');
            galleryImagesPreview.innerHTML = '';
            if (product.galleryImages && product.galleryImages.length > 0) {
                product.galleryImages.forEach((imgSrc, index) => {
                    const imgPath = imgSrc.startsWith('http') ? imgSrc : `../public/${imgSrc}`;
                    const div = document.createElement('div');
                    div.className = 'image-preview-item';
                    div.innerHTML = `
                            <img src="${imgPath}">
                            <button type="button" class="image-preview-remove" onclick="this.parentElement.remove()">×</button>
                        `;
                    galleryImagesPreview.appendChild(div);
                });
            }
        }
    } else {
        title.textContent = 'Add Product';
        form.reset();
        document.getElementById('productId').value = '';
        document.getElementById('productAvailable').checked = true;
        document.getElementById('mainImagePreview').innerHTML = '';
        document.getElementById('galleryImagesPreview').innerHTML = '';
    }

    modal.style.display = 'block';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

async function saveProduct() {
    showLoading('Saving product and uploading images...');
    try {
        const form = document.getElementById('productForm');
        const formData = new FormData(form);

        const productData = {
            name: formData.get('name'),
            price: parseFloat(formData.get('price')),
            category: formData.get('category'),
            shortDescription: formData.get('shortDescription'),
            fullDescription: formData.get('fullDescription'),
            displayOrder: parseInt(formData.get('displayOrder')) || 0,
            featured: formData.get('featured') === 'on',
            bestSeller: formData.get('bestSeller') === 'on',
            available: formData.get('available') === 'on'
        };

        const productId = formData.get('productId');

        // Handle main image upload
        const mainImageInput = document.getElementById('mainImageInput');
        if (mainImageInput.files.length > 0) {
            const mainImageFile = mainImageInput.files[0];
            const mainImageBase64 = await fileToBase64(mainImageFile);
            const mainImageFileName = `product_${Date.now()}_main.${mainImageFile.name.split('.').pop()}`;

            const imageUploadSuccess = await saveImageToGitHub(mainImageFileName, mainImageBase64);
            if (imageUploadSuccess) {
                productData.mainImage = `assets/images/${mainImageFileName}`;
            } else if (productId) {
                const index = state.products.findIndex(p => p.id === parseInt(productId));
                if (index !== -1) {
                    productData.mainImage = state.products[index].mainImage;
                }
            }
        } else if (!productId) {
            productData.mainImage = 'assets/images/hero_sofa.jpg';
        }

        // Handle gallery images upload
        const galleryImagesInput = document.getElementById('galleryImagesInput');
        if (galleryImagesInput.files.length > 0) {
            productData.galleryImages = [];
            for (let i = 0; i < galleryImagesInput.files.length; i++) {
                const galleryFile = galleryImagesInput.files[i];
                const galleryBase64 = await fileToBase64(galleryFile);
                const galleryFileName = `product_${Date.now()}_gallery_${i}.${galleryFile.name.split('.').pop()}`;

                const galleryUploadSuccess = await saveImageToGitHub(galleryFileName, galleryBase64);
                if (galleryUploadSuccess) {
                    productData.galleryImages.push(`assets/images/${galleryFileName}`);
                }
            }
        } else if (!productId) {
            productData.galleryImages = [];
        }

        if (productId) {
            const index = state.products.findIndex(p => p.id === parseInt(productId));
            if (index !== -1) {
                if (!productData.mainImage) {
                    productData.mainImage = state.products[index].mainImage;
                }
                if (!productData.galleryImages || productData.galleryImages.length === 0) {
                    productData.galleryImages = state.products[index].galleryImages || [];
                }
                state.products[index] = { ...state.products[index], ...productData };
            }
        } else {
            productData.id = Date.now();
            state.products.push(productData);
        }

        await saveDataToFile('products.json', state.products);
        renderProductsTable();
        renderDashboard();
        closeProductModal();

        showSuccess('Product saved and updated on GitHub successfully!');
    } catch (error) {
        console.error('Error saving product:', error);
        showError('Failed to save product: ' + error.message);
    } finally {
        hideLoading();
    }
}

function editProduct(productId) {
    showProductModal(productId);
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    showLoading('Deleting product...');
    try {
        state.products = state.products.filter(p => p.id !== productId);
        await saveDataToFile('products.json', state.products);
        renderProductsTable();
        renderDashboard();
        showSuccess('Product deleted and updated on GitHub!');
    } catch (error) {
        console.error('Error deleting product:', error);
        showError('Failed to delete product: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Review Management
async function approveReview(reviewId) {
    showLoading('Approving review...');
    try {
        const review = state.reviews.find(r => r.id === reviewId);
        if (review) {
            review.status = 'approved';
            await saveDataToFile('reviews.json', state.reviews);
            renderReviewsTable();
            renderDashboard();
            showSuccess('Review approved successfully!');
        }
    } catch (error) {
        console.error('Error approving review:', error);
        showError('Failed to approve review: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function rejectReview(reviewId) {
    showLoading('Rejecting review...');
    try {
        const review = state.reviews.find(r => r.id === reviewId);
        if (review) {
            review.status = 'rejected';
            await saveDataToFile('reviews.json', state.reviews);
            renderReviewsTable();
            renderDashboard();
            showSuccess('Review rejected successfully!');
        }
    } catch (error) {
        console.error('Error rejecting review:', error);
        showError('Failed to reject review: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function deleteReview(reviewId) {
    if (!confirm('Are you sure you want to delete this review?')) return;
    showLoading('Deleting review...');
    try {
        state.reviews = state.reviews.filter(r => r.id !== reviewId);
        await saveDataToFile('reviews.json', state.reviews);
        renderReviewsTable();
        renderDashboard();
        showSuccess('Review deleted successfully!');
    } catch (error) {
        console.error('Error deleting review:', error);
        showError('Failed to delete review: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Business Info Management
/* silent=true: skip full-screen overlay, only update inline status badge.
   silent=false (default): original behaviour with showLoading overlay. */
async function saveBusinessInfo(silent = false) {
    if (!silent) showLoading('Saving business information...');
    else setAutoSaveStatus('saving');

    try {
        state.businessInfo = {
            shopName: document.getElementById('shopName').value,
            phone: document.getElementById('phone').value,
            whatsapp: document.getElementById('whatsapp').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            openingHours: document.getElementById('openingHours').value,
            socialLinks: {
                facebook: document.getElementById('facebook')?.value || '#',
                instagram: document.getElementById('instagram')?.value || '#'
            },
            mapCoordinates: {
                lat: document.getElementById('mapLat')?.value || 25.12345678901234,
                lng: document.getElementById('mapLng')?.value || 55.12345678901234
            }
        };

        await saveDataToFile('business-info.json', state.businessInfo);

        if (!silent) showSuccess('Business information saved and updated on GitHub successfully!');
        else setAutoSaveStatus('saved');
    } catch (error) {
        console.error('Error saving business info:', error);
        if (!silent) showError('Failed to save business info: ' + error.message);
        else setAutoSaveStatus('error');
    } finally {
        if (!silent) hideLoading();
    }
}

function populateBusinessInfo() {
    document.getElementById('shopName').value = state.businessInfo.shopName || '';
    document.getElementById('phone').value = state.businessInfo.phone || '';
    document.getElementById('whatsapp').value = state.businessInfo.whatsapp || '';
    document.getElementById('email').value = state.businessInfo.email || '';
    document.getElementById('address').value = state.businessInfo.address || '';
    document.getElementById('openingHours').value = state.businessInfo.openingHours || '';

    if (state.businessInfo.socialLinks) {
        if (document.getElementById('facebook')) {
            document.getElementById('facebook').value = state.businessInfo.socialLinks.facebook || '';
        }
        if (document.getElementById('instagram')) {
            document.getElementById('instagram').value = state.businessInfo.socialLinks.instagram || '';
        }
    }

    if (state.businessInfo.mapCoordinates) {
        if (document.getElementById('mapLat')) {
            document.getElementById('mapLat').value = state.businessInfo.mapCoordinates.lat || '';
        }
        if (document.getElementById('mapLng')) {
            document.getElementById('mapLng').value = state.businessInfo.mapCoordinates.lng || '';
        }
    }
}

// Contact Request Management
function viewContactRequest(requestId) {
    const request = state.contactRequests.find(r => r.id === requestId);
    if (request) {
        showInfo(`<strong>${request.name}</strong><br>Email: ${request.email}<br>Phone: ${request.phone}<br>Message: ${request.message}`);
    }
}

async function markContactRequestAsRead(requestId) {
    showLoading('Updating inquiry status...');
    try {
        const request = state.contactRequests.find(r => r.id === requestId);
        if (request) {
            request.status = 'read';
            await saveDataToFile('contact-requests.json', state.contactRequests);
            renderContactTable();
            renderDashboard();
            showSuccess('Inquiry marked as read!');
        }
    } catch (error) {
        console.error('Error updating inquiry status:', error);
        showError('Failed to update inquiry status: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function deleteContactRequest(requestId) {
    if (!confirm('Are you sure you want to delete this contact request?')) return;
    showLoading('Deleting inquiry...');
    try {
        state.contactRequests = state.contactRequests.filter(r => r.id !== requestId);
        await saveDataToFile('contact-requests.json', state.contactRequests);
        renderContactTable();
        renderDashboard();
        showSuccess('Inquiry deleted successfully!');
    } catch (error) {
        console.error('Error deleting inquiry:', error);
        showError('Failed to delete inquiry: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Service Management
function showServiceModal(serviceId = null) {
    const modal = document.getElementById('serviceModal');
    const title = document.getElementById('serviceModalTitle');
    const form = document.getElementById('serviceForm');

    if (serviceId) {
        const service = state.services.find(s => s.id === serviceId);
        if (service) {
            title.textContent = 'Edit Service';
            document.getElementById('serviceId').value = service.id;
            document.getElementById('serviceTitle').value = service.title;
            document.getElementById('serviceDescription').value = service.description;
            document.getElementById('serviceFeatures').value = service.features ? service.features.join(', ') : '';
            document.getElementById('serviceButtonText').value = service.buttonText || 'Get Quote';
            document.getElementById('serviceButtonLink').value = service.buttonLink || 'whatsapp';
        }
    } else {
        title.textContent = 'Add Service';
        form.reset();
        document.getElementById('serviceId').value = '';
        document.getElementById('serviceButtonText').value = 'Get Quote';
        document.getElementById('serviceButtonLink').value = 'whatsapp';
    }

    modal.style.display = 'block';
}

function closeServiceModal() {
    document.getElementById('serviceModal').style.display = 'none';
}

async function saveService() {
    showLoading('Saving service and uploading image...');
    try {
        const form = document.getElementById('serviceForm');
        const serviceId = document.getElementById('serviceId').value;

        const serviceData = {
            title: document.getElementById('serviceTitle').value,
            description: document.getElementById('serviceDescription').value,
            features: document.getElementById('serviceFeatures').value.split(',').map(f => f.trim()).filter(f => f),
            buttonText: document.getElementById('serviceButtonText').value || 'Get Quote',
            buttonLink: document.getElementById('serviceButtonLink').value || 'whatsapp'
        };

        const serviceImageInput = document.getElementById('serviceImageInput');
        if (serviceImageInput.files.length > 0) {
            const serviceImageFile = serviceImageInput.files[0];
            const serviceImageBase64 = await fileToBase64(serviceImageFile);
            const serviceImageFileName = `service_${Date.now()}.${serviceImageFile.name.split('.').pop()}`;

            const serviceImageUploadSuccess = await saveImageToGitHub(serviceImageFileName, serviceImageBase64);
            if (serviceImageUploadSuccess) {
                serviceData.image = `assets/images/${serviceImageFileName}`;
            } else if (serviceId) {
                const index = state.services.findIndex(s => s.id === parseInt(serviceId));
                if (index !== -1) {
                    serviceData.image = state.services[index].image;
                }
            }
        } else if (!serviceId) {
            serviceData.image = 'assets/images/service_sofa_beds.jpg';
        }

        if (serviceId) {
            const index = state.services.findIndex(s => s.id === parseInt(serviceId));
            if (index !== -1) {
                if (!serviceData.image) {
                    serviceData.image = state.services[index].image;
                }
                state.services[index] = { ...state.services[index], ...serviceData };
            }
        } else {
            const newId = Math.max(...state.services.map(s => s.id), 0) + 1;
            state.services.push({ id: newId, ...serviceData });
        }

        await saveDataToFile('services.json', state.services);
        renderServicesTable();
        closeServiceModal();
        showSuccess('Service saved and updated on GitHub successfully!');
    } catch (error) {
        console.error('Error saving service:', error);
        showError('Failed to save service: ' + error.message);
    } finally {
        hideLoading();
    }
}

function editService(serviceId) {
    showServiceModal(serviceId);
}

async function deleteService(serviceId) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    showLoading('Deleting service...');
    try {
        state.services = state.services.filter(s => s.id !== serviceId);
        await saveDataToFile('services.json', state.services);
        renderServicesTable();
        showSuccess('Service deleted and updated on GitHub!');
    } catch (error) {
        console.error('Error deleting service:', error);
        showError('Failed to delete service: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Hero Slide Management
function showHeroModal(slideId = null) {
    const modal = document.getElementById('heroModal');
    const title = document.getElementById('heroModalTitle');
    const form = document.getElementById('heroForm');

    if (slideId) {
        const slide = state.heroSlides.find(s => s.id === slideId);
        if (slide) {
            title.textContent = 'Edit Hero Slide';
            document.getElementById('heroId').value = slide.id;
            document.getElementById('heroBadge').value = slide.badge || '';
            document.getElementById('heroTitle').value = slide.title;
            document.getElementById('heroDescription').value = slide.description || '';
            document.getElementById('heroPrimaryButtonText').value = slide.primaryButtonText || '';
            document.getElementById('heroPrimaryButtonLink').value = slide.primaryButtonLink || '';
            document.getElementById('heroSecondaryButtonText').value = slide.secondaryButtonText || '';
            document.getElementById('heroSecondaryButtonLink').value = slide.secondaryButtonLink || '';
            document.getElementById('heroOrder').value = slide.order;
            document.getElementById('heroActive').checked = slide.active;
            document.getElementById('heroCurrentImage').value = slide.image;

            const heroImagePreview = document.getElementById('heroImagePreview');
            const imagePath = slide.image.startsWith('http')
                ? slide.image
                : `../public/${slide.image}`;
            heroImagePreview.innerHTML = `<img src="${imagePath}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">`;
        }
    } else {
        title.textContent = 'Add Hero Slide';
        form.reset();
        document.getElementById('heroId').value = '';
        document.getElementById('heroCurrentImage').value = '';
        document.getElementById('heroActive').checked = true;
        document.getElementById('heroImagePreview').innerHTML = '';
    }

    modal.style.display = 'block';
}

function closeHeroModal() {
    document.getElementById('heroModal').style.display = 'none';
}

async function saveHero() {
    showLoading('Saving hero slide and uploading image...');
    try {
        const form = document.getElementById('heroForm');
        const heroId = document.getElementById('heroId').value;

        const heroData = {
            badge: document.getElementById('heroBadge').value,
            title: document.getElementById('heroTitle').value,
            description: document.getElementById('heroDescription').value,
            primaryButtonText: document.getElementById('heroPrimaryButtonText').value,
            primaryButtonLink: document.getElementById('heroPrimaryButtonLink').value,
            secondaryButtonText: document.getElementById('heroSecondaryButtonText').value,
            secondaryButtonLink: document.getElementById('heroSecondaryButtonLink').value,
            order: parseInt(document.getElementById('heroOrder').value),
            active: document.getElementById('heroActive').checked
        };

        const heroImageInput = document.getElementById('heroImageInput');
        if (heroImageInput.files.length > 0) {
            const heroImageFile = heroImageInput.files[0];
            const heroImageBase64 = await fileToBase64(heroImageFile);
            const heroImageFileName = `hero_${Date.now()}.${heroImageFile.name.split('.').pop()}`;

            const imageUploadSuccess = await saveImageToGitHub(heroImageFileName, heroImageBase64);
            if (imageUploadSuccess) {
                heroData.image = `assets/images/${heroImageFileName}`;
            } else if (heroId) {
                const index = state.heroSlides.findIndex(s => s.id === parseInt(heroId));
                if (index !== -1) {
                    heroData.image = state.heroSlides[index].image;
                }
            }
        }

        if (heroId) {
            const index = state.heroSlides.findIndex(s => s.id === parseInt(heroId));
            if (index !== -1) {
                if (!heroData.image) {
                    const currentImage = document.getElementById('heroCurrentImage').value;
                    heroData.image = currentImage || state.heroSlides[index].image;
                }
                heroData.badge = heroData.badge || state.heroSlides[index].badge || 'Premium Custom Made';
                heroData.primaryButtonText = heroData.primaryButtonText || state.heroSlides[index].primaryButtonText || 'Get Free Consultation';
                heroData.primaryButtonLink = heroData.primaryButtonLink || state.heroSlides[index].primaryButtonLink || '#contact';
                heroData.secondaryButtonText = heroData.secondaryButtonText || state.heroSlides[index].secondaryButtonText || 'Call Us';
                heroData.secondaryButtonLink = heroData.secondaryButtonLink || state.heroSlides[index].secondaryButtonLink || 'phone';
                heroData.id = state.heroSlides[index].id;

                state.heroSlides[index] = { ...state.heroSlides[index], ...heroData };
            }
        } else {
            const newId = Math.max(...state.heroSlides.map(s => s.id), 0) + 1;
            heroData.badge = heroData.badge || 'Premium Custom Made';
            heroData.primaryButtonText = heroData.primaryButtonText || 'Get Free Consultation';
            heroData.primaryButtonLink = heroData.primaryButtonLink || '#contact';
            heroData.secondaryButtonText = heroData.secondaryButtonText || 'Call Us';
            heroData.secondaryButtonLink = heroData.secondaryButtonLink || 'phone';
            heroData.image = heroData.image || 'assets/images/hero_sofa.jpg';

            state.heroSlides.push({ id: newId, ...heroData });
        }

        await saveDataToFile('hero-slides.json', state.heroSlides);
        renderHeroTable();
        closeHeroModal();
        showSuccess('Hero slide saved and updated on GitHub successfully!');
    } catch (error) {
        console.error('Error saving hero slide:', error);
        showError('Failed to save hero slide: ' + error.message);
    } finally {
        hideLoading();
    }
}

function editHeroSlide(slideId) {
    showHeroModal(slideId);
}

async function deleteHeroSlide(slideId) {
    if (!confirm('Are you sure you want to delete this hero slide?')) return;
    showLoading('Deleting hero slide...');
    try {
        state.heroSlides = state.heroSlides.filter(s => s.id !== slideId);
        await saveDataToFile('hero-slides.json', state.heroSlides);
        renderHeroTable();
        showSuccess('Hero slide deleted and updated on GitHub!');
    } catch (error) {
        console.error('Error deleting hero slide:', error);
        showError('Failed to delete hero slide: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Utility Functions
function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠️'
    };

    toast.innerHTML = `
            <div class="toast-icon">${icons[type] || 'ℹ'}</div>
            <div class="toast-content">${message}</div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    if (duration > 0) {
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, duration);
    }
}

function showSuccess(message) {
    showToast(message, 'success', 3500);
}

function showError(message) {
    showToast(message, 'error', 4500);
}

function showInfo(message) {
    showToast(message, 'info', 4000);
}

function showWarning(message) {
    showToast(message, 'warning', 4000);
}

function showLoading(message = 'Processing request...') {
    const overlay = document.getElementById('loadingOverlay');
    const textEl = document.getElementById('loadingOverlayText');
    if (textEl) textEl.textContent = message;
    if (overlay) overlay.classList.remove('hidden');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('hidden');
}

async function refreshData() {
    showLoading('Refreshing dashboard data...');
    try {
        await loadDashboardData();
        renderDashboard();
        showSuccess('Data refreshed successfully!');
    } catch (error) {
        console.error('Error refreshing data:', error);
        showError('Failed to refresh data: ' + error.message);
    } finally {
        hideLoading();
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('rememberAdmin');
    const isGitHubPages = window.location.pathname.includes('/Home-Sofa-fork');
    const prefix = isGitHubPages ? '/Home-Sofa-fork' : '';
    window.location.href = prefix + '/public/index.html';
}

// Image upload handling
document.getElementById('mainImageInput')?.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('mainImagePreview');
            preview.innerHTML = `<img src="${e.target.result}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">`;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('galleryImagesInput')?.addEventListener('change', function (e) {
    const files = Array.from(e.target.files);
    const preview = document.getElementById('galleryImagesPreview');
    preview.innerHTML = '';

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const div = document.createElement('div');
            div.className = 'image-preview-item';
            div.innerHTML = `
                    <img src="${e.target.result}">
                    <button type="button" class="image-preview-remove" onclick="this.parentElement.remove()">×</button>
                `;
            preview.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
});

document.getElementById('serviceImageInput')?.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('serviceImagePreview');
            preview.innerHTML = `<img src="${e.target.result}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">`;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('heroImageInput')?.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('heroImagePreview');
            preview.innerHTML = `<img src="${e.target.result}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">`;
        };
        reader.readAsDataURL(file);
    }
});
