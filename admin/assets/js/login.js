// Admin Login JavaScript
const loginForm = document.getElementById('loginForm');

// Form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password'),
        remember: formData.get('remember') === 'on'
    };
    
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    try {
        // Show loading overlay
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
        }

        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;
        
        // In production, this would call your authentication API
        // For now, using a simple validation
        if (await authenticateUser(loginData)) {
            // Store authentication token
            const token = generateToken(loginData);
            localStorage.setItem('adminToken', token);
            
            if (loginData.remember) {
                localStorage.setItem('rememberAdmin', 'true');
            }
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            showError('Invalid email or password');
        }
        
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        // Hide loading overlay
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }

    } catch (error) {
        console.error('Login error:', error);
        showError('An error occurred. Please try again.');

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Sign In';
        submitBtn.disabled = false;

        // Hide loading overlay
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }
});

// Simple authentication function (replace with real API call)
async function authenticateUser(credentials) {
    // In production, this would call your authentication endpoint
    // For demo purposes, using hardcoded credentials
    const validCredentials = {
        email: 'sofahaven.admin@gmail.com',
        password: 'SofaH@ven#2025'
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return credentials.email === validCredentials.email && 
           credentials.password === validCredentials.password;
}

// Generate simple token (replace with JWT in production)
function generateToken(user) {
    // In production, this would be a proper JWT from your server
    const payload = {
        email: user.email,
        timestamp: Date.now()
    };
    return btoa(JSON.stringify(payload));
}

// Show error message
function showError(message) {
    // Remove existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create and insert error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background-color: #fee;
        color: #dc3545;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 20px;
        border-left: 4px solid #dc3545;
        font-size: 14px;
    `;
    errorDiv.textContent = message;
    
    loginForm.insertBefore(errorDiv, loginForm.firstChild);
}

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        // Validate token (in production, this would verify with your server)
        try {
            const payload = JSON.parse(atob(token));
            const tokenAge = Date.now() - payload.timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (tokenAge < maxAge) {
                // Token is valid, redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Token expired, remove it
                localStorage.removeItem('adminToken');
            }
        } catch (e) {
            // Invalid token, remove it
            localStorage.removeItem('adminToken');
        }
    }
});

// Form input enhancements
const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
inputs.forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', () => {
        if (!input.value) {
            input.parentElement.classList.remove('focused');
        }
    });
});

// Enter key handling
loginForm.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        loginForm.dispatchEvent(new Event('submit'));
    }
});