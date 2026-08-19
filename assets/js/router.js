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
                        <span class="hours" id="topBarHours">Open Today 9:00 AM - 10:00 PM</span>
                        <a href="#" class="whatsapp-link" id="topBarWhatsapp" target="_blank">
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
                            <a href="#" class="btn btn-primary whatsapp-btn" id="headerWhatsapp" target="_blank">
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
                            <p>📍 <span id="address">Dubai, UAE</span></p>
                            <p>📞 <span id="phone">+971 50 000 0000</span></p>
                            <p>✉️ <span id="email">info@homesofa.ae</span></p>
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
                <!-- Thumbnail bar overlay on hero bottom left -->
                <div class="hero-thumbnails-container" id="heroThumbnails">
                    <div class="hero-thumbnail-item active" onclick="changeHeroBg('assets/images/hero_sofa.jpg', this)">
                        <img src="assets/images/hero_sofa.jpg" alt="Hero Sofa">
                    </div>
                    <div class="hero-thumbnail-item" onclick="changeHeroBg('assets/images/thumb_sofa1.jpg', this)">
                        <img src="assets/images/thumb_sofa1.jpg" alt="Sofa 1">
                    </div>
                    <div class="hero-thumbnail-item" onclick="changeHeroBg('assets/images/thumb_sofa2.jpg', this)">
                        <img src="assets/images/thumb_sofa2.jpg" alt="Sofa 2">
                    </div>
                    <div class="hero-thumbnail-item" onclick="changeHeroBg('assets/images/thumb_sofa3.jpg', this)">
                        <img src="assets/images/thumb_sofa3.jpg" alt="Sofa 3">
                    </div>
                    <div class="hero-thumbnail-item" onclick="changeHeroBg('assets/images/thumb_sofa4.jpg', this)">
                        <img src="assets/images/thumb_sofa4.jpg" alt="Sofa 4">
                    </div>
                </div>
            </section>

            <!-- 5 Category Circular Icons Section -->
            <section class="category-bar-section">
                <div class="container">
                    <div class="category-bar-grid">
                        <a href="/#services" class="category-bar-item">
                            <div class="category-circle-icon">🛋️</div>
                            <span class="category-bar-label">Custom Sofa Beds</span>
                        </a>
                        <a href="/#services" class="category-bar-item">
                            <div class="category-circle-icon">🪑</div>
                            <span class="category-bar-label">Corner Sofa Bed</span>
                        </a>
                        <a href="/#services" class="category-bar-item">
                            <div class="category-circle-icon">🛠️</div>
                            <span class="category-bar-label">Upholstery Services</span>
                        </a>
                        <a href="/#services" class="category-bar-item">
                            <div class="category-circle-icon">📏</div>
                            <span class="category-bar-label">Custom Sofas</span>
                        </a>
                        <a href="/#services" class="category-bar-item">
                            <div class="category-circle-icon">⚙️</div>
                            <span class="category-bar-label">Sofa Repair</span>
                        </a>
                    </div>
                </div>
            </section>

            <!-- Black Review/Highlight Slider Section -->
            <section class="highlight-carousel-section">
                <div class="container">
                    <div class="highlight-carousel-container" id="highlightSlider">
                        <div class="highlight-slide active" data-highlight-index="0">
                            <p class="highlight-quote">"All of our custom sofa beds and upholstery services are made with top-quality materials. Nebraska L-Shape sofa bed is one of our best sellers in Dubai."</p>
                            <span class="highlight-author">Home Sofa Dubai Factory</span>
                        </div>
                        <div class="highlight-slide" data-highlight-index="1">
                            <p class="highlight-quote">"Nebraska U-Shape sofa is custom-made with premium fabric, high density foam for long lasting comfort, and a sturdy frame."</p>
                            <span class="highlight-author">Master Craftsman Quality</span>
                        </div>
                        <div class="highlight-slide" data-highlight-index="2">
                            <p class="highlight-quote">"Free delivery and professional assembly included with all orders. Handcrafted in our local Dubai factory."</p>
                            <span class="highlight-author">100% Quality Sofa Factory</span>
                        </div>
                        <div class="highlight-bullets">
                            <span class="highlight-bullet active" onclick="goToHighlightSlide(0)"></span>
                            <span class="highlight-bullet" onclick="goToHighlightSlide(1)"></span>
                            <span class="highlight-bullet" onclick="goToHighlightSlide(2)"></span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Our Dubai Specialty Services -->
            <section class="specialty-services-section" id="services">
                <div class="container">
                    <h2 class="section-title">Our Dubai Specialty Services</h2>
                    <p style="text-align: center; color: var(--text-light); max-width: 600px; margin: -30px auto 50px auto; font-size: 14px;">
                        Right choice for premium quality sofa beds, custom sofas, upholstery and couch repair in Dubai
                    </p>
                    <div class="specialty-grid" id="servicesGrid">
                        <!-- Services will be loaded from JSON -->
                    </div>
                </div>
            </section>

            <!-- Why Home Sofa Section (Split 50/50) -->
            <section class="why-section">
                <div class="container">
                    <div class="why-grid">
                        <div class="why-left">
                            <h2>Why Home Sofa is Dubai's Trusted Sofa Factory</h2>
                            <p>All our sofas are built to last using locally sourced materials and top-tier workmanship. We focus on customization and convenience to give you exactly what your living space needs.</p>
                            <div class="why-checklist">
                                <div class="why-checklist-item"><span class="chk-icon">✓</span> Expert Customization</div>
                                <div class="why-checklist-item"><span class="chk-icon">✓</span> Premium Upholstery</div>
                                <div class="why-checklist-item"><span class="chk-icon">✓</span> Durable Materials</div>
                                <div class="why-checklist-item"><span class="chk-icon">✓</span> Competitive Pricing</div>
                                <div class="why-checklist-item"><span class="chk-icon">✓</span> Professional Installation</div>
                                <div class="why-checklist-item"><span class="chk-icon">✓</span> Customer Satisfaction</div>
                            </div>
                            <div class="why-buttons">
                                <a href="#" class="btn btn-primary" id="whyWhatsapp" target="_blank">📱 WhatsApp Sofa Factory</a>
                                <a href="#" class="btn btn-secondary" id="whyPhone">📞 Call Sofa Expert</a>
                            </div>
                        </div>
                        <div class="why-right">
                            <img src="assets/images/hero_sofa.jpg" alt="Home Sofa Dubai Factory">
                        </div>
                    </div>
                </div>
            </section>

            <!-- 5 Feature Badges Row -->
            <section class="features-icon-bar">
                <div class="container">
                    <div class="features-icon-grid">
                        <div class="features-icon-item">
                            <div class="features-icon-circle">🛠️</div>
                            <h4>Custom Designs</h4>
                            <p>Tailored layouts</p>
                        </div>
                        <div class="features-icon-item">
                            <div class="features-icon-circle">🎨</div>
                            <h4>Premium Fabric</h4>
                            <p>Durable choices</p>
                        </div>
                        <div class="features-icon-item">
                            <div class="features-icon-circle">🌳</div>
                            <h4>Solid Wooden Frame</h4>
                            <p>10 Year Warranty</p>
                        </div>
                        <div class="features-icon-item">
                            <div class="features-icon-circle">🛡️</div>
                            <h4>Easy Maintenance</h4>
                            <p>Washable covers</p>
                        </div>
                        <div class="features-icon-item">
                            <div class="features-icon-circle">🚚</div>
                            <h4>Quick Delivery</h4>
                            <p>Assembly included</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Our Best Selling Collections -->
            <section class="bestsellers-section" id="products">
                <div class="container">
                    <h2 class="section-title">Our Best Selling Collections</h2>
                    <div class="products-grid" id="bestsellersGrid">
                        <!-- Best sellers will be loaded from JSON -->
                    </div>
                    <div class="section-cta" style="margin-top: 50px; text-align: center;">
                        <a href="/products" class="btn btn-secondary">View All Products</a>
                    </div>
                </div>
            </section>

            <!-- Made in UAE Trust Box (3 items) -->
            <section class="uae-trust-bar">
                <div class="container">
                    <div class="uae-trust-box">
                        <div class="uae-trust-item">
                            <div class="uae-trust-icon">🇦🇪</div>
                            <div class="uae-trust-text">
                                <h4>Made in UAE</h4>
                                <p>100% Quality Sofa Factory in Dubai</p>
                            </div>
                        </div>
                        <div class="uae-trust-item">
                            <div class="uae-trust-icon">🛡️</div>
                            <div class="uae-trust-text">
                                <h4>10 Year Frame Warranty</h4>
                                <p>Sturdy frame made of premium wood</p>
                            </div>
                        </div>
                        <div class="uae-trust-item">
                            <div class="uae-trust-icon">🚚</div>
                            <div class="uae-trust-text">
                                <h4>Free UAE Delivery</h4>
                                <p>Professional delivery and setup in Dubai</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- OUR WORKING PROCESS -->
            <section class="process-section">
                <div class="container">
                    <h2 class="section-title">OUR WORKING PROCESS</h2>
                    <p style="text-align: center; color: var(--text-light); max-width: 600px; margin: -30px auto 50px auto; font-size: 14px;">
                        Four simple steps to get your custom sofa in Dubai
                    </p>
                    <div class="process-split">
                        <div class="process-left">
                            <img src="assets/images/service_upholstery.jpg" alt="Our Working Process">
                        </div>
                        <div class="process-right">
                            <h2>Get Your Sofa Fitting Process</h2>
                            <p class="process-sub">Four simple steps to get your custom sofa in Dubai</p>
                            <div class="process-steps-list">
                                <div class="process-step-item">
                                    <div class="process-step-num">1</div>
                                    <div class="process-step-info">
                                        <h4>Free Consultation</h4>
                                        <p>Discussing requirements, sizes, configurations, and checking fabric options.</p>
                                    </div>
                                </div>
                                <div class="process-step-item">
                                    <div class="process-step-num">2</div>
                                    <div class="process-step-info">
                                        <h4>Material Selection</h4>
                                        <p>Choosing from a wide range of premium fabrics and foam density for ultimate comfort.</p>
                                    </div>
                                </div>
                                <div class="process-step-item">
                                    <div class="process-step-num">3</div>
                                    <div class="process-step-info">
                                        <h4>Master Craftsmanship</h4>
                                        <p>Handcrafted to perfection in our local Dubai factory by skilled carpenters and upholsterers.</p>
                                    </div>
                                </div>
                                <div class="process-step-item">
                                    <div class="process-step-num">4</div>
                                    <div class="process-step-info">
                                        <h4>Prompt Delivery</h4>
                                        <p>Delivered, assembled, and perfectly installed at your place with no extra charge.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Consultation & Contact Section -->
            <section class="consultation-section" id="contact">
                <div class="container">
                    <div class="consultation-grid">
                        <div class="consultation-form-card">
                            <h2>Get Your Free Consultation</h2>
                            <p>Fill out the form below, and our sofa specialists will get back to you with custom quotes and options.</p>
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
                                <button type="submit" class="btn btn-primary">Request Free Consultation</button>
                            </form>
                        </div>
                        <div class="consultation-contact-info">
                            <div class="contact-card-item">
                                <div class="contact-card-icon">📍</div>
                                <div class="contact-card-text">
                                    <h4>Our Location</h4>
                                    <p id="address">Dubai, UAE</p>
                                </div>
                            </div>
                            <div class="contact-card-item">
                                <div class="contact-card-icon">📞</div>
                                <div class="contact-card-text">
                                    <h4>Call Us</h4>
                                    <p><a href="#" id="phone">+971 50 000 0000</a></p>
                                </div>
                            </div>
                            <div class="contact-card-item" style="background-color: #25D366;">
                                <div class="contact-card-icon">📱</div>
                                <div class="contact-card-text">
                                    <h4>WhatsApp Us</h4>
                                    <p><a href="#" id="whatsapp" target="_blank">+971 50 000 0000</a></p>
                                </div>
                            </div>
                            <div class="contact-card-item">
                                <div class="contact-card-icon">✉️</div>
                                <div class="contact-card-text">
                                    <h4>Email Us</h4>
                                    <p><a href="#" id="email">info@homesofa.ae</a></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Customer Reviews Section -->
            <section class="reviews-section" id="reviews">
                <div class="container">
                    <h2 class="section-title">What Our Customers Say</h2>
                    <div class="reviews-carousel">
                        <button class="review-arrow prev" onclick="prevReview()">❮</button>
                        <div class="reviews-slider" id="reviewsSlider">
                            <!-- Reviews will be loaded from JSON -->
                        </div>
                        <button class="review-arrow next" onclick="nextReview()">❯</button>
                    </div>
                    <div class="reviews-nav" id="reviewsNav">
                        <!-- Review navigation dots will be added here -->
                    </div>
                </div>
            </section>

            <!-- Serving Areas Tag Cloud -->
            <section class="serving-locations-section">
                <div class="container">
                    <h3>Serving All of Dubai</h3>
                    <div class="locations-cloud">
                        <span class="location-tag">Dubai Marina</span>
                        <span class="location-tag">Palm Jumeirah</span>
                        <span class="location-tag">Downtown Dubai</span>
                        <span class="location-tag">Jumeirah</span>
                        <span class="location-tag">Business Bay</span>
                        <span class="location-tag">Dubai Hills</span>
                        <span class="location-tag">Arabian Ranches</span>
                        <span class="location-tag">Al Barsha</span>
                        <span class="location-tag">Mirdif</span>
                        <span class="location-tag">Dubai Sports City</span>
                        <span class="location-tag">Jumeirah Lake Towers (JLT)</span>
                        <span class="location-tag">Dubai Silicon Oasis</span>
                        <span class="location-tag">Jumeirah Beach Residence (JBR)</span>
                        <span class="location-tag">Discovery Gardens</span>
                    </div>
                </div>
            </section>
        `;

        // Helper for hero thumbnail backgrounds
        window.changeHeroBg = function(imageUrl, element) {
            const slides = document.querySelectorAll('.hero-slide');
            if (slides.length > 0) {
                const activeSlide = document.querySelector('.hero-slide.active') || slides[0];
                activeSlide.style.backgroundImage = `url(${imageUrl})`;
            }
            const thumbs = document.querySelectorAll('.hero-thumbnail-item');
            thumbs.forEach(t => t.classList.remove('active'));
            element.classList.add('active');
        };

        // Helpers for Black Testimonial Slider
        window.goToHighlightSlide = function(index) {
            const slides = document.querySelectorAll('.highlight-slide');
            const bullets = document.querySelectorAll('.highlight-bullet');
            if (slides.length === 0) return;
            
            slides.forEach(s => s.classList.remove('active'));
            bullets.forEach(b => b.classList.remove('active'));
            
            const targetSlide = document.querySelector(`.highlight-slide[data-highlight-index="${index}"]`);
            if (targetSlide) targetSlide.classList.add('active');
            if (bullets[index]) bullets[index].classList.add('active');
        };

        // Auto-scroll for highlight slides
        let activeHighlightIndex = 0;
        if (window.highlightInterval) clearInterval(window.highlightInterval);
        window.highlightInterval = setInterval(() => {
            const slides = document.querySelectorAll('.highlight-slide');
            if (slides.length > 0) {
                activeHighlightIndex = (activeHighlightIndex + 1) % slides.length;
                window.goToHighlightSlide(activeHighlightIndex);
            }
        }, 5000);

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
                                <a href="#" class="btn btn-primary" id="modalWhatsapp" target="_blank">
                                    WhatsApp Us
                                </a>
                                <a href="#" class="btn btn-secondary" id="modalPhone">
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
                            <div class="form-group">
                                <label>Facebook URL</label>
                                <input type="url" name="facebook" id="facebook" placeholder="https://facebook.com/yourpage">
                            </div>
                            <div class="form-group">
                                <label>Instagram URL</label>
                                <input type="url" name="instagram" id="instagram" placeholder="https://instagram.com/yourpage">
                            </div>
                            <div class="form-group">
                                <label>Twitter URL</label>
                                <input type="url" name="twitter" id="twitter" placeholder="https://twitter.com/yourpage">
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

    // Admin helper functions
    saveBusinessInfo() {
        const businessInfo = {
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
            }
        };
        
        // In a real implementation, this would save to a backend
        console.log('Saving business info:', businessInfo);
        alert('Business information saved! (Note: This is a demo - actual saving requires backend implementation)');
    },

    // Admin helper functions
    saveBusinessInfo() {
        const businessInfo = {
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
            }
        };
        
        // In a real implementation, this would save to a backend
        console.log('Saving business info:', businessInfo);
        alert('Business information saved! (Note: This is a demo - actual saving requires backend implementation)');
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