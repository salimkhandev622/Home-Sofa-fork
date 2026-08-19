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
    currentReview: 0,
    autoSlideInterval: null,
    reviewAutoSlideInterval: null
};

// Initialize App
function initializeApp() {
    try {
        showLoading();
        
        fetchAllContent().then(() => {
            renderHeroSlider();
            renderGallery();
            renderReviews();
            renderServices();
            renderBestsellers();
            renderBusinessInfo();
            
            initializeHeroSlider();
            initializeForms();
            initializeMobileMenu();
            initHighlightSlider();
            
            hideLoading();
        }).catch(error => {
            console.error('Error in content loading:', error);
            hideLoading(); // Ensure loading is hidden even on error
            showError('Some content failed to load. Please refresh the page.');
        });
        
    } catch (error) {
        console.error('Error initializing app:', error);
        hideLoading(); // Ensure loading is hidden even on error
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
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`data/hero-slides.json?t=${timestamp}`);
        if (!response.ok) throw new Error('Failed to load hero slides');
        return await response.json();
    } catch (error) {
        console.error('Error loading hero slides:', error);
        return [
            {
                id: 1,
                image: 'assets/images/hero_sofa.jpg',
                badge: 'Dubai Sofa Factory',
                title: 'Custom Sofa Beds & Upholstery Solutions in Dubai',
                description: 'Transform your living space with our custom-made sofa beds and premium upholstery services.',
                primaryButtonText: 'WhatsApp Us',
                primaryButtonLink: 'whatsapp',
                secondaryButtonText: 'Call Now',
                secondaryButtonLink: 'phone',
                order: 1,
                active: true
            }
        ];
    }
}

async function fetchProducts() {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`data/products.json?t=${timestamp}`);
        if (!response.ok) throw new Error('Failed to load products');
        return await response.json();
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

async function fetchServices() {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`data/services.json?t=${timestamp}`);
        if (!response.ok) throw new Error('Failed to load services');
        return await response.json();
    } catch (error) {
        console.error('Error loading services:', error);
        return [];
    }
}

async function fetchReviews() {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`data/reviews.json?t=${timestamp}`);
        if (!response.ok) throw new Error('Failed to load reviews');
        return await response.json();
    } catch (error) {
        console.error('Error loading reviews:', error);
        return [];
    }
}

async function fetchBusinessInfo() {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`data/business-info.json?t=${timestamp}`);
        if (!response.ok) throw new Error('Failed to load business info');
        return await response.json();
    } catch (error) {
        console.error('Error loading business info:', error);
        return {
            shopName: 'Home Sofa',
            phone: '+971 50 000 0000',
            whatsapp: '+971 50 000 0000',
            email: 'info@homesofa.ae',
            address: 'Dubai, United Arab Emirates',
            openingHours: '9:00 AM - 10:00 PM'
        };
    }
}

// Render Functions
function renderHeroSlider() {
    const heroSlider = document.getElementById('heroSlider');
    if (!heroSlider || state.heroSlides.length === 0) return;
    
    const activeSlides = state.heroSlides.filter(slide => slide.active).sort((a, b) => a.order - b.order);
    
    // Fix image paths to use correct relative path
    const slidesWithFixedPaths = activeSlides.map(slide => ({
        ...slide,
        image: slide.image.startsWith('http') ? slide.image : slide.image
    }));
    
    // Get business info for dynamic links
    const whatsappLink = state.businessInfo.whatsapp ? `https://wa.me/${state.businessInfo.whatsapp.replace(/\D/g, '')}` : '#';
    const phoneLink = state.businessInfo.phone ? `tel:${state.businessInfo.phone.replace(/\D/g, '')}` : '#';
    
    heroSlider.innerHTML = slidesWithFixedPaths.map((slide, index) => {
        // Replace dynamic links
        const primaryLink = slide.primaryButtonLink === 'whatsapp' ? whatsappLink : slide.primaryButtonLink;
        const secondaryLink = slide.secondaryButtonLink === 'phone' ? phoneLink : slide.secondaryButtonLink;
        
        return `
        <div class="hero-slide ${index === 0 ? 'active' : ''}" data-slide="${index}" style="background-image: url('${slide.image}')">
            <div class="hero-content">
                <span class="hero-badge">${slide.badge}</span>
                <h2 class="hero-title">${slide.title}</h2>
                <p class="hero-description">${slide.description}</p>
                <div class="hero-buttons">
                    <a href="${primaryLink}" class="btn btn-primary">${slide.primaryButtonText}</a>
                    <a href="${secondaryLink}" class="btn btn-secondary">${slide.secondaryButtonText}</a>
                </div>
            </div>
        </div>
    `;
    }).join('') + `
        <button class="hero-arrow prev" onclick="prevSlide()">❮</button>
        <button class="hero-arrow next" onclick="nextSlide()">❯</button>
        <div class="hero-nav">
            ${slidesWithFixedPaths.map((_, index) => `
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
    const reviewsSlider = document.getElementById('reviewsSlider');
    const reviewsNav = document.getElementById('reviewsNav');
    
    if (!reviewsSlider || state.reviews.length === 0) return;
    
    // Filter only approved reviews
    const approvedReviews = state.reviews.filter(review => review.status === 'approved');
    
    if (approvedReviews.length === 0) return;
    
    // Render reviews in slider
    reviewsSlider.innerHTML = approvedReviews.map((review, index) => `
        <div class="review-slide ${index === 0 ? 'active' : ''}" data-review="${index}">
            <div class="review-card">
                <div class="review-header">
                    <img src="${review.profilePicture}" alt="${review.name}" class="review-avatar" onerror="this.src='https://via.placeholder.com/60x60/3a68b8/FFFFFF?text=${review.name.charAt(0)}'">
                    <div>
                        <div class="review-name">${review.name}</div>
                        <div class="review-rating">${'⭐'.repeat(review.rating)}</div>
                    </div>
                </div>
                <p class="review-text">${review.reviewText}</p>
            </div>
        </div>
    `).join('');
    
    // Render navigation dots
    reviewsNav.innerHTML = approvedReviews.map((_, index) => `
        <div class="review-nav-dot ${index === 0 ? 'active' : ''}" onclick="goToReview(${index})"></div>
    `).join('');
    
    // Start auto-slide for reviews if there are multiple reviews
    if (approvedReviews.length > 1) {
        startReviewAutoSlide();
    }
}

function renderServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid || state.services.length === 0) return;
    
    // Get business info for dynamic links
    const whatsappLink = state.businessInfo.whatsapp ? `https://wa.me/${state.businessInfo.whatsapp.replace(/\D/g, '')}` : '#';
    
    servicesGrid.innerHTML = state.services.map(service => {
        // Replace dynamic links
        const buttonLink = service.buttonLink === 'whatsapp' ? whatsappLink : service.buttonLink;
        
        return `
        <div class="specialty-card">
            <img src="${service.image}" alt="${service.title}" class="specialty-card-img" loading="lazy">
            <div class="specialty-card-body">
                <h3 class="specialty-card-title">${service.title}</h3>
                <p class="specialty-card-text">${service.description}</p>
                <ul class="specialty-card-features">
                    ${service.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <a href="${buttonLink}" class="btn btn-primary">${service.buttonText}</a>
            </div>
        </div>
    `;
    }).join('');
}

function renderBestsellers() {
    const bestsellersGrid = document.getElementById('bestsellersGrid');
    if (!bestsellersGrid || state.products.length === 0) return;
    
    const bestsellers = state.products.filter(p => p.bestSeller).sort((a, b) => a.displayOrder - b.displayOrder);
    
    // Get business info for dynamic links
    const whatsappLink = state.businessInfo.whatsapp ? `https://wa.me/${state.businessInfo.whatsapp.replace(/\D/g, '')}` : '#';
    
    bestsellersGrid.innerHTML = bestsellers.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.mainImage}" alt="${product.name}" loading="lazy">
                ${product.featured ? '<span class="product-badge featured">Featured</span>' : ''}
                <span class="product-badge bestseller">Best Seller</span>
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">AED ${product.price.toLocaleString()}</div>
                <p class="product-description">${product.shortDescription}</p>
                <div class="product-actions">
                    <a href="${whatsappLink}?text=I%20want%20to%20get%20a%20custom%20quote%20for%20${encodeURIComponent(product.name)}" class="btn btn-primary" target="_blank" style="width:100%;">Get Custom Quote</a>
                </div>
            </div>
        </div>
    `).join('');
}

function renderBusinessInfo() {
    if (!state.businessInfo) return;
    
    const elements = {
        shopName: document.getElementById('shopName'),
        address: document.getElementById('address'),
        phone: document.getElementById('phone'),
        whatsapp: document.getElementById('whatsapp'),
        email: document.getElementById('email'),
        topBarHours: document.getElementById('topBarHours'),
        topBarWhatsapp: document.getElementById('topBarWhatsapp'),
        headerWhatsapp: document.getElementById('headerWhatsapp'),
        whyWhatsapp: document.getElementById('whyWhatsapp'),
        whyPhone: document.getElementById('whyPhone'),
        consultationPhone: document.getElementById('consultationPhone'),
        consultationWhatsapp: document.getElementById('consultationWhatsapp'),
        consultationEmail: document.getElementById('consultationEmail'),
        contactPhone: document.getElementById('contactPhone'),
        contactWhatsapp: document.getElementById('contactWhatsapp'),
        contactEmail: document.getElementById('contactEmail')
    };
    
    if (elements.shopName) elements.shopName.textContent = state.businessInfo.shopName;
    if (elements.address) {
        if (elements.address.tagName === 'A') {
            elements.address.textContent = state.businessInfo.address;
        }
    }
    if (elements.topBarHours) elements.topBarHours.textContent = `Open Today ${state.businessInfo.openingHours}`;
    
    // Update phone links
    const phoneLink = `tel:${state.businessInfo.phone.replace(/\D/g, '')}`;
    if (elements.phone) {
        if (elements.phone.tagName === 'A') {
            elements.phone.textContent = state.businessInfo.phone;
            elements.phone.href = phoneLink;
        }
    }
    if (elements.whyPhone) {
        elements.whyPhone.href = phoneLink;
    }
    if (elements.consultationPhone) {
        elements.consultationPhone.textContent = state.businessInfo.phone;
        elements.consultationPhone.href = phoneLink;
    }
    if (elements.contactPhone) {
        elements.contactPhone.textContent = state.businessInfo.phone;
        elements.contactPhone.href = phoneLink;
    }
    
    // Update WhatsApp links
    const whatsappLink = `https://wa.me/${state.businessInfo.whatsapp.replace(/\D/g, '')}`;
    if (elements.whatsapp) {
        if (elements.whatsapp.tagName === 'A') {
            elements.whatsapp.textContent = state.businessInfo.whatsapp;
            elements.whatsapp.href = whatsappLink;
        }
    }
    if (elements.topBarWhatsapp) elements.topBarWhatsapp.href = whatsappLink;
    if (elements.headerWhatsapp) elements.headerWhatsapp.href = whatsappLink;
    if (elements.whyWhatsapp) elements.whyWhatsapp.href = whatsappLink;
    if (elements.consultationWhatsapp) {
        elements.consultationWhatsapp.textContent = state.businessInfo.whatsapp;
        elements.consultationWhatsapp.href = whatsappLink;
    }
    if (elements.contactWhatsapp) {
        elements.contactWhatsapp.textContent = state.businessInfo.whatsapp;
        elements.contactWhatsapp.href = whatsappLink;
    }
    
    // Update email links
    const emailLink = `mailto:${state.businessInfo.email}`;
    if (elements.email) {
        if (elements.email.tagName === 'A') {
            elements.email.textContent = state.businessInfo.email;
            elements.email.href = emailLink;
        }
    }
    if (elements.consultationEmail) {
        if (elements.consultationEmail.tagName === 'A') {
            elements.consultationEmail.textContent = state.businessInfo.email;
            elements.consultationEmail.href = emailLink;
        }
    }
    if (elements.contactEmail) {
        if (elements.contactEmail.tagName === 'A') {
            elements.contactEmail.textContent = state.businessInfo.email;
            elements.contactEmail.href = emailLink;
        }
    }
    
    // Handle plain text email elements (span tags)
    const emailTextElements = document.querySelectorAll('#email');
    emailTextElements.forEach(el => {
        if (el.tagName === 'SPAN') {
            el.textContent = state.businessInfo.email;
        }
    });
    
    // Handle plain text address elements (span tags)
    const addressTextElements = document.querySelectorAll('#address');
    addressTextElements.forEach(el => {
        if (el.tagName === 'SPAN') {
            el.textContent = state.businessInfo.address;
        }
    });
    
    // Handle plain text phone elements (span tags)
    const phoneTextElements = document.querySelectorAll('#phone');
    phoneTextElements.forEach(el => {
        if (el.tagName === 'SPAN') {
            el.textContent = state.businessInfo.phone;
        }
    });
    
    // Update social links if they exist
    if (state.businessInfo.socialLinks) {
        const socialLinks = document.querySelectorAll('.social-link');
        if (socialLinks.length > 0 && state.businessInfo.socialLinks.facebook) {
            socialLinks[0].href = state.businessInfo.socialLinks.facebook;
        }
        if (socialLinks.length > 1 && state.businessInfo.socialLinks.instagram) {
            socialLinks[1].href = state.businessInfo.socialLinks.instagram;
        }
        if (socialLinks.length > 2 && state.businessInfo.socialLinks.twitter) {
            socialLinks[2].href = state.businessInfo.socialLinks.twitter;
        }
    }
}

// Hero Slider Functions
function initializeHeroSlider() {
    if (state.heroSlides.length < 2) return;
    
    startAutoSlide();
}

// Review Slider Functions
function startReviewAutoSlide() {
    stopReviewAutoSlide();
    state.reviewAutoSlideInterval = setInterval(() => {
        nextReview();
    }, 5000);
}

function stopReviewAutoSlide() {
    if (state.reviewAutoSlideInterval) {
        clearInterval(state.reviewAutoSlideInterval);
        state.reviewAutoSlideInterval = null;
    }
}

function nextReview() {
    const reviews = document.querySelectorAll('.review-slide');
    const dots = document.querySelectorAll('.review-nav-dot');
    
    if (reviews.length === 0) return;
    
    reviews[state.currentReview].classList.remove('active');
    dots[state.currentReview].classList.remove('active');
    
    state.currentReview = (state.currentReview + 1) % reviews.length;
    
    reviews[state.currentReview].classList.add('active');
    dots[state.currentReview].classList.add('active');
}

function prevReview() {
    const reviews = document.querySelectorAll('.review-slide');
    const dots = document.querySelectorAll('.review-nav-dot');
    
    if (reviews.length === 0) return;
    
    reviews[state.currentReview].classList.remove('active');
    dots[state.currentReview].classList.remove('active');
    
    state.currentReview = (state.currentReview - 1 + reviews.length) % reviews.length;
    
    reviews[state.currentReview].classList.add('active');
    dots[state.currentReview].classList.add('active');
}

function goToReview(index) {
    const reviews = document.querySelectorAll('.review-slide');
    const dots = document.querySelectorAll('.review-nav-dot');
    
    if (reviews.length === 0 || index < 0 || index >= reviews.length) return;
    
    reviews[state.currentReview].classList.remove('active');
    dots[state.currentReview].classList.remove('active');
    
    state.currentReview = index;
    
    reviews[state.currentReview].classList.add('active');
    dots[state.currentReview].classList.add('active');
    
    startReviewAutoSlide();
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

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    
    // Pause auto-slide on hover - only after DOM is ready
    const heroSlider = document.getElementById('heroSlider');
    if (heroSlider) {
        heroSlider.addEventListener('mouseenter', stopAutoSlide);
        heroSlider.addEventListener('mouseleave', startAutoSlide);
    }
});

// Highlight/Testimonial Slider
function initHighlightSlider() {
    let activeIndex = 0;

    window.goToHighlightSlide = function(index) {
        const slides = document.querySelectorAll('.highlight-slide');
        const bullets = document.querySelectorAll('.highlight-bullet');
        if (!slides.length) return;
        slides.forEach(s => s.classList.remove('active'));
        bullets.forEach(b => b.classList.remove('active'));
        const target = document.querySelector(`.highlight-slide[data-highlight-index="${index}"]`);
        if (target) target.classList.add('active');
        if (bullets[index]) bullets[index].classList.add('active');
        activeIndex = index;
    };

    // Auto-scroll every 5s
    if (window.highlightInterval) clearInterval(window.highlightInterval);
    window.highlightInterval = setInterval(() => {
        const slides = document.querySelectorAll('.highlight-slide');
        if (!slides.length) return;
        activeIndex = (activeIndex + 1) % slides.length;
        window.goToHighlightSlide(activeIndex);
    }, 5000);
}

// Hero thumbnail background switcher
window.changeHeroBg = function(imageUrl, element) {
    const activeSlide = document.querySelector('.hero-slide.active');
    if (activeSlide) activeSlide.style.backgroundImage = `url(${imageUrl})`;
    document.querySelectorAll('.hero-thumbnail-item').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
};