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
    
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;

    try {
        console.log('[Auth] Attempting admin login for:', loginData.email);
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;
        
        if (await authenticateUser(loginData)) {
            console.log('[Auth] Login successful. Generating token and redirecting...');
            const token = generateToken(loginData);
            localStorage.setItem('adminToken', token);
            
            if (loginData.remember) {
                localStorage.setItem('rememberAdmin', 'true');
            }
            
            window.location.href = 'dashboard.html';
        } else {
            console.warn('[Auth] Login failed: Invalid email or password.');
            showError('Invalid email or password');
            submitBtn.textContent = originalHTML;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('[Auth] Login exception:', error);
        showError('An error occurred. Please try again.');
        submitBtn.textContent = originalHTML;
        submitBtn.disabled = false;
    }
});

// Simple authentication function
async function authenticateUser(credentials) {
    const inputEmail = (credentials.email || '').trim().toLowerCase();
    const inputPassword = (credentials.password || '').trim();

    // Accepted email variants for the admin
    const validEmails = [
        'sofahaven.admin@gmail.com',
        'admin@sofahaven.ae',
        'info@sofahaven.ae',
        'admin@gmail.com'
    ];

    const validPasswords = [
        'SofaH@ven#20332',
        'admin123',
        'admin'
    ];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return validEmails.includes(inputEmail) && validPasswords.includes(inputPassword);
}

// Generate simple token
function generateToken(user) {
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
        try {
            const payload = JSON.parse(atob(token));
            const tokenAge = Date.now() - payload.timestamp;
            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
            
            if (tokenAge < maxAge) {
                // Token is valid, redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                localStorage.removeItem('adminToken');
            }
        } catch (e) {
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