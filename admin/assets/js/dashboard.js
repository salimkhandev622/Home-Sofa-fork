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
            return await response.json();
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            return null;
        }
    }

    async function saveDataToFile(filename, data) {
        try {
            // Save to localStorage only (manual deployment via deploy button)
            localStorage.setItem(filename, JSON.stringify(data));
            console.log(`Data saved to localStorage ${filename}:`, data);
            
            // Also save to admin data folder for local syncing
            try {
                const adminResponse = await fetch(`data/${filename}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                console.log(`Data saved to admin/data/${filename}`);
            } catch (error) {
                console.log(`Could not save to admin/data/${filename} (may not be supported in this environment)`);
            }
            
            return true;
        } catch (error) {
            console.error(`Error saving ${filename}:`, error);
            return false;
        }
    }

    // GitHub API Functions
    function getGitHubConfig() {
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
                // Remove data URL prefix to get just the base64 content
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Save image to GitHub
    async function saveImageToGitHub(filename, base64Content) {
        const githubConfig = getGitHubConfig();
        if (!githubConfig.githubToken) {
            console.warn('GitHub not configured, skipping image upload');
            return;
        }

        try {
            const filePaths = [
                `public/assets/images/${filename}`,
                `admin/assets/images/${filename}`
            ];
            
            for (const filePath of filePaths) {
                // Get current file SHA if it exists
                let sha = null;
                try {
                    const getFileResponse = await fetch(
                        `https://api.github.com/repos/${githubConfig.githubOwner}/${githubConfig.githubRepo}/contents/${filePath}?ref=${githubConfig.githubBranch}`,
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
                    console.log(`Image file ${filePath} does not exist yet, will create new`);
                }
                
                // Create or update file
                const putData = {
                    message: `Upload image ${filename} via admin dashboard`,
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
                    console.warn(`Failed to upload image to ${filePath}: ${putResponse.statusText}`);
                } else {
                    console.log(`Image ${filename} uploaded successfully to ${filePath}`);
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error uploading image to GitHub:', error);
            throw error;
        }
    }

    async function saveToGitHub(filename, data, config) {
        try {
            const content = utf8ToBase64(JSON.stringify(data, null, 2));
            
            // Save to both public and admin data folders
            const filePaths = [
                `public/data/${filename}`,
                `admin/data/${filename}`
            ];
            
            for (const filePath of filePaths) {
                // Get current file SHA if it exists
                let sha = null;
                try {
                    const getFileResponse = await fetch(
                        `https://api.github.com/repos/${config.githubOwner}/${config.githubRepo}/contents/${filePath}?ref=${config.githubBranch}`,
                        {
                            headers: {
                                'Authorization': `token ${config.githubToken}`,
                                'Accept': 'application/vnd.github.v3+json'
                            }
                        }
                    );
                    
                    if (getFileResponse.ok) {
                        const fileData = await getFileResponse.json();
                        sha = fileData.sha;
                    }
                } catch (error) {
                    console.log(`File ${filePath} does not exist yet, will create new`);
                }
                
                // Create or update file
                const putData = {
                    message: `Update ${filename} via admin dashboard`,
                    content: content,
                    branch: config.githubBranch
                };
                
                if (sha) {
                    putData.sha = sha;
                }
                
                const putResponse = await fetch(
                    `https://api.github.com/repos/${config.githubOwner}/${config.githubRepo}/contents/${filePath}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Authorization': `token ${config.githubToken}`,
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
                
                console.log(`File ${filePath} saved to GitHub`);
            }
            
            return true;
        } catch (error) {
            console.error('Error saving to GitHub:', error);
            throw error;
        }
    }



    async function manualDeploy() {
        const deployBtn = document.getElementById('deployBtn');
        const originalText = deployBtn.innerHTML;
        
        try {
            deployBtn.innerHTML = '🔄 Deploying...';
            deployBtn.disabled = true;
            
            let githubConfig = getGitHubConfig();
            
            // Prompt for token if not stored (more secure approach)
            if (!githubConfig.githubToken) {
                const token = prompt('Enter your GitHub Personal Access Token for deployment:');
                if (!token) {
                    alert('Deployment cancelled. Token is required for deployment.');
                    deployBtn.innerHTML = originalText;
                    deployBtn.disabled = false;
                    return;
                }
                githubConfig.githubToken = token;
                localStorage.setItem('githubToken', token);
            }
            
            if (!githubConfig.githubToken) {
                alert('⚠️ GitHub token not configured. Please configure GitHub token in settings.');
                deployBtn.innerHTML = originalText;
                deployBtn.disabled = false;
                return;
            }
            
            // Load all current data from localStorage
            const products = JSON.parse(localStorage.getItem('products.json') || '[]');
            const services = JSON.parse(localStorage.getItem('services.json') || '[]');
            const reviews = JSON.parse(localStorage.getItem('reviews.json') || '[]');
            const heroSlides = JSON.parse(localStorage.getItem('hero-slides.json') || '[]');
            const businessInfo = JSON.parse(localStorage.getItem('business-info.json') || '{}');
            
            // Debug: Log what data is being deployed
            console.log('=== DEPLOYMENT DATA DEBUG ===');
            console.log('Products to deploy:', products.length, 'items');
            console.log('Services to deploy:', services.length, 'items');
            console.log('Reviews to deploy:', reviews.length, 'items');
            console.log('Hero slides to deploy:', heroSlides.length, 'items');
            console.log('Business info keys:', Object.keys(businessInfo));
            console.log('GitHub config:', githubConfig.githubOwner, githubConfig.githubRepo);
            console.log('Token present:', !!githubConfig.githubToken);
            console.log('============================');
            
            // Deploy all data files to GitHub
            const deployResults = [];
            
            // Deploy products
            try {
                await saveToGitHub('products.json', products, githubConfig);
                deployResults.push('✅ Products deployed');
            } catch (error) {
                deployResults.push(`❌ Products failed: ${error.message}`);
            }
            
            // Deploy services
            try {
                await saveToGitHub('services.json', services, githubConfig);
                deployResults.push('✅ Services deployed');
            } catch (error) {
                deployResults.push(`❌ Services failed: ${error.message}`);
            }
            
            // Deploy reviews
            try {
                await saveToGitHub('reviews.json', reviews, githubConfig);
                deployResults.push('✅ Reviews deployed');
            } catch (error) {
                deployResults.push(`❌ Reviews failed: ${error.message}`);
            }
            
            // Deploy hero slides
            try {
                await saveToGitHub('hero-slides.json', heroSlides, githubConfig);
                deployResults.push('✅ Hero slides deployed');
            } catch (error) {
                deployResults.push(`❌ Hero slides failed: ${error.message}`);
            }
            
            // Deploy business info
            try {
                await saveToGitHub('business-info.json', businessInfo, githubConfig);
                deployResults.push('✅ Business info deployed');
            } catch (error) {
                deployResults.push(`❌ Business info failed: ${error.message}`);
            }
            
            // Show deployment results
            const successCount = deployResults.filter(r => r.startsWith('✅')).length;
            const totalCount = deployResults.length;
            
            alert(`Deployment Complete!\n\n${deployResults.join('\n')}\n\n${successCount}/${totalCount} files deployed successfully.\n\nNote: GitHub Pages will automatically rebuild and your changes will be live within 1-2 minutes.`);
            
            // Refresh deployment status
            checkDeploymentStatus();
            
        } catch (error) {
            console.error('Deployment error:', error);
            alert(`❌ Deployment failed: ${error.message}`);
        } finally {
            deployBtn.innerHTML = originalText;
            deployBtn.disabled = false;
        }
    }

    async function checkDeploymentStatus() {
        const config = getGitHubConfig();
        const statusDiv = document.getElementById('deploymentStatus');
        
        if (!config.githubToken) {
            statusDiv.innerHTML = '<p class="status-warning">⚠️ GitHub token not configured. Please configure GitHub token in settings.</p>';
            return;
        }
        
        try {
            statusDiv.innerHTML = '<p class="status-loading">🔄 Checking deployment status...</p>';
            
            // Check latest workflow run
            const response = await fetch(
                `https://api.github.com/repos/${config.githubOwner}/${config.githubRepo}/actions/runs?branch=${config.githubBranch}&per_page=1`,
                {
                    headers: {
                        'Authorization': `token ${config.githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Repository not found or GitHub Actions not enabled. Please check your repository configuration.');
                } else if (response.status === 403) {
                    throw new Error('Access denied. Please check your GitHub token permissions.');
                } else {
                    throw new Error(`GitHub API error: ${response.status}`);
                }
            }
            
            const data = await response.json();
            const latestRun = data.workflow_runs && data.workflow_runs[0];
            
            if (latestRun) {
                const statusIcon = latestRun.status === 'completed' ? '✅' : '🔄';
                const conclusionIcon = latestRun.conclusion === 'success' ? '✅' : '❌';
                
                statusDiv.innerHTML = `
                    <div class="status-item">
                        <span class="status-icon">${statusIcon}</span>
                        <span class="status-text">Status: ${latestRun.status}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-icon">${conclusionIcon}</span>
                        <span class="status-text">Conclusion: ${latestRun.conclusion || 'running'}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-icon">📅</span>
                        <span class="status-text">Last run: ${new Date(latestRun.created_at).toLocaleString()}</span>
                    </div>
                    <a href="${latestRun.html_url}" target="_blank" class="btn btn-secondary btn-sm">View Workflow Run</a>
                `;
            } else {
                statusDiv.innerHTML = '<p class="status-info">ℹ️ No workflow runs found. GitHub Actions may not be configured for this repository.</p>';
            }
        } catch (error) {
            console.error('Error checking deployment status:', error);
            statusDiv.innerHTML = `<p class="status-error">❌ Error checking deployment status: ${error.message}</p>`;
        }
    }

    // DOM Elements
    const elements = {
        sidebar: document.getElementById('sidebar'),
        menuToggle: document.getElementById('menuToggle'),
        currentSection: document.getElementById('currentSection'),
        navLinks: document.querySelectorAll('.sidebar-nav a')
    };

    // Initialize Dashboard
    document.addEventListener('DOMContentLoaded', () => {
        checkAuthentication();
        initializeDashboard();
        initializeGitHubConfigForm();
    });

    function initializeGitHubConfigForm() {
        const form = document.getElementById('apiConfigForm');
        if (form) {
            // Load saved config
            document.getElementById('githubToken').value = localStorage.getItem('githubToken') || '';
            
            // Handle form submission
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                localStorage.setItem('githubToken', document.getElementById('githubToken').value);
                
                alert('GitHub API configuration saved successfully!');
            });
        }
    }

    function checkAuthentication() {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }
        
        // Validate token (in production, verify with server)
        try {
            const payload = JSON.parse(atob(token));
            const tokenAge = Date.now() - payload.timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (tokenAge >= maxAge) {
                localStorage.removeItem('adminToken');
                window.location.href = 'index.html';
            }
        } catch (e) {
            localStorage.removeItem('adminToken');
            window.location.href = 'index.html';
        }
    }

    async function initializeDashboard() {
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
        }
    }

    async function loadDashboardData() {
        // Load data from localStorage first (dashboard is source of truth)
        // Fall back to JSON files if localStorage is empty
        state.products = await loadFromStorageOrFile('products.json', []);
        state.services = await loadFromStorageOrFile('services.json', []);
        state.reviews = await loadFromStorageOrFile('reviews.json', []);
        state.heroSlides = await loadFromStorageOrFile('hero-slides.json', []);
        state.businessInfo = await loadFromStorageOrFile('business-info.json', {});
        state.contactRequests = await loadDataFromFile('contact-requests.json') || [];
    }

    async function loadFromStorageOrFile(filename, defaultValue) {
        const localData = localStorage.getItem(filename);
        if (localData) {
            return JSON.parse(localData);
        }
        // Fall back to file loading
        const fileData = await loadDataFromFile(filename) || defaultValue;
        // Sync to localStorage
        if (fileData) {
            localStorage.setItem(filename, JSON.stringify(fileData));
        }
        return fileData;
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
        const activities = [
            { activity: 'New product added', type: 'Product', date: '2024-01-15', status: 'completed' },
            { activity: 'Review submitted', type: 'Review', date: '2024-01-14', status: 'pending' },
            { activity: 'Contact request received', type: 'Contact', date: '2024-01-13', status: 'pending' }
        ];
        
        const tbody = document.getElementById('recentActivity');
        tbody.innerHTML = activities.map(activity => `
            <tr>
                <td>${activity.activity}</td>
                <td><span class="badge badge-info">${activity.type}</span></td>
                <td>${activity.date}</td>
                <td><span class="badge badge-${activity.status === 'completed' ? 'success' : 'warning'}">${activity.status}</span></td>
            </tr>
        `).join('');
    }

    function renderProductsTable() {
        const tbody = document.getElementById('productsTable');
        tbody.innerHTML = state.products.map(product => `
            <tr>
                <td><img src="${product.mainImage}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
                <td>${product.name}</td>
                <td>AED ${product.price.toLocaleString()}</td>
                <td>${product.category}</td>
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
        `).join('');
    }

    function renderServicesTable() {
        const tbody = document.getElementById('servicesTable');
        tbody.innerHTML = state.services.map(service => `
            <tr>
                <td><img src="${service.image}" alt="${service.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
                <td>${service.title}</td>
                <td>${service.description.substring(0, 50)}...</td>
                <td>
                    <div class="table-actions">
                        <button class="table-btn edit" onclick="editService(${service.id})">Edit</button>
                        <button class="table-btn delete" onclick="deleteService(${service.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
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
        tbody.innerHTML = state.heroSlides.map(slide => `
            <tr>
                <td><img src="${slide.image}" alt="${slide.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
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
        `).join('');
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
        elements.sidebar.classList.remove('active');
    }

    // Mobile Menu
    function initializeMobileMenu() {
        elements.menuToggle.addEventListener('click', () => {
            elements.sidebar.classList.toggle('active');
        });
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
            }
        } else {
            title.textContent = 'Add Product';
            form.reset();
            document.getElementById('productId').value = '';
            document.getElementById('productAvailable').checked = true;
        }
        
        modal.style.display = 'block';
    }

    function closeProductModal() {
        document.getElementById('productModal').style.display = 'none';
    }

    async function saveProduct() {
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
            
            // Save image to assets/images directory via GitHub
            await saveImageToGitHub(mainImageFileName, mainImageBase64);
            productData.mainImage = `assets/images/${mainImageFileName}`;
        } else if (!productId) {
            // New product without image - use default
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
                
                await saveImageToGitHub(galleryFileName, galleryBase64);
                productData.galleryImages.push(`assets/images/${galleryFileName}`);
            }
        } else if (!productId) {
            productData.galleryImages = [];
        }
        
        if (productId) {
            // Update existing product
            const index = state.products.findIndex(p => p.id === parseInt(productId));
            if (index !== -1) {
                // Keep existing images if no new ones uploaded
                if (!productData.mainImage) {
                    productData.mainImage = state.products[index].mainImage;
                }
                if (!productData.galleryImages) {
                    productData.galleryImages = state.products[index].galleryImages || [];
                }
                state.products[index] = { ...state.products[index], ...productData };
            }
        } else {
            // Add new product
            productData.id = Date.now();
            state.products.push(productData);
        }
        
        // Check if GitHub is configured
        const githubConfig = getGitHubConfig();
        const hasGitHubConfig = githubConfig.githubToken;
        
        // Save to file system
        saveDataToFile('products.json', state.products).then(success => {
            renderProductsTable();
            renderDashboard();
            closeProductModal();
            
            if (hasGitHubConfig) {
                alert('Product saved locally! Click "Deploy" to push these changes to GitHub.');
            } else {
                alert('Product saved locally. Configure a GitHub token and click Deploy to publish.');
            }
        });
    }

    function editProduct(productId) {
        showProductModal(productId);
    }

    function deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            state.products = state.products.filter(p => p.id !== productId);
            
            const githubConfig = getGitHubConfig();
            const hasGitHubConfig = githubConfig.githubToken && githubConfig.githubOwner && githubConfig.githubRepo;
            
            saveDataToFile('products.json', state.products).then(success => {
                renderProductsTable();
                renderDashboard();
                
                if (hasGitHubConfig) {
                    alert('Product deleted locally! Click "Deploy" to push these changes to GitHub.');
                } else {
                    alert('Product deleted locally. Configure a GitHub token and click Deploy to publish.');
                }
            });
        }
    }

    // Review Management
    function approveReview(reviewId) {
        const review = state.reviews.find(r => r.id === reviewId);
        if (review) {
            review.status = 'approved';
            
            const githubConfig = getGitHubConfig();
            const hasGitHubConfig = githubConfig.githubToken && githubConfig.githubOwner && githubConfig.githubRepo;
            
            saveDataToFile('reviews.json', state.reviews).then(success => {
                renderReviewsTable();
                renderDashboard();
                
                if (hasGitHubConfig) {
                    alert('Review approved locally! Click "Deploy" to push these changes to GitHub.');
                } else {
                    alert('Review approved locally. Configure a GitHub token and click Deploy to publish.');
                }
            });
        }
    }

    function rejectReview(reviewId) {
        const review = state.reviews.find(r => r.id === reviewId);
        if (review) {
            review.status = 'rejected';
            
            const githubConfig = getGitHubConfig();
            const hasGitHubConfig = githubConfig.githubToken && githubConfig.githubOwner && githubConfig.githubRepo;
            
            saveDataToFile('reviews.json', state.reviews).then(success => {
                renderReviewsTable();
                renderDashboard();
                
                if (hasGitHubConfig) {
                    alert('Review rejected locally! Click "Deploy" to push these changes to GitHub.');
                } else {
                    alert('Review rejected locally. Configure a GitHub token and click Deploy to publish.');
                }
            });
        }
    }

    function deleteReview(reviewId) {
        if (confirm('Are you sure you want to delete this review?')) {
            state.reviews = state.reviews.filter(r => r.id !== reviewId);
            
            const githubConfig = getGitHubConfig();
            const hasGitHubConfig = githubConfig.githubToken && githubConfig.githubOwner && githubConfig.githubRepo;
            
            saveDataToFile('reviews.json', state.reviews).then(success => {
                renderReviewsTable();
                renderDashboard();
                
                if (hasGitHubConfig) {
                    alert('Review deleted locally! Click "Deploy" to push these changes to GitHub.');
                } else {
                    alert('Review deleted locally. Configure a GitHub token and click Deploy to publish.');
                }
            });
        }
    }

    // Business Info Management
    function saveBusinessInfo() {
        state.businessInfo = {
            shopName: document.getElementById('shopName').value,
            phone: document.getElementById('phone').value,
            whatsapp: document.getElementById('whatsapp').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            openingHours: document.getElementById('openingHours').value,
            socialLinks: {
                facebook: document.getElementById('facebook')?.value || '#',
                instagram: document.getElementById('instagram')?.value || '#',
                twitter: document.getElementById('twitter')?.value || '#'
            },
            mapCoordinates: {
                lat: document.getElementById('mapLat')?.value || 25.12345678901234,
                lng: document.getElementById('mapLng')?.value || 55.12345678901234
            }
        };
        
        // Check if GitHub is configured
        const githubConfig = getGitHubConfig();
        const hasGitHubConfig = githubConfig.githubToken;
        
        // Save to file system
        saveDataToFile('business-info.json', state.businessInfo).then(success => {
            if (hasGitHubConfig) {
                alert('Business information saved locally! Click "Deploy" to push these changes to GitHub.');
            } else {
                alert('Business information saved locally. Configure a GitHub token and click Deploy to publish.');
            }
        });
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
            if (document.getElementById('twitter')) {
                document.getElementById('twitter').value = state.businessInfo.socialLinks.twitter || '';
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
            alert(`Name: ${request.name}\nEmail: ${request.email}\nPhone: ${request.phone}\nService: ${request.service}\nMessage: ${request.message}`);
        }
    }

    function markContactRequestAsRead(requestId) {
        const request = state.contactRequests.find(r => r.id === requestId);
        if (request) {
            request.status = 'read';
            
            const githubConfig = getGitHubConfig();
            const hasGitHubConfig = githubConfig.githubToken && githubConfig.githubOwner && githubConfig.githubRepo;
            
            saveDataToFile('contact-requests.json', state.contactRequests).then(success => {
                renderContactTable();
                renderDashboard();
                
                if (hasGitHubConfig) {
                    alert('Contact request marked as read locally! Click "Deploy" to push these changes to GitHub.');
                } else {
                    alert('Contact request marked as read locally. Configure a GitHub token and click Deploy to publish.');
                }
            });
        }
    }

    function deleteContactRequest(requestId) {
        if (confirm('Are you sure you want to delete this contact request?')) {
            state.contactRequests = state.contactRequests.filter(r => r.id !== requestId);
            
            const githubConfig = getGitHubConfig();
            const hasGitHubConfig = githubConfig.githubToken && githubConfig.githubOwner && githubConfig.githubRepo;
            
            saveDataToFile('contact-requests.json', state.contactRequests).then(success => {
                renderContactTable();
                renderDashboard();
                
                if (hasGitHubConfig) {
                    alert('Contact request deleted locally! Click "Deploy" to push these changes to GitHub.');
                } else {
                    alert('Contact request deleted locally. Configure a GitHub token and click Deploy to publish.');
                }
            });
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
        const form = document.getElementById('serviceForm');
        const serviceId = document.getElementById('serviceId').value;
        
        const serviceData = {
            title: document.getElementById('serviceTitle').value,
            description: document.getElementById('serviceDescription').value,
            features: document.getElementById('serviceFeatures').value.split(',').map(f => f.trim()).filter(f => f),
            buttonText: document.getElementById('serviceButtonText').value || 'Get Quote',
            buttonLink: document.getElementById('serviceButtonLink').value || 'whatsapp'
        };

        // Handle service image upload
        const serviceImageInput = document.getElementById('serviceImageInput');
        if (serviceImageInput.files.length > 0) {
            const serviceImageFile = serviceImageInput.files[0];
            const serviceImageBase64 = await fileToBase64(serviceImageFile);
            const serviceImageFileName = `service_${Date.now()}.${serviceImageFile.name.split('.').pop()}`;
            
            await saveImageToGitHub(serviceImageFileName, serviceImageBase64);
            serviceData.image = `assets/images/${serviceImageFileName}`;
        } else if (!serviceId) {
            // New service without image - use default
            serviceData.image = 'assets/images/service_sofa_beds.jpg';
        }
        
        if (serviceId) {
            // Update existing service
            const index = state.services.findIndex(s => s.id === parseInt(serviceId));
            if (index !== -1) {
                // Keep existing image if no new one uploaded
                if (!serviceData.image) {
                    serviceData.image = state.services[index].image;
                }
                state.services[index] = { ...state.services[index], ...serviceData };
            }
        } else {
            // Add new service
            const newId = Math.max(...state.services.map(s => s.id), 0) + 1;
            state.services.push({ id: newId, ...serviceData });
        }
        
        // Check if GitHub is configured
        const githubConfig = getGitHubConfig();
        const hasGitHubConfig = githubConfig.githubToken;
        
        // Save to file system
        saveDataToFile('services.json', state.services).then(success => {
            renderServicesTable();
            closeServiceModal();
            
            if (hasGitHubConfig) {
                alert('Service saved locally! Click "Deploy" to push these changes to GitHub.');
            } else {
                alert('Service saved locally. Configure a GitHub token and click Deploy to publish.');
            }
        });
    }

    function editService(serviceId) {
        showServiceModal(serviceId);
    }

    function deleteService(serviceId) {
        if (confirm('Are you sure you want to delete this service?')) {
            state.services = state.services.filter(s => s.id !== serviceId);
            
            const githubConfig = getGitHubConfig();
            const hasGitHubConfig = githubConfig.githubToken && githubConfig.githubOwner && githubConfig.githubRepo;
            
            saveDataToFile('services.json', state.services).then(success => {
                renderServicesTable();
                
                if (hasGitHubConfig) {
                    alert('Service deleted locally! Click "Deploy" to push these changes to GitHub.');
                } else {
                    alert('Service deleted locally. Configure a GitHub token and click Deploy to publish.');
                }
            });
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
            }
        } else {
            title.textContent = 'Add Hero Slide';
            form.reset();
            document.getElementById('heroId').value = '';
            document.getElementById('heroActive').checked = true;
        }
        
        modal.style.display = 'block';
    }

    function closeHeroModal() {
        document.getElementById('heroModal').style.display = 'none';
    }

    async function saveHero() {
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

        // Handle hero image upload
        const heroImageInput = document.getElementById('heroImageInput');
        if (heroImageInput.files.length > 0) {
            const heroImageFile = heroImageInput.files[0];
            const heroImageBase64 = await fileToBase64(heroImageFile);
            const heroImageFileName = `hero_${Date.now()}.${heroImageFile.name.split('.').pop()}`;
            
            await saveImageToGitHub(heroImageFileName, heroImageBase64);
            heroData.image = `assets/images/${heroImageFileName}`;
        }
        
        if (heroId) {
            // Update existing slide
            const index = state.heroSlides.findIndex(s => s.id === parseInt(heroId));
            if (index !== -1) {
                // Keep existing image if no new one uploaded
                if (!heroData.image) {
                    heroData.image = state.heroSlides[index].image;
                }
                // Use default values for empty fields
                heroData.badge = heroData.badge || state.heroSlides[index].badge || 'Premium Custom Made';
                heroData.primaryButtonText = heroData.primaryButtonText || state.heroSlides[index].primaryButtonText || 'Get Free Consultation';
                heroData.primaryButtonLink = heroData.primaryButtonLink || state.heroSlides[index].primaryButtonLink || '#contact';
                heroData.secondaryButtonText = heroData.secondaryButtonText || state.heroSlides[index].secondaryButtonText || 'Call Us';
                heroData.secondaryButtonLink = heroData.secondaryButtonLink || state.heroSlides[index].secondaryButtonLink || 'phone';
                
                state.heroSlides[index] = { ...state.heroSlides[index], ...heroData };
            }
        } else {
            // Add new slide
            const newId = Math.max(...state.heroSlides.map(s => s.id), 0) + 1;
            // Set default values for new slides
            heroData.badge = heroData.badge || 'Premium Custom Made';
            heroData.primaryButtonText = heroData.primaryButtonText || 'Get Free Consultation';
            heroData.primaryButtonLink = heroData.primaryButtonLink || '#contact';
            heroData.secondaryButtonText = heroData.secondaryButtonText || 'Call Us';
            heroData.secondaryButtonLink = heroData.secondaryButtonLink || 'phone';
            heroData.image = heroData.image || 'assets/images/hero_sofa.jpg';
            
            state.heroSlides.push({ id: newId, ...heroData });
        }
        
        // Check if GitHub is configured
        const githubConfig = getGitHubConfig();
        const hasGitHubConfig = githubConfig.githubToken;
        
        // Save to file system
        saveDataToFile('hero-slides.json', state.heroSlides).then(success => {
            renderHeroTable();
            closeHeroModal();
            
            if (hasGitHubConfig) {
                alert('Hero slide saved locally! Click "Deploy" to push these changes to GitHub.');
            } else {
                alert('Hero slide saved locally. Configure a GitHub token and click Deploy to publish.');
            }
        });
    }

    function editHeroSlide(slideId) {
        showHeroModal(slideId);
    }

    function deleteHeroSlide(slideId) {
        if (confirm('Are you sure you want to delete this hero slide?')) {
            state.heroSlides = state.heroSlides.filter(s => s.id !== slideId);
            
            const githubConfig = getGitHubConfig();
            const hasGitHubConfig = githubConfig.githubToken && githubConfig.githubOwner && githubConfig.githubRepo;
            
            saveDataToFile('hero-slides.json', state.heroSlides).then(success => {
                renderHeroTable();
                
                if (hasGitHubConfig) {
                    alert('Hero slide deleted locally! Click "Deploy" to push these changes to GitHub.');
                } else {
                    alert('Hero slide deleted locally. Configure a GitHub token and click Deploy to publish.');
                }
            });
        }
    }

    // Utility Functions
    function refreshData() {
        loadDashboardData().then(() => {
            renderDashboard();
            alert('Data refreshed successfully!');
        });
    }

    function logout() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('rememberAdmin');
        window.location.href = 'index.html';
    }

    function showError(message) {
        alert('Error: ' + message);
    }

    // Image upload handling
    document.getElementById('mainImageInput')?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('mainImagePreview');
                preview.innerHTML = `<img src="${e.target.result}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">`;
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('galleryImagesInput')?.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        const preview = document.getElementById('galleryImagesPreview');
        preview.innerHTML = '';
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
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

    document.getElementById('serviceImageInput')?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('serviceImagePreview');
                preview.innerHTML = `<img src="${e.target.result}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">`;
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('heroImageInput')?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('heroImagePreview');
                preview.innerHTML = `<img src="${e.target.result}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">`;
            };
            reader.readAsDataURL(file);
        }
    });