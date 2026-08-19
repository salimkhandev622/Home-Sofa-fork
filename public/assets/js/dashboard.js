// Admin Dashboard JavaScript
let state = {
    products: [],
    services: [],
    reviews: [],
    heroSlides: [],
    businessInfo: {},
    contactRequests: []
};

// Initialize Dashboard
function initializeDashboard() {
    try {
        // Load all data
        loadDashboardData().then(() => {
            // Render dashboard
            renderDashboard();
        });
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showError('Failed to load dashboard data');
    }
}

// Initialize Admin Products
function initializeAdminProducts() {
    try {
        loadDashboardData().then(() => {
            renderProductsTable();
        });
    } catch (error) {
        console.error('Error initializing admin products:', error);
    }
}

async function loadDashboardData() {
    // In production, fetch from your API/Contentful
    // For now, using placeholder data
    
    state.products = await fetchProducts();
    state.services = await fetchServices();
    state.reviews = await fetchReviews();
    state.heroSlides = await fetchHeroSlides();
    state.businessInfo = await fetchBusinessInfo();
    state.contactRequests = await fetchContactRequests();
}

// Placeholder data fetching functions
async function fetchProducts() {
    return [
        {
            id: 1,
            name: 'Nebraska U-Shape',
            price: 4200,
            shortDescription: 'Custom-made U-shaped sofa',
            fullDescription: 'Elegant U-shaped sofa perfect for large living rooms.',
            category: 'sectional',
            mainImage: 'assets/images/product1.jpg',
            galleryImages: [],
            featured: true,
            bestSeller: true,
            available: true,
            displayOrder: 1
        },
        {
            id: 2,
            name: 'L-Shaped Modern',
            price: 3500,
            shortDescription: 'Contemporary L-shaped sofa',
            fullDescription: 'Modern L-shaped sofa with clean lines.',
            category: 'sectional',
            mainImage: 'assets/images/product2.jpg',
            galleryImages: [],
            featured: true,
            bestSeller: false,
            available: true,
            displayOrder: 2
        }
    ];
}

async function fetchServices() {
    return [
        {
            id: 1,
            title: 'Premium Sofa Beds',
            description: 'Professional sofa bed solutions',
            image: 'assets/images/service1.jpg',
            features: ['Custom sizes', 'Premium materials']
        },
        {
            id: 2,
            title: 'Upholstery Services',
            description: 'Expert upholstery services',
            image: 'assets/images/service2.jpg',
            features: ['Fabric replacement', 'Foam replacement']
        }
    ];
}

async function fetchReviews() {
    return [
        {
            id: 1,
            name: 'Sarah Johnson',
            rating: 5,
            reviewText: 'Amazing quality and service!',
            status: 'approved'
        },
        {
            id: 2,
            name: 'Mohammed Ali',
            rating: 5,
            reviewText: 'Best sofa shop in Dubai.',
            status: 'pending'
        }
    ];
}

async function fetchHeroSlides() {
    return [
        {
            id: 1,
            image: 'assets/images/hero1.jpg',
            title: 'Custom Sofa Beds',
            order: 1,
            active: true
        }
    ];
}

async function fetchBusinessInfo() {
    return {
        shopName: 'Home Sofa',
        phone: '+971 50 000 0000',
        whatsapp: '+971 50 000 0000',
        email: 'info@homesofa.ae',
        address: 'Dubai, UAE',
        openingHours: '9:00 AM - 10:00 PM'
    };
}

async function fetchContactRequests() {
    return [
        {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+971 50 123 4567',
            service: 'sofa-bed',
            message: 'Interested in custom sofa bed',
            date: '2024-01-15',
            status: 'pending'
        }
    ];
}

function renderDashboard() {
    // Update stats
    const totalProducts = document.getElementById('totalProducts');
    const totalReviews = document.getElementById('totalReviews');
    const pendingInquiries = document.getElementById('pendingInquiries');
    const pendingReviews = document.getElementById('pendingReviews');
    
    if (totalProducts) totalProducts.textContent = state.products.length;
    if (totalReviews) totalReviews.textContent = state.reviews.length;
    if (pendingInquiries) pendingInquiries.textContent = state.contactRequests.filter(r => r.status === 'pending').length;
    if (pendingReviews) pendingReviews.textContent = state.reviews.filter(r => r.status === 'pending').length;
    
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
    if (tbody) {
        tbody.innerHTML = activities.map(activity => `
            <tr>
                <td>${activity.activity}</td>
                <td><span class="badge badge-info">${activity.type}</span></td>
                <td>${activity.date}</td>
                <td><span class="badge badge-${activity.status === 'completed' ? 'success' : 'warning'}">${activity.status}</span></td>
            </tr>
        `).join('');
    }
}

function renderProductsTable() {
    const tbody = document.getElementById('productsTable');
    if (tbody) {
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
}

function renderServicesTable() {
    const tbody = document.getElementById('servicesTable');
    if (tbody) {
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
}

function renderReviewsTable() {
    const tbody = document.getElementById('reviewsTable');
    if (tbody) {
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
}

function renderHeroTable() {
    const tbody = document.getElementById('heroTable');
    if (tbody) {
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
}

function renderContactTable() {
    const tbody = document.getElementById('contactTable');
    if (tbody) {
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
}

function populateBusinessInfo() {
    const shopName = document.getElementById('shopName');
    const phone = document.getElementById('phone');
    const whatsapp = document.getElementById('whatsapp');
    const email = document.getElementById('email');
    const address = document.getElementById('address');
    const openingHours = document.getElementById('openingHours');
    
    if (shopName) shopName.value = state.businessInfo.shopName || '';
    if (phone) phone.value = state.businessInfo.phone || '';
    if (whatsapp) whatsapp.value = state.businessInfo.whatsapp || '';
    if (email) email.value = state.businessInfo.email || '';
    if (address) address.value = state.businessInfo.address || '';
    if (openingHours) openingHours.value = state.businessInfo.openingHours || '';
}

// Product Management
function showProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    
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
        const productForm = document.getElementById('productForm');
        if (productForm) productForm.reset();
        document.getElementById('productId').value = '';
    }
    
    if (modal) modal.classList.add('active');
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.remove('active');
}

function saveProduct() {
    const productForm = document.getElementById('productForm');
    if (!productForm) return;
    
    const formData = new FormData(productForm);
    
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
    
    if (productId) {
        // Update existing product
        const index = state.products.findIndex(p => p.id === parseInt(productId));
        if (index !== -1) {
            state.products[index] = { ...state.products[index], ...productData };
        }
    } else {
        // Add new product
        productData.id = Date.now();
        productData.mainImage = 'assets/images/product-placeholder.jpg';
        productData.galleryImages = [];
        state.products.push(productData);
    }
    
    renderProductsTable();
    renderDashboard();
    closeProductModal();
    
    // In production, save to Contentful
    console.log('Product saved:', productData);
}

function editProduct(productId) {
    showProductModal(productId);
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        state.products = state.products.filter(p => p.id !== productId);
        renderProductsTable();
        renderDashboard();
        
        // In production, delete from Contentful
        console.log('Product deleted:', productId);
    }
}

// Review Management
function approveReview(reviewId) {
    const review = state.reviews.find(r => r.id === reviewId);
    if (review) {
        review.status = 'approved';
        renderReviewsTable();
        renderDashboard();
        
        // In production, update in Contentful
        console.log('Review approved:', reviewId);
    }
}

function rejectReview(reviewId) {
    const review = state.reviews.find(r => r.id === reviewId);
    if (review) {
        review.status = 'rejected';
        renderReviewsTable();
        renderDashboard();
        
        // In production, update in Contentful
        console.log('Review rejected:', reviewId);
    }
}

function deleteReview(reviewId) {
    if (confirm('Are you sure you want to delete this review?')) {
        state.reviews = state.reviews.filter(r => r.id !== reviewId);
        renderReviewsTable();
        renderDashboard();
        
        // In production, delete from Contentful
        console.log('Review deleted:', reviewId);
    }
}

// Business Info Management
function saveBusinessInfo() {
    const shopName = document.getElementById('shopName');
    const phone = document.getElementById('phone');
    const whatsapp = document.getElementById('whatsapp');
    const email = document.getElementById('email');
    const address = document.getElementById('address');
    const openingHours = document.getElementById('openingHours');
    
    state.businessInfo = {
        shopName: shopName?.value || '',
        phone: phone?.value || '',
        whatsapp: whatsapp?.value || '',
        email: email?.value || '',
        address: address?.value || '',
        openingHours: openingHours?.value || ''
    };
    
    alert('Business information saved successfully!');
    
    // In production, save to Contentful
    console.log('Business info saved:', state.businessInfo);
}

// Contact Request Management
function viewContactRequest(requestId) {
    const request = state.contactRequests.find(r => r.id === requestId);
    if (request) {
        alert(`Name: ${request.name}\nEmail: ${request.email}\nPhone: ${request.phone}\nService: ${request.service}\nMessage: ${request.message}`);
    }
}

function deleteContactRequest(requestId) {
    if (confirm('Are you sure you want to delete this contact request?')) {
        state.contactRequests = state.contactRequests.filter(r => r.id !== requestId);
        renderContactTable();
        renderDashboard();
        
        // In production, delete from Contentful
        console.log('Contact request deleted:', requestId);
    }
}

// Service Management (placeholder functions)
function showServiceModal() {
    alert('Service modal would open here');
}

function editService(serviceId) {
    alert('Edit service: ' + serviceId);
}

function deleteService(serviceId) {
    if (confirm('Are you sure you want to delete this service?')) {
        state.services = state.services.filter(s => s.id !== serviceId);
        renderServicesTable();
        console.log('Service deleted:', serviceId);
    }
}

// Hero Slide Management (placeholder functions)
function showHeroModal() {
    alert('Hero slide modal would open here');
}

function editHeroSlide(slideId) {
    alert('Edit hero slide: ' + slideId);
}

function deleteHeroSlide(slideId) {
    if (confirm('Are you sure you want to delete this hero slide?')) {
        state.heroSlides = state.heroSlides.filter(s => s.id !== slideId);
        renderHeroTable();
        console.log('Hero slide deleted:', slideId);
    }
}

// Utility Functions
function refreshData() {
    loadDashboardData().then(() => {
        renderDashboard();
        alert('Data refreshed successfully!');
    });
}

function showError(message) {
    alert('Error: ' + message);
}

// Image upload handling (placeholder)
const mainImageInput = document.getElementById('mainImageInput');
if (mainImageInput) {
    mainImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('mainImagePreview');
                if (preview) {
                    preview.innerHTML = `<img src="${e.target.result}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">`;
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

const galleryImagesInput = document.getElementById('galleryImagesInput');
if (galleryImagesInput) {
    galleryImagesInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        const preview = document.getElementById('galleryImagesPreview');
        if (preview) {
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
        }
    });
}