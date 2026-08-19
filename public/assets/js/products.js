// Products Page JavaScript
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 9;

// Initialize Products Page
function initializeProductsPage() {
    try {
        showLoading();
        
        // Fetch products
        fetchProducts().then(products => {
            allProducts = products;
            filteredProducts = [...allProducts];
            
            // Render products
            renderProducts();
            renderPagination();
            
            // Initialize filters
            initializeFilters();
            
            // Initialize URL parameters
            handleURLParameters();
            
            hideLoading();
        });
        
    } catch (error) {
        console.error('Error initializing products page:', error);
        showError('Failed to load products. Please refresh the page.');
    }
}

// Fetch Products (placeholder - replace with Contentful API call)
async function fetchProducts() {
    // Placeholder data - in production, fetch from Contentful
    return [
        {
            id: 1,
            name: 'Nebraska U-Shape',
            price: 4200,
            shortDescription: 'Custom-made U-shaped sofa with premium fabric',
            fullDescription: 'Elegant U-shaped sofa perfect for large living rooms. Features high-density foam cushions and durable upholstery. Customizable in various colors and fabrics to match your interior design.',
            category: 'sectional',
            mainImage: 'assets/images/product1.jpg',
            galleryImages: ['assets/images/product1-1.jpg', 'assets/images/product1-2.jpg', 'assets/images/product1-3.jpg'],
            featured: true,
            bestSeller: true,
            available: true,
            displayOrder: 1
        },
        {
            id: 2,
            name: 'L-Shaped Modern',
            price: 3500,
            shortDescription: 'Contemporary L-shaped sofa with sleek design',
            fullDescription: 'Modern L-shaped sofa with clean lines and comfortable seating. Perfect for contemporary homes. Features premium fabric upholstery and sturdy wooden frame.',
            category: 'sectional',
            mainImage: 'assets/images/product2.jpg',
            galleryImages: ['assets/images/product2-1.jpg', 'assets/images/product2-2.jpg'],
            featured: true,
            bestSeller: false,
            available: true,
            displayOrder: 2
        },
        {
            id: 3,
            name: 'Chesterfield Classic',
            price: 5500,
            shortDescription: 'Timeless Chesterfield design with tufted upholstery',
            fullDescription: 'Classic Chesterfield sofa with button-tufted detailing and premium leather upholstery. A timeless piece that adds elegance to any room.',
            category: 'sofa',
            mainImage: 'assets/images/product3.jpg',
            galleryImages: ['assets/images/product3-1.jpg', 'assets/images/product3-2.jpg'],
            featured: false,
            bestSeller: true,
            available: true,
            displayOrder: 3
        },
        {
            id: 4,
            name: 'Premium Sofa Bed',
            price: 4800,
            shortDescription: 'Luxurious sofa bed with easy conversion mechanism',
            fullDescription: 'Premium sofa bed that easily converts from comfortable seating to a cozy bed. Features high-quality mechanism and premium mattress for optimal comfort.',
            category: 'sofa-bed',
            mainImage: 'assets/images/product4.jpg',
            galleryImages: ['assets/images/product4-1.jpg', 'assets/images/product4-2.jpg'],
            featured: true,
            bestSeller: false,
            available: true,
            displayOrder: 4
        },
        {
            id: 5,
            name: 'Recliner Comfort',
            price: 2800,
            shortDescription: 'Plush recliner with multiple positioning options',
            fullDescription: 'Luxurious recliner with smooth reclining mechanism and multiple positioning options. Features premium leather upholstery and padded armrests for maximum comfort.',
            category: 'recliner',
            mainImage: 'assets/images/product5.jpg',
            galleryImages: ['assets/images/product5-1.jpg'],
            featured: false,
            bestSeller: false,
            available: true,
            displayOrder: 5
        },
        {
            id: 6,
            name: 'Three-Seater Classic',
            price: 3200,
            shortDescription: 'Elegant three-seater sofa with timeless design',
            fullDescription: 'Classic three-seater sofa with elegant design and comfortable seating. Features premium fabric upholstery and sturdy construction.',
            category: 'sofa',
            mainImage: 'assets/images/product6.jpg',
            galleryImages: ['assets/images/product6-1.jpg', 'assets/images/product6-2.jpg'],
            featured: false,
            bestSeller: true,
            available: true,
            displayOrder: 6
        }
    ];
}

// Render Products
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    if (productsToShow.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1;">
                <div class="no-results-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search criteria</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = productsToShow.map(product => `
        <div class="product-card" onclick="openProductModal(${product.id})">
            <div class="product-image">
                <img src="${product.mainImage}" alt="${product.name}" loading="lazy">
                ${product.featured ? '<span class="product-badge featured">Featured</span>' : ''}
                ${product.bestSeller ? '<span class="product-badge bestseller">Best Seller</span>' : ''}
                ${!product.available ? '<span class="product-badge" style="background-color: var(--danger);">Out of Stock</span>' : ''}
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">AED ${product.price.toLocaleString()}</div>
                <p class="product-description">${product.shortDescription}</p>
            </div>
        </div>
    `).join('');
}

// Render Pagination
function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = `
        <button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button onclick="goToPage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>
        `;
    }
    
    paginationHTML += `
        <button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Initialize Filters
function initializeFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const availabilityFilter = document.getElementById('availabilityFilter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', applyFilters);
    }
    
    if (availabilityFilter) {
        availabilityFilter.addEventListener('change', applyFilters);
    }
}

// Apply Filters
function applyFilters() {
    const category = document.getElementById('categoryFilter')?.value || '';
    const sort = document.getElementById('sortFilter')?.value || 'default';
    const availability = document.getElementById('availabilityFilter')?.value || 'all';
    
    // Filter by category
    filteredProducts = allProducts.filter(product => {
        if (category && product.category !== category) return false;
        if (availability === 'available' && !product.available) return false;
        return true;
    });
    
    // Sort products
    switch (sort) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            filteredProducts.sort((a, b) => a.displayOrder - b.displayOrder);
    }
    
    // Reset to first page
    currentPage = 1;
    
    // Re-render
    renderProducts();
    renderPagination();
}

// Pagination Functions
function goToPage(page) {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderProducts();
    renderPagination();
    
    // Scroll to top of products grid
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Handle URL Parameters
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('category');
    
    if (categoryId) {
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = categoryId;
            applyFilters();
        }
    }
    
    const productId = urlParams.get('id');
    if (productId) {
        const product = allProducts.find(p => p.id === parseInt(productId));
        if (product) {
            openProductModal(product.id);
        }
    }
}

// Product Modal Functions
function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    // Update modal content
    const modalMainImage = document.getElementById('modalMainImage');
    const modalProductName = document.getElementById('modalProductName');
    const modalPrice = document.getElementById('modalPrice');
    const modalDescription = document.getElementById('modalDescription');
    const modalCategory = document.getElementById('modalCategory');
    const modalAvailability = document.getElementById('modalAvailability');
    const modalWhatsapp = document.getElementById('modalWhatsapp');
    const modalBadges = document.getElementById('modalBadges');
    const modalThumbnails = document.getElementById('modalThumbnails');
    
    if (modalMainImage) modalMainImage.src = product.mainImage;
    if (modalProductName) modalProductName.textContent = product.name;
    if (modalPrice) modalPrice.textContent = `AED ${product.price.toLocaleString()}`;
    if (modalDescription) modalDescription.textContent = product.fullDescription;
    if (modalCategory) modalCategory.textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);
    if (modalAvailability) {
        modalAvailability.textContent = product.available ? 'In Stock' : 'Out of Stock';
        modalAvailability.style.color = product.available ? 'var(--success)' : 'var(--danger)';
    }
    
    // Update WhatsApp link
    if (modalWhatsapp) {
        modalWhatsapp.href = `https://wa.me/971500000000?text=I'm interested in ${encodeURIComponent(product.name)} - AED ${product.price.toLocaleString()}`;
    }
    
    // Render badges
    if (modalBadges) {
        let badgesHTML = '';
        if (product.featured) badgesHTML += '<span class="badge featured">Featured</span>';
        if (product.bestSeller) badgesHTML += '<span class="badge bestseller">Best Seller</span>';
        if (!product.available) badgesHTML += '<span class="badge" style="background-color: var(--danger); color: white;">Out of Stock</span>';
        modalBadges.innerHTML = badgesHTML;
    }
    
    // Render thumbnails
    if (modalThumbnails) {
        modalThumbnails.innerHTML = product.galleryImages.map((img, index) => `
            <img src="${img}" alt="Thumbnail ${index + 1}" onclick="changeMainImage('${img}')" class="${index === 0 ? 'active' : ''}">
        `).join('');
    }
    
    // Show modal
    const productModal = document.getElementById('productModal');
    if (productModal) {
        productModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Add keyboard event listener
        document.addEventListener('keydown', handleModalKeydown);
    }
}

function closeProductModal() {
    const productModal = document.getElementById('productModal');
    if (productModal) {
        productModal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Remove keyboard event listener
        document.removeEventListener('keydown', handleModalKeydown);
    }
}

function changeMainImage(src) {
    const modalMainImage = document.getElementById('modalMainImage');
    if (modalMainImage) {
        modalMainImage.src = src;
    }
    
    // Update active thumbnail
    const thumbnails = document.querySelectorAll('.thumbnail-grid img');
    thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
        if (thumb.src === src) {
            thumb.classList.add('active');
        }
    });
}

function handleModalKeydown(e) {
    if (e.key === 'Escape') {
        closeProductModal();
    }
}

// Close modal when clicking outside
const productModal = document.getElementById('productModal');
if (productModal) {
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeProductModal();
        }
    });
}

// Utility Functions
function showLoading() {
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.innerHTML = '<div class="products-loading"></div>';
    }
}

function hideLoading() {
    // Loading state is removed when content is rendered
}

function showError(message) {
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.innerHTML = `
            <div class="error" style="grid-column: 1 / -1;">
                ${message}
            </div>
        `;
    }
}