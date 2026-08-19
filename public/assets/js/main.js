// Main JavaScript for Public Website
const CONTENTFUL_CONFIG = {
    spaceId: 'YOUR_SPACE_ID',
    accessToken: 'YOUR_ACCESS_TOKEN'
};

// App State
const state = {
    heroSlides: [],
    products: [],
    services: [],
    reviews: [],
    businessInfo: {},
    currentSlide: 0,
    autoSlideInterval: null
};

// Initialize App
function initializeApp() {
    try {
        // Show loading state
        showLoading();
        
        // Fetch all content from CMS
        fetchAllContent().then(() => {
            // Render content
            renderHeroSlider();
            renderGallery();
            renderReviews();
            renderServices();
            renderBestsellers();
            renderBusinessInfo();
            
            // Initialize interactions
            initializeHeroSlider();
            initializeForms();
            initializeMobileMenu();
            
            // Hide loading state
            hideLoading();
        });
        
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to load content. Please refresh the page.');
    }
}

// Content Fetching Functions
async function fetchAllContent() {
    // In production, these would be actual Contentful API calls
    // For now, using placeholder data
    
    state.heroSlides = await fetchHeroSlides();
    state.products = await fetchProducts();
    state.services = await fetchServices();
    state.reviews = await fetchReviews();
    state.businessInfo = await fetchBusinessInfo();
}

async function fetchHeroSlides() {
    // Placeholder data - replace with Contentful API call
    return [
        {
            id: 1,
            image: 'assets/images/hero1.jpg',
            badge: 'Premium Quality',
            title: 'Custom Sofa Beds & Upholstery Solutions',
            description: 'Transform your living space with our custom-made sofa beds and premium upholstery services in Dubai.',
            primaryButtonText: 'WhatsApp Us',
            primaryButtonLink: 'https://wa.me/971500000000',
            secondaryButtonText: 'Call Now',
            secondaryButtonLink: 'tel:+971500000000',
            order: 1,
            active: true
        },
        {
            id: 2,
            image: 'assets/images/hero2.jpg',
            badge: 'Best Prices',
            title: 'Luxury Sofas at Affordable Prices',
            description: 'Discover our collection of premium sofas with competitive pricing and exceptional quality.',
            primaryButtonText: 'View Collection',
            primaryButtonLink: '/products',
            secondaryButtonText: 'Get Quote',
            secondaryButtonLink: '/#contact',
            order: 2,
            active: true
        }
    ];
}

async function fetchProducts() {
    // Placeholder data - replace with Contentful API call
    return [
        {
            id: 1,
            name: 'Nebraska U-Shape',
            price: 4200,
            shortDescription: 'Custom-made U-shaped sofa with premium fabric',
            fullDescription: 'Elegant U-shaped sofa perfect for large living rooms. Features high-density foam cushions and durable upholstery.',
            category: 'Sofa',
            mainImage: 'assets/images/product1.jpg',
            galleryImages: ['assets/images/product1-1.jpg', 'assets/images/product1-2.jpg'],
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
            fullDescription: 'Modern L-shaped sofa with clean lines and comfortable seating. Perfect for contemporary homes.',
            category: 'Sofa',
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
            fullDescription: 'Classic Chesterfield sofa with button-tufted detailing and premium leather upholstery.',
            category: 'Sofa',
            mainImage: 'assets/images/product3.jpg',
            galleryImages: ['assets/images/product3-1.jpg', 'assets/images/product3-2.jpg'],
            featured: false,
            bestSeller: true,
            available: true,
            displayOrder: 3
        }
    ];
}

async function fetchServices() {
    // Placeholder data - replace with Contentful API call
    return [
        {
            id: 1,
            title: 'Premium Sofa Beds',
            description: 'Professional sofa bed solutions with custom sizes and premium materials',
            image: 'assets/images/service1.jpg',
            features: ['Custom sizes', 'Premium materials', 'Multiple designs'],
            buttonText: 'Learn More',
            buttonLink: '/#contact'
        },
        {
            id: 2,
            title: 'Upholstery Services',
            description: 'Expert upholstery services to restore and transform your furniture',
            image: 'assets/images/service2.jpg',
            features: ['Fabric replacement', 'Foam replacement', 'Frame repair'],
            buttonText: 'Get Quote',
            buttonLink: '/#contact'
        },
        {
            id: 3,
            title: 'Custom Sofas',
            description: 'Design your perfect sofa with our custom manufacturing service',
            image: 'assets/images/service3.jpg',
            features: ['Bespoke design', 'Material selection', 'Size customization'],
            buttonText: 'Start Design',
            buttonLink: '/#contact'
        }
    ];
}

async function fetchReviews() {
    // Placeholder data - replace with Contentful API call
    return [
        {
            id: 1,
            name: 'Sarah Johnson',
            rating: 5,
            reviewText: 'Amazing quality and service! The custom sofa bed fits perfectly in our apartment.',
            profilePicture: 'assets/images/reviewer1.jpg'
        },
        {
            id: 2,
            name: 'Mohammed Ali',
            rating: 5,
            reviewText: 'Best sofa shop in Dubai. Great prices and excellent craftsmanship.',
            profilePicture: 'assets/images/reviewer2.jpg'
        },
        {
            id: 3,
            name: 'Emily Chen',
            rating: 4,
            reviewText: 'Very happy with our new sofa. The delivery was quick and professional.',
            profilePicture: 'assets/images/reviewer3.jpg'
        }
    ];
}

async function fetchBusinessInfo() {
    // Placeholder data - replace with Contentful API call
    return {
        shopName: 'Home Sofa',
        phone: '+971 50 000 0000',
        whatsapp: '+971 50 000 0000',
        email: 'info@homesofa.ae',
        address: 'Dubai, United Arab Emirates',
        openingHours: '9:00 AM - 10:00 PM',
        logo: 'assets/images/logo.png'
    };
}

// Render Functions
function renderHeroSlider() {
    const heroSlider = document.getElementById('heroSlider');
    if (!heroSlider || state.heroSlides.length === 0) return;
    
    const activeSlides = state.heroSlides.filter(slide => slide.active).sort((a, b) => a.order - b.order);
    
    heroSlider.innerHTML = activeSlides.map((slide, index) => `
        <div class="hero-slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
            <div class="hero-content">
                <span class="hero-badge">${slide.badge}</span>
                <h2 class="hero-title">${slide.title}</h2>
                <p class="hero-description">${slide.description}</p>
                <div class="hero-buttons">
                    <a href="${slide.primaryButtonLink}" class="btn btn-primary" target="_blank">${slide.primaryButtonText}</a>
                    <a href="${slide.secondaryButtonLink}" class="btn btn-secondary">${slide.secondaryButtonText}</a>
                </div>
            </div>
        </div>
    `).join('') + `
        <button class="hero-arrow prev" onclick="prevSlide()">❮</button>
        <button class="hero-arrow next" onclick="nextSlide()">❯</button>
        <div class="hero-nav">
            ${activeSlides.map((_, index) => `
                <div class="hero-nav-dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></div>
            `).join('')}
        </div>
    `;
}

function renderGallery() {
    const galleryCarousel = document.getElementById('galleryCarousel');
    if (!galleryCarousel || state.products.length === 0) return;
    
    galleryCarousel.innerHTML = state.products.map(product => `
        <div class="gallery-item">
            <img src="${product.mainImage}" alt="${product.name}" loading="lazy">
        </div>
    `).join('');
}

function renderReviews() {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid || state.reviews.length === 0) return;
    
    reviewsGrid.innerHTML = state.reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <img src="${review.profilePicture}" alt="${review.name}" class="review-avatar">
                <div>
                    <div class="review-name">${review.name}</div>
                    <div class="review-rating">${'⭐'.repeat(review.rating)}</div>
                </div>
            </div>
            <p class="review-text">${review.reviewText}</p>
        </div>
    `).join('');
}

function renderServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid || state.services.length === 0) return;
    
    servicesGrid.innerHTML = state.services.map(service => `
        <div class="service-card">
            <img src="${service.image}" alt="${service.title}" class="service-image">
            <div class="service-content">
                <h3>${service.title}</h3>
                <p>${service.description}</p>
                <ul class="service-features">
                    ${service.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <a href="${service.buttonLink}" class="btn btn-primary">${service.buttonText}</a>
            </div>
        </div>
    `).join('');
}

function renderBestsellers() {
    const bestsellersGrid = document.getElementById('bestsellersGrid');
    if (!bestsellersGrid || state.products.length === 0) return;
    
    const bestsellers = state.products.filter(p => p.bestSeller).sort((a, b) => a.displayOrder - b.displayOrder);
    
    bestsellersGrid.innerHTML = bestsellers.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.mainImage}" alt="${product.name}">
                ${product.featured ? '<span class="product-badge featured">Featured</span>' : ''}
                <span class="product-badge bestseller">Best Seller</span>
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">AED ${product.price.toLocaleString()}</div>
                <p class="product-description">${product.shortDescription}</p>
                <div class="product-actions">
                    <a href="/products?id=${product.id}" class="btn btn-primary">View Details</a>
                    <a href="https://wa.me/971500000000" class="btn btn-secondary" target="_blank">WhatsApp</a>
                </div>
            </div>
        </div>
    `).join('');
}

function renderBusinessInfo() {
    if (!state.businessInfo) return;
    
    const elements = {
        shopName: document.getElementById('shopName'),
        logo: document.getElementById('logo'),
        address: document.getElementById('address'),
        phone: document.getElementById('phone'),
        whatsapp: document.getElementById('whatsapp'),
        email: document.getElementById('email')
    };
    
    if (elements.shopName) elements.shopName.textContent = state.businessInfo.shopName;
    if (elements.logo) elements.logo.src = state.businessInfo.logo;
    if (elements.address) elements.address.textContent = state.businessInfo.address;
    if (elements.phone) {
        elements.phone.textContent = state.businessInfo.phone;
        elements.phone.href = `tel:${state.businessInfo.phone}`;
    }
    if (elements.whatsapp) {
        elements.whatsapp.textContent = state.businessInfo.whatsapp;
        elements.whatsapp.href = `https://wa.me/${state.businessInfo.whatsapp.replace(/\D/g, '')}`;
    }
    if (elements.email) {
        elements.email.textContent = state.businessInfo.email;
        elements.email.href = `mailto:${state.businessInfo.email}`;
    }
}

// Hero Slider Functions
function initializeHeroSlider() {
    if (state.heroSlides.length < 2) return;
    
    startAutoSlide();
}

function startAutoSlide() {
    stopAutoSlide();
    state.autoSlideInterval = setInterval(() => {
        nextSlide();
    }, 5000);
}

function stopAutoSlide() {
    if (state.autoSlideInterval) {
        clearInterval(state.autoSlideInterval);
        state.autoSlideInterval = null;
    }
}

function nextSlide() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-nav-dot');
    
    if (slides.length === 0) return;
    
    slides[state.currentSlide].classList.remove('active');
    dots[state.currentSlide].classList.remove('active');
    
    state.currentSlide = (state.currentSlide + 1) % slides.length;
    
    slides[state.currentSlide].classList.add('active');
    dots[state.currentSlide].classList.add('active');
}

function prevSlide() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-nav-dot');
    
    if (slides.length === 0) return;
    
    slides[state.currentSlide].classList.remove('active');
    dots[state.currentSlide].classList.remove('active');
    
    state.currentSlide = (state.currentSlide - 1 + slides.length) % slides.length;
    
    slides[state.currentSlide].classList.add('active');
    dots[state.currentSlide].classList.add('active');
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-nav-dot');
    
    if (slides.length === 0 || index < 0 || index >= slides.length) return;
    
    slides[state.currentSlide].classList.remove('active');
    dots[state.currentSlide].classList.remove('active');
    
    state.currentSlide = index;
    
    slides[state.currentSlide].classList.add('active');
    dots[state.currentSlide].classList.add('active');
    
    startAutoSlide();
}

// Mobile Menu
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
}

// Form Handling
function initializeForms() {
    const reviewForm = document.getElementById('reviewForm');
    const consultationForm = document.getElementById('consultationForm');
    
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }
    
    if (consultationForm) {
        consultationForm.addEventListener('submit', handleConsultationSubmit);
    }
}

async function handleReviewSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const reviewData = {
        name: formData.get('name'),
        rating: parseInt(formData.get('rating')),
        reviewText: formData.get('review'),
        status: 'pending'
    };
    
    try {
        // In production, send to your API endpoint
        console.log('Review submitted:', reviewData);
        
        // Show success message
        alert('Thank you for your review! It will be published after approval.');
        e.target.reset();
        
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('Failed to submit review. Please try again.');
    }
}

async function handleConsultationSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const consultationData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        service: formData.get('service'),
        message: formData.get('message')
    };
    
    try {
        // In production, send to your API endpoint
        console.log('Consultation requested:', consultationData);
        
        // Show success message
        alert('Thank you for your inquiry! We will contact you shortly.');
        e.target.reset();
        
    } catch (error) {
        console.error('Error submitting consultation:', error);
        alert('Failed to submit inquiry. Please try again.');
    }
}

// Utility Functions
function showLoading() {
    document.body.classList.add('loading');
}

function hideLoading() {
    document.body.classList.remove('loading');
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    document.body.prepend(errorDiv);
}

// Smooth scroll for navigation links
document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (anchor && anchor.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (header && window.scrollY > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    } else if (header) {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// Pause auto-slide on hover
const heroSlider = document.getElementById('heroSlider');
if (heroSlider) {
    heroSlider.addEventListener('mouseenter', stopAutoSlide);
    heroSlider.addEventListener('mouseleave', startAutoSlide);
}