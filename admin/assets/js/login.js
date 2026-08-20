function redirectToDashboard() {
    const isGitHubPages = window.location.pathname.includes('/Home-Sofa-fork');
    const prefix = isGitHubPages ? '/Home-Sofa-fork' : '';
    window.location.href = prefix + '/admin/dashboard.html';
}

// Form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberInput = document.querySelector('input[name="remember"]');
    
    const loginData = {
        email: (emailInput ? emailInput.value : '').trim().toLowerCase(),
        password: (passwordInput ? passwordInput.value : '').trim(),
        remember: rememberInput ? rememberInput.checked : false
    };
    
    console.log('[Login Attempt]', { email: loginData.email });
    
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;
        
        // Validation
        if (await authenticateUser(loginData)) {
            console.log('[Login Success] Credentials verified. Redirecting to dashboard...');
            // Store authentication token
            const token = generateToken(loginData);
            localStorage.setItem('adminToken', token);
            
            if (loginData.remember) {
                localStorage.setItem('rememberAdmin', 'true');
            }
            
            // Redirect to dashboard
            redirectToDashboard();
        } else {
            console.warn('[Login Failed] Invalid email or password provided:', loginData.email);
            showError('Invalid email or password. Please use: sofahaven.admin@gmail.com / SofaH@ven#20332');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('[Login Error]', error);
        showError('An error occurred during login: ' + error.message);
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
                redirectToDashboard();
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