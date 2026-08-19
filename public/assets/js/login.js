// Admin Login JavaScript
function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password'),
        remember: formData.get('remember') === 'on'
    };
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
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
            Router.navigate('/admin/dashboard');
        } else {
            showError('Invalid email or password');
        }
        
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
    } catch (error) {
        console.error('Login error:', error);
        showError('An error occurred. Please try again.');
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Sign In';
        submitBtn.disabled = false;
    }
}

// Simple authentication function (replace with real API call)
async function authenticateUser(credentials) {
    // In production, this would call your authentication endpoint
    // For demo purposes, using hardcoded credentials
    const validCredentials = {
        email: 'admin@homesofa.ae',
        password: 'admin123'
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
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
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
}

// Form input enhancements
const loginInputs = document.querySelectorAll('input[type="email"], input[type="password"]');
loginInputs.forEach(input => {
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
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
}