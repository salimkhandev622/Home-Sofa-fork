// Admin Login JavaScript
const loginForm = document.getElementById('loginForm');

function getAdminDashboardUrl() {
    if (window.location.pathname.includes('/Home-Sofa-fork')) {
        return '/Home-Sofa-fork/admin/dashboard.html';
    }
    return '/admin/dashboard.html';
}

// Form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const emailEl = document.getElementById('email');
    const passEl = document.getElementById('password');
    const rememberEl = document.querySelector('input[name="remember"]');
    
    const loginData = {
        email: (emailEl ? emailEl.value : '').trim().toLowerCase(),
        password: (passEl ? passEl.value : '').trim(),
        remember: rememberEl ? rememberEl.checked : false
    };
    
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;
        
        // Validation
        if (await authenticateUser(loginData)) {
            // Store authentication token
            const token = generateToken(loginData);
            localStorage.setItem('adminToken', token);
            
            if (loginData.remember) {
                localStorage.setItem('rememberAdmin', 'true');
            }
            
            // Redirect to dashboard with absolute path
            window.location.href = getAdminDashboardUrl();
        } else {
            showError('Invalid email or password');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('An error occurred. Please try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Simple authentication function
async function authenticateUser(credentials) {
    const validEmails = [
        'sofahaven.admin@gmail.com',
        'admin@sofahaven.ae',
        'admin@gmail.com',
        'admin'
    ];
    
    const validPasswords = [
        'SofaH@ven#20332',
        'admin123',
        'admin'
    ];
    
    // Simulate short API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return validEmails.includes(credentials.email) && validPasswords.includes(credentials.password);
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
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
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
                window.location.href = getAdminDashboardUrl();
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