// Client-side Router for Single Page Application
const Router = {
    routes: {
        '/': 'public',
        '/products': 'public',
        '/services': 'public', 
        '/about': 'public',
        '/reviews': 'public',
        '/contact': 'public',
        '/admin': 'login',
        '/admin/dashboard': 'dashboard',
        '/admin/products': 'admin-products',
        '/admin/services': 'admin-services',
        '/admin/reviews': 'admin-reviews',
        '/admin/hero': 'admin-hero',
        '/admin/business': 'admin-business',
        '/admin/contact': 'admin-contact',
        '/admin/settings': 'admin-settings'
    },

    currentRoute: null,
    isAuthenticated: false,

    init() {
        // Check authentication status
        this.checkAuth();
        
        // Handle initial route
        this.handleRoute();
        
        // Listen for route changes
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Intercept link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && this.isInternalLink(link)) {
                const href = link.getAttribute('href');
                
                if (href.startsWith('#')) {
                    // Handle anchor links
                    e.preventDefault();
                    this.handleAnchorLink(link);
                } else {
                    // Handle regular navigation
                    e.preventDefault();
                    this.navigate(href);
                }
            }
        });
    },

    checkAuth() {
        const token = localStorage.getItem('adminToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token));
                const tokenAge = Date.now() - payload.timestamp;
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                
                if (tokenAge < maxAge) {
                    this.isAuthenticated = true;
                } else {
                    localStorage.removeItem('adminToken');
                    this.isAuthenticated = false;
                }
            } catch (e) {
                localStorage.removeItem('adminToken');
                this.isAuthenticated = false;
            }
        }
    },

    isInternalLink(link) {
        const href = link.getAttribute('href');
        return href && (href.startsWith('/') || href.startsWith('#')) && !href.startsWith('//');
    },

    handleAnchorLink(anchor) {
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('#')) {
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // If we're not on the homepage, navigate to homepage first
                if (window.location.pathname !== '/') {
                    this.navigate('/');
                    // After navigation, scroll to the target
                    setTimeout(() => {
                        this.scrollToElement(targetElement);
                    }, 100);
                } else {
                    this.scrollToElement(targetElement);
                }
            }
        }
    },

    scrollToElement(element) {
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    },

    navigate(path) {
        // Update URL without page reload
        window.history.pushState({}, '', path);
        this.handleRoute();
    },

    handleRoute() {
        const path = window.location.pathname;
        const route = this.matchRoute(path);
        
        if (route !== this.currentRoute) {
            this.currentRoute = route;
            this.renderRoute(route);
        }
    },

    matchRoute(path) {
        // Exact match first
        if (this.routes[path]) {
            return this.routes[path];
        }
        
        // Pattern matching for dynamic routes
        for (const route in this.routes) {
            if (this.matchPattern(route, path)) {
                return this.routes[route];
            }
        }
        
        // Default to public for unknown routes
        return 'public';
    },

    matchPattern(pattern, path) {
        // Simple pattern matching (can be extended)
        if (pattern.includes(':')) {
            const patternParts = pattern.split('/');
            const pathParts = path.split('/');
            
            if (patternParts.length !== pathParts.length) return false;
            
            for (let i = 0; i < patternParts.length; i++) {
                if (patternParts[i].startsWith(':')) continue;
                if (patternParts[i] !== pathParts[i]) return false;
            }
            
            return true;
        }
        
        return false;
    },

    renderRoute(route) {
        const app = document.getElementById('app');
        
        // Clear current content
        app.innerHTML = '';
        
        switch (route) {
            case 'public':
                this.renderPublicSite();
                break;
            case 'login':
                this.renderLoginPage();
                break;
            case 'dashboard':
            case 'admin-products':
            case 'admin-services':
            case 'admin-reviews':
            case 'admin-hero':
            case 'admin-business':
            case 'admin-contact':
            case 'admin-settings':
                this.renderAdminDashboard(route);
                break;
            default:
                this.renderPublicSite();
        }
    },

    renderPublicSite() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <!-- Top Information Bar -->
            <div class="top-bar" id="topBar">
                <div class="container">
                    <div class="top-bar-content">
                        <span class="location">Serving Dubai</span>
                        <span class="hours">Open Today 9:00 AM - 10:00 PM</span>
                        <a href="https://wa.me/971500000000" class="whatsapp-link" target="_blank">
                            <span class="whatsapp-icon">📱</span> WhatsApp
                        </a>
                    </div>
                </div>
            </div>

            <!-- Header / Navigation -->
            <header class="header" id="header">
                <div class="container">
                    <div class="header-content">
                        <div class="logo-section">
                            <img src="assets/images/logo.png" alt="Home Sofa Logo" class="logo" id="logo">
                            <h1 class="shop-name" id="shopName">Home Sofa</h1>
                        </div>
                        <nav class="nav-menu" id="navMenu">
                            <ul>
                                <li><a href="/" class="nav-link ${window.location.pathname === '/' ? 'active' : ''}">Home</a></li>
                                <li><a href="/products" class="nav-link ${window.location.pathname === '/products' ? 'active' : ''}">Sofas</a></li>
                                <li><a href="/#services" class="nav-link">Services</a></li>
                                <li><a href="/#about" class="nav-link">About</a></li>
                                <li><a href="/#reviews" class="nav-link">Reviews</a></li>
                                <li><a href="/#contact" class="nav-link">Contact</a></li>
                            </ul>
                        </nav>
                        <div class="header-actions">
                            <a href="https://wa.me/971500000000" class="btn btn-primary whatsapp-btn" target="_blank">
                                WhatsApp Us
                            </a>
                            <button class="mobile-menu-btn" id="mobileMenuBtn">
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Main Content Container -->
            <div id="mainContent">
                <!-- Content will be loaded based on current route -->
            </div>

            <!-- Footer -->
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h3>Home Sofa</h3>
                            <p>Dubai's premier sofa shop for custom sofa beds and upholstery solutions.</p>
                            <div class="social-links">
                                <a href="#" class="social-link">Facebook</a>
                                <a href="#" class="social-link">Instagram</a>
                                <a href="#" class="social-link">Twitter</a>
                            </div>
                        </div>
                        <div class="footer-section">
                            <h3>Quick Links</h3>
                            <ul>
                                <li><a href="/">Home</a></li>
                                <li><a href="/products">Products</a></li>
                                <li><a href="/#services">Services</a></li>
                                <li><a href="/#about">About</a></li>
                                <li><a href="/#contact">Contact</a></li>
                            </ul>
                        </div>
                        <div class="footer-section">
                            <h3>Services</h3>
                            <ul>
                                <li><a href="/#services">Sofa Beds</a></li>
                                <li><a href="/#services">Upholstery</a></li>
                                <li><a href="/#services">Custom Sofas</a></li>
                                <li><a href="/#services">Repairs</a></li>
                            </ul>
                        </div>
                        <div class="footer-section">
                            <h3>Contact</h3>
                            <p>📍 Dubai, UAE</p>
                            <p>📞 +971 50 000 0000</p>
                            <p>✉️ info@homesofa.ae</p>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>&copy; 2024 Home Sofa. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        `;

        // Load appropriate content based on route
        this.loadPublicContent();
    },

    loadPublicContent() {
        const mainContent = document.getElementById('mainContent');
        const path = window.location.pathname;

        if (path === '/products') {
            this.loadProductsPage();
        } else {
            this.loadHomePage();
        }
    },

    loadHomePage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <!-- Hero Section -->
            <section class="hero" id="home">
                <div class="hero-slider" id="heroSlider">
                    <!-- Hero slides will be loaded from CMS -->
                </div>
            </section>

            <!-- Sofa Image Gallery / Carousel -->
            <section class="gallery-section">
                <div class="container">
                    <h2 class="section-title">Our Sofa Collection</h2>
                    <div class="gallery-carousel" id="galleryCarousel">
                        <!-- Gallery images will be loaded from CMS -->
                    </div>
                </div>
            </section>

            <!-- Trust/Benefit Indicators -->
            <section class="trust-section">
                <div class="container">
                    <div class="trust-indicators">
                        <div class="trust-item">
                            <div class="trust-icon">✓</div>
                            <h3>Premium Quality</h3>
                            <p>Highest quality materials and craftsmanship</p>
                        </div>
                        <div class="trust-item">
                            <div class="trust-icon">✓</div>
                            <h3>Custom Design</h3>
                            <p>Tailored to your specific requirements</p>
                        </div>
                        <div class="trust-item">
                            <div class="trust-icon">✓</div>
                            <h3>Fast Delivery</h3>
                            <p>Quick turnaround and installation</p>
                        </div>
                        <div class="trust-item">
                            <div class="trust-icon">✓</div>
                            <h3>Best Prices</h3>
                            <p>Competitive pricing with no hidden costs</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Customer Reviews -->
            <section class="reviews-section" id="reviews">
                <div class="container">
                    <h2 class="section-title">What Our Customers Say</h2>
                    <div class="reviews-grid" id="reviewsGrid">
                        <!-- Reviews will be loaded from CMS -->
                    </div>
                    <div class="review-submission">
                        <h3>Leave a Review</h3>
                        <form id="reviewForm">
                            <input type="text" name="name" placeholder="Your Name" required>
                            <select name="rating" required>
                                <option value="">Select Rating</option>
                                <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                                <option value="4">⭐⭐⭐⭐ Good</option>
                                <option value="3">⭐⭐⭐ Average</option>
                                <option value="2">⭐⭐ Poor</option>
                                <option value="1">⭐ Very Poor</option>
                            </select>
                            <textarea name="review" placeholder="Your Review" required></textarea>
                            <button type="submit" class="btn btn-primary">Submit Review</button>
                        </form>
                    </div>
                </div>
            </section>

            <!-- Specialty Services -->
            <section class="services-section" id="services">
                <div class="container">
                    <h2 class="section-title">Our Dubai Specialty Services</h2>
                    <div class="services-grid" id="servicesGrid">
                        <!-- Services will be loaded from CMS -->
                    </div>
                </div>
            </section>

            <!-- Company/About Section -->
            <section class="about-section" id="about">
                <div class="container">
                    <div class="about-content">
                        <div class="about-text">
                            <h2 class="section-title">About Home Sofa</h2>
                            <p>Home Sofa is Dubai's premier destination for custom sofa beds and upholstery solutions. With years of experience in the furniture industry, we pride ourselves on delivering exceptional quality and customer service.</p>
                            <p>Our team of skilled craftsmen uses only the finest materials to create beautiful, comfortable, and durable sofas that transform your living spaces. From classic designs to modern styles, we have something for every taste and budget.</p>
                            <div class="about-stats">
                                <div class="stat">
                                    <h3>500+</h3>
                                    <p>Happy Customers</p>
                                </div>
                                <div class="stat">
                                    <h3>10+</h3>
                                    <p>Years Experience</p>
                                </div>
                                <div class="stat">
                                    <h3>100%</h3>
                                    <p>Satisfaction Rate</p>
                                </div>
                            </div>
                        </div>
                        <div class="about-image">
                            <img src="assets/images/about.jpg" alt="About Home Sofa">
                        </div>
                    </div>
                </div>
            </section>

            <!-- Feature/Benefit Icons -->
            <section class="features-section">
                <div class="container">
                    <h2 class="section-title">Why Choose Us</h2>
                    <div class="features-grid" id="featuresGrid">
                        <div class="feature-item">
                            <div class="feature-icon">🛋️</div>
                            <h3>Wide Selection</h3>
                            <p>Extensive range of sofa designs and styles</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">🎨</div>
                            <h3>Custom Colors</h3>
                            <p>Choose from various fabric colors and textures</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">📏</div>
                            <h3>Custom Sizes</h3>
                            <p>Sofas made to fit your space perfectly</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">🔧</div>
                            <h3>Free Installation</h3>
                            <p>Professional installation at no extra cost</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">🛡️</div>
                            <h3>Warranty</h3>
                            <p>Comprehensive warranty on all products</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">💰</div>
                            <h3>Flexible Payment</h3>
                            <p>Multiple payment options available</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Best-Selling Sofa Collection -->
            <section class="bestsellers-section" id="products">
                <div class="container">
                    <h2 class="section-title">Best-Selling Sofas</h2>
                    <div class="products-grid" id="bestsellersGrid">
                        <!-- Best sellers will be loaded from CMS -->
                    </div>
                    <div class="section-cta">
                        <a href="/products" class="btn btn-secondary">View All Products</a>
                    </div>
                </div>
            </section>

            <!-- Sofa/Product Features -->
            <section class="product-features-section">
                <div class="container">
                    <h2 class="section-title">Our Sofa Features</h2>
                    <div class="product-features">
                        <div class="feature-card">
                            <img src="assets/images/feature1.jpg" alt="High Density Foam">
                            <h3>High Density Foam</h3>
                            <p>Premium foam for long-lasting comfort and support</p>
                        </div>
                        <div class="feature-card">
                            <img src="assets/images/feature2.jpg" alt="Premium Fabric">
                            <h3>Premium Fabric</h3>
                            <p>High-quality, durable fabrics in various colors</p>
                        </div>
                        <div class="feature-card">
                            <img src="assets/images/feature3.jpg" alt="Sturdy Frame">
                            <h3>Sturdy Frame</h3>
                            <p>Solid wood frame for durability and stability</p>
                        </div>
                        <div class="feature-card">
                            <img src="assets/images/feature4.jpg" alt="Easy Maintenance">
                            <h3>Easy Maintenance</h3>
                            <p>Easy to clean and maintain for long-lasting beauty</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Working Process -->
            <section class="process-section">
                <div class="container">
                    <h2 class="section-title">How It Works</h2>
                    <div class="process-steps" id="processSteps">
                        <div class="process-step">
                            <div class="step-number">1</div>
                            <h3>Consultation</h3>
                            <p>Discuss your requirements and preferences with our experts</p>
                        </div>
                        <div class="process-step">
                            <div class="step-number">2</div>
                            <h3>Design</h3>
                            <p>Choose your design, fabric, and customization options</p>
                        </div>
                        <div class="process-step">
                            <div class="step-number">3</div>
                            <h3>Production</h3>
                            <p>Our craftsmen create your custom sofa with care</p>
                        </div>
                        <div class="process-step">
                            <div class="step-number">4</div>
                            <h3>Delivery</h3>
                            <p>Free delivery and professional installation</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Consultation/Contact Form -->
            <section class="consultation-section" id="contact">
                <div class="container">
                    <h2 class="section-title">Get Free Consultation</h2>
                    <div class="consultation-form">
                        <form id="consultationForm">
                            <div class="form-row">
                                <input type="text" name="name" placeholder="Your Name" required>
                                <input type="tel" name="phone" placeholder="Phone Number" required>
                            </div>
                            <div class="form-row">
                                <input type="email" name="email" placeholder="Email Address" required>
                                <select name="service" required>
                                    <option value="">Select Service</option>
                                    <option value="sofa-bed">Sofa Bed</option>
                                    <option value="upholstery">Upholstery</option>
                                    <option value="custom-sofa">Custom Sofa</option>
                                    <option value="repair">Repair</option>
                                </select>
                            </div>
                            <textarea name="message" placeholder="Tell us about your requirements" required></textarea>
                            <button type="submit" class="btn btn-primary">Request Consultation</button>
                        </form>
                    </div>
                </div>
            </section>

            <!-- Contact Information -->
            <section class="contact-info-section">
                <div class="container">
                    <h2 class="section-title">Contact Information</h2>
                    <div class="contact-info" id="contactInfo">
                        <div class="contact-item">
                            <div class="contact-icon">📍</div>
                            <h3>Location</h3>
                            <p id="address">Dubai, United Arab Emirates</p>
                        </div>
                        <div class="contact-item">
                            <div class="contact-icon">📞</div>
                            <h3>Phone</h3>
                            <p><a href="tel:+971500000000" id="phone">+971 50 000 0000</a></p>
                        </div>
                        <div class="contact-item">
                            <div class="contact-icon">📱</div>
                            <h3>WhatsApp</h3>
                            <p><a href="https://wa.me/971500000000" id="whatsapp" target="_blank">+971 50 000 0000</a></p>
                        </div>
                        <div class="contact-item">
                            <div class="contact-icon">✉️</div>
                            <h3>Email</h3>
                            <p><a href="mailto:info@homesofa.ae" id="email">info@homesofa.ae</a></p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Location Information -->
            <section class="location-section">
                <div class="container">
                    <h2 class="section-title">Find Us</h2>
                    <div class="location-map">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.1234567890123!2d55.12345678901234!3d25.12345678901234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDA3JzI0LjQiTiA1NcKwMDcnMjQuNCJF!5e0!3m2!1sen!2sae!4v1234567890123!5m2!1sen!2sae"
                            width="100%" 
                            height="400" 
                            style="border:0;" 
                            allowfullscreen="" 
                            loading="lazy">
                        </iframe>
                    </div>
                </div>
            </section>
        `;

        // Initialize main app functionality
        if (typeof initializeApp === 'function') {
            initializeApp();
        }
    },

    loadProductsPage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <!-- Page Header -->
            <section class="page-header">
                <div class="container">
                    <h1>Our Sofa Collection</h1>
                    <p>Discover our complete range of premium sofas and custom furniture</p>
                </div>
            </section>

            <!-- Filters -->
            <section class="filters-section">
                <div class="container">
                    <div class="filters">
                        <div class="filter-group">
                            <label>Category:</label>
                            <select id="categoryFilter">
                                <option value="">All Categories</option>
                                <option value="sofa">Sofas</option>
                                <option value="sofa-bed">Sofa Beds</option>
                                <option value="sectional">Sectional</option>
                                <option value="recliner">Recliners</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>Sort By:</label>
                            <select id="sortFilter">
                                <option value="default">Default</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="name">Name</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>Show:</label>
                            <select id="availabilityFilter">
                                <option value="all">All Products</option>
                                <option value="available">Available Only</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Products Grid -->
            <section class="products-page-section">
                <div class="container">
                    <div class="products-grid" id="productsGrid">
                        <!-- Products will be loaded from CMS -->
                    </div>
                    <div class="pagination" id="pagination">
                        <!-- Pagination will be rendered here -->
                    </div>
                </div>
            </section>

            <!-- Product Modal -->
            <div class="product-modal" id="productModal">
                <div class="modal-content">
                    <button class="modal-close" onclick="closeProductModal()">&times;</button>
                    <div class="modal-body">
                        <div class="modal-gallery">
                            <div class="main-image">
                                <img id="modalMainImage" src="" alt="">
                            </div>
                            <div class="thumbnail-grid" id="modalThumbnails">
                                <!-- Thumbnails will be rendered here -->
                            </div>
                        </div>
                        <div class="modal-details">
                            <h2 id="modalProductName"></h2>
                            <div class="modal-price" id="modalPrice"></div>
                            <div class="modal-badges" id="modalBadges"></div>
                            <p id="modalDescription"></p>
                            <div class="modal-specs">
                                <div class="spec-item">
                                    <span class="spec-label">Category:</span>
                                    <span id="modalCategory"></span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Availability:</span>
                                    <span id="modalAvailability"></span>
                                </div>
                            </div>
                            <div class="modal-actions">
                                <a href="https://wa.me/971500000000" class="btn btn-primary" id="modalWhatsapp" target="_blank">
                                    WhatsApp Us
                                </a>
                                <a href="tel:+971500000000" class="btn btn-secondary">
                                    Call Now
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize products page functionality
        if (typeof initializeProductsPage === 'function') {
            initializeProductsPage();
        }
    },

    renderLoginPage() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="login-page">
                <div class="login-container">
                    <div class="login-box">
                        <div class="login-header">
                            <img src="assets/images/logo.png" alt="Home Sofa Logo" class="login-logo">
                            <h1>Admin Dashboard</h1>
                            <p>Sign in to manage your website content</p>
                        </div>
                        
                        <form id="loginForm" class="login-form">
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" id="email" name="email" required placeholder="admin@homesofa.ae">
                            </div>
                            
                            <div class="form-group">
                                <label for="password">Password</label>
                                <input type="password" id="password" name="password" required placeholder="••••••••">
                            </div>
                            
                            <div class="form-group remember-me">
                                <label>
                                    <input type="checkbox" name="remember">
                                    Remember me
                                </label>
                            </div>
                            
                            <button type="submit" class="btn btn-primary btn-block">Sign In</button>
                        </form>
                        
                        <div class="login-footer">
                            <p><a href="#">Forgot password?</a></p>
                            <p class="signup-link">Need an account? <a href="#">Contact administrator</a></p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize login functionality
        if (typeof initializeLogin === 'function') {
            initializeLogin();
        }
    },

    renderAdminDashboard(section) {
        // Check authentication
        if (!this.isAuthenticated) {
            this.navigate('/admin');
            return;
        }

        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="dashboard-layout">
                <!-- Sidebar -->
                <aside class="sidebar" id="sidebar">
                    <div class="sidebar-header">
                        <img src="assets/images/logo.png" alt="Home Sofa Logo" class="sidebar-logo">
                        <span class="sidebar-title">Home Sofa</span>
                    </div>
                    
                    <nav class="sidebar-nav">
                        <ul>
                            <li><a href="/admin/dashboard" class="${section === 'dashboard' ? 'active' : ''}"><span class="sidebar-nav-icon">📊</span> Dashboard</a></li>
                            <li><a href="/admin/products" class="${section === 'admin-products' ? 'active' : ''}"><span class="sidebar-nav-icon">🛋️</span> Products</a></li>
                            <li><a href="/admin/services" class="${section === 'admin-services' ? 'active' : ''}"><span class="sidebar-nav-icon">🔧</span> Services</a></li>
                            <li><a href="/admin/reviews" class="${section === 'admin-reviews' ? 'active' : ''}"><span class="sidebar-nav-icon">⭐</span> Reviews</a></li>
                            <li><a href="/admin/hero" class="${section === 'admin-hero' ? 'active' : ''}"><span class="sidebar-nav-icon">🖼️</span> Hero Slider</a></li>
                            <li><a href="/admin/business" class="${section === 'admin-business' ? 'active' : ''}"><span class="sidebar-nav-icon">🏢</span> Business Info</a></li>
                            <li><a href="/admin/contact" class="${section === 'admin-contact' ? 'active' : ''}"><span class="sidebar-nav-icon">📞</span> Contact Requests</a></li>
                            <li><a href="/admin/settings" class="${section === 'admin-settings' ? 'active' : ''}"><span class="sidebar-nav-icon">⚙️</span> Settings</a></li>
                        </ul>
                    </nav>
                    
                    <div class="sidebar-footer">
                        <button class="logout-btn" onclick="Router.logout()">Sign Out</button>
                    </div>
                </aside>
                
                <!-- Main Content -->
                <main class="main-content">
                    <!-- Top Bar -->
                    <div class="top-bar">
                        <div class="top-bar-left">
                            <button class="menu-toggle" id="menuToggle">☰</button>
                            <div class="breadcrumb">
                                <a href="/admin">Admin</a> / <span id="currentSection">${this.formatSectionName(section)}</span>
                            </div>
                        </div>
                        <div class="top-bar-right">
                            <div class="user-menu">
                                <div class="user-avatar">A</div>
                                <span class="user-name">Admin</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Content Area -->
                    <div class="content-area" id="adminContent">
                        <!-- Admin content will be loaded based on section -->
                    </div>
                </main>
            </div>
            
            <!-- Product Modal -->
            <div class="modal" id="productModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title" id="productModalTitle">Add Product</h3>
                        <button class="modal-close" onclick="closeProductModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="productForm">
                            <input type="hidden" name="productId" id="productId">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Product Name</label>
                                    <input type="text" name="name" id="productName" required>
                                </div>
                                <div class="form-group">
                                    <label>Price (AED)</label>
                                    <input type="number" name="price" id="productPrice" required>
                                </div>
                                <div class="form-group">
                                    <label>Category</label>
                                    <select name="category" id="productCategory" required>
                                        <option value="sofa">Sofa</option>
                                        <option value="sofa-bed">Sofa Bed</option>
                                        <option value="sectional">Sectional</option>
                                        <option value="recliner">Recliner</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Display Order</label>
                                    <input type="number" name="displayOrder" id="productDisplayOrder" value="0">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Short Description</label>
                                <textarea name="shortDescription" id="productShortDescription" rows="2" required></textarea>
                            </div>
                            <div class="form-group">
                                <label>Full Description</label>
                                <textarea name="fullDescription" id="productFullDescription" rows="4" required></textarea>
                            </div>
                            <div class="form-group">
                                <label>Main Image</label>
                                <div class="image-upload" onclick="document.getElementById('mainImageInput').click()">
                                    <div class="image-upload-icon">📷</div>
                                    <div class="image-upload-text">Click to upload main image</div>
                                    <input type="file" id="mainImageInput" accept="image/*" class="image-upload-input">
                                </div>
                                <div class="image-preview" id="mainImagePreview"></div>
                            </div>
                            <div class="form-group">
                                <label>Gallery Images</label>
                                <div class="image-upload" onclick="document.getElementById('galleryImagesInput').click()">
                                    <div class="image-upload-icon">📷</div>
                                    <div class="image-upload-text">Click to upload gallery images</div>
                                    <input type="file" id="galleryImagesInput" accept="image/*" multiple class="image-upload-input">
                                </div>
                                <div class="image-preview" id="galleryImagesPreview"></div>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" name="featured" id="productFeatured"> Featured Product
                                </label>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" name="bestSeller" id="productBestSeller"> Best Seller
                                </label>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" name="available" id="productAvailable" checked> Available
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="closeProductModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="saveProduct()">Save Product</button>
                    </div>
                </div>
            </div>
        `;

        // Load admin content based on section
        this.loadAdminContent(section);

        // Initialize mobile menu
        this.initializeMobileMenu();
    },

    loadAdminContent(section) {
        const adminContent = document.getElementById('adminContent');
        
        switch (section) {
            case 'dashboard':
                this.loadDashboardContent();
                break;
            case 'admin-products':
                this.loadProductsContent();
                break;
            case 'admin-services':
                this.loadServicesContent();
                break;
            case 'admin-reviews':
                this.loadReviewsContent();
                break;
            case 'admin-hero':
                this.loadHeroContent();
                break;
            case 'admin-business':
                this.loadBusinessContent();
                break;
            case 'admin-contact':
                this.loadContactContent();
                break;
            case 'admin-settings':
                this.loadSettingsContent();
                break;
            default:
                this.loadDashboardContent();
        }
    },

    loadDashboardContent() {
        const adminContent = document.getElementById('adminContent');
        adminContent.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Dashboard</h1>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="refreshData()">Refresh Data</button>
                </div>
            </div>
            
            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue">🛋️</div>
                    <div class="stat-info">
                        <h3 id="totalProducts">0</h3>
                        <p>Total Products</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">⭐</div>
                    <div class="stat-info">
                        <h3 id="totalReviews">0</h3>
                        <p>Total Reviews</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon yellow">📧</div>
                    <div class="stat-info">
                        <h3 id="pendingInquiries">0</h3>
                        <p>Pending Inquiries</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon red">⏳</div>
                    <div class="stat-info">
                        <h3 id="pendingReviews">0</h3>
                        <p>Pending Reviews</p>
                    </div>
                </div>
            </div>
            
            <!-- Recent Activity -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Recent Activity</h2>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Activity</th>
                                    <th>Type</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="recentActivity">
                                <!-- Recent activity will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Initialize dashboard functionality
        if (typeof initializeDashboard === 'function') {
            initializeDashboard();
        }
    },

    loadProductsContent() {
        const adminContent = document.getElementById('adminContent');
        adminContent.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Products</h1>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="showProductModal()">Add Product</button>
                </div>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="productsTable">
                                <!-- Products will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Initialize products management
        if (typeof initializeAdminProducts === 'function') {
            initializeAdminProducts();
        }
    },

    loadServicesContent() {
        const adminContent = document.getElementById('adminContent');
        adminContent.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Services</h1>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="showServiceModal()">Add Service</button>
                </div>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="servicesTable">
                                <!-- Services will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    loadReviewsContent() {
        const adminContent = document.getElementById('adminContent');
        adminContent.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Reviews</h1>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Rating</th>
                                    <th>Review</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="reviewsTable">
                                <!-- Reviews will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    loadHeroContent() {
        const adminContent = document.getElementById('adminContent');
        adminContent.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Hero Slider</h1>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="showHeroModal()">Add Slide</button>
                </div>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Title</th>
                                    <th>Order</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="heroTable">
                                <!-- Hero slides will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    loadBusinessContent() {
        const adminContent = document.getElementById('adminContent');
        adminContent.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Business Information</h1>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="saveBusinessInfo()">Save Changes</button>
                </div>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <form id="businessInfoForm">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Shop Name</label>
                                <input type="text" name="shopName" id="shopName" required>
                            </div>
                            <div class="form-group">
                                <label>Phone</label>
                                <input type="tel" name="phone" id="phone" required>
                            </div>
                            <div class="form-group">
                                <label>WhatsApp</label>
                                <input type="tel" name="whatsapp" id="whatsapp" required>
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" name="email" id="email" required>
                            </div>
                            <div class="form-group">
                                <label>Address</label>
                                <input type="text" name="address" id="address" required>
                            </div>
                            <div class="form-group">
                                <label>Opening Hours</label>
                                <input type="text" name="openingHours" id="openingHours" required>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    loadContactContent() {
        const adminContent = document.getElementById('adminContent');
        adminContent.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Contact Requests</h1>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Service</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="contactTable">
                                <!-- Contact requests will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    loadSettingsContent() {
        const adminContent = document.getElementById('adminContent');
        adminContent.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Settings</h1>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">API Configuration</h2>
                </div>
                <div class="card-body">
                    <form id="apiConfigForm">
                        <div class="form-group">
                            <label>Contentful Space ID</label>
                            <input type="text" name="spaceId" id="spaceId" required>
                        </div>
                        <div class="form-group">
                            <label>Contentful Access Token</label>
                            <input type="text" name="accessToken" id="accessToken" required>
                        </div>
                        <div class="form-group">
                            <label>Contentful Management Token</label>
                            <input type="text" name="managementToken" id="managementToken" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Save Configuration</button>
                    </form>
                </div>
            </div>
        `;
    },

    formatSectionName(section) {
        const names = {
            'dashboard': 'Dashboard',
            'admin-products': 'Products',
            'admin-services': 'Services',
            'admin-reviews': 'Reviews',
            'admin-hero': 'Hero Slider',
            'admin-business': 'Business Info',
            'admin-contact': 'Contact Requests',
            'admin-settings': 'Settings'
        };
        return names[section] || 'Dashboard';
    },

    initializeMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
    },

    logout() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('rememberAdmin');
        this.isAuthenticated = false;
        this.navigate('/admin');
    }
};

// Initialize router when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Router.init();
});