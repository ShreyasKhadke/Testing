let currentView = 'signup';
let formData = {
    username: '',
    email: '',
    password: '',
    password_confirm: ''
};
let isLoading = false;

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function resetForm() {
    document.getElementById('username').value = '';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password_confirm').value = '';
    
    const messageDiv = document.getElementById('message');
    const errorSpans = document.querySelectorAll('.error-text');
    
    if (messageDiv) {
        messageDiv.textContent = '';
        messageDiv.style.display = 'none';
    }
    errorSpans.forEach(span => span.textContent = '');
}

function switchView(view) {
    currentView = view;
    resetForm();
    
    // Add transitioning class to form for subtle animation
    const authForm = document.getElementById('auth-form');
    authForm.classList.add('transitioning');
    
    // Update active tab and sliding indicator
    const tabsContainer = document.querySelector('.auth-tabs');
    document.querySelectorAll('.auth-tabs button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(view + '-tab').classList.add('active');
    
    // Update tabs container class for sliding animation
    if (view === 'signin') {
        tabsContainer.classList.add('signin');
    } else {
        tabsContainer.classList.remove('signin');
    }
    
    // Title is now handled by the tabs themselves
    
    // Animate form field transitions
    const emailGroup = document.getElementById('email-group');
    const confirmGroup = document.getElementById('confirm-group');
    const submitBtn = document.getElementById('submit-btn');
    
    if (view === 'signup') {
        // Show email and confirm password fields
        emailGroup.classList.remove('slide-out');
        confirmGroup.classList.remove('slide-out');
        
        setTimeout(() => {
            emailGroup.classList.add('slide-in');
            document.getElementById('email').required = true;
        }, 100);
        
        setTimeout(() => {
            confirmGroup.classList.add('slide-in');
            document.getElementById('password_confirm').required = true;
        }, 200);
        
        // Animate submit button text change
        submitBtn.style.opacity = '0.7';
        setTimeout(() => {
            submitBtn.textContent = 'Sign Up';
            submitBtn.style.opacity = '1';
        }, 200);
        
    } else {
        // Hide email and confirm password fields
        emailGroup.classList.remove('slide-in');
        confirmGroup.classList.remove('slide-in');
        emailGroup.classList.add('slide-out');
        confirmGroup.classList.add('slide-out');
        
        document.getElementById('email').required = false;
        document.getElementById('password_confirm').required = false;
        
        // Animate submit button text change
        submitBtn.style.opacity = '0.7';
        setTimeout(() => {
            submitBtn.textContent = 'Sign In';
            submitBtn.style.opacity = '1';
        }, 200);
    }
    
    // Remove transitioning class after animations complete
    setTimeout(() => {
        authForm.classList.remove('transitioning');
    }, 400);
}

function showMessage(message, isError = false) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = isError ? 'error-message' : 'success-message';
    messageDiv.style.display = 'block';
}

function showErrors(errors) {
    // First clear all error spans
    document.querySelectorAll('.error-text').forEach(span => {
        span.textContent = '';
    });
    
    // Then populate with new errors
    Object.keys(errors).forEach(field => {
        const errorSpan = document.getElementById(field + '-error');
        if (errorSpan && errors[field]) {
            const errorText = Array.isArray(errors[field]) ? errors[field][0] : errors[field];
            errorSpan.textContent = errorText;
        }
    });
}

function showSuccess(message) {
    const appDiv = document.querySelector('.App');
    appDiv.innerHTML = `
        <div class="success-container">
            <h1 class="success-message">${message}</h1>
            <button onclick="location.reload()">
                ${currentView === 'signup' ? 'Sign In' : 'Continue'}
            </button>
        </div>
    `;
}

async function handleSubmit(e) {
    e.preventDefault();
    
    if (isLoading) return;
    
    isLoading = true;
    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = currentView === 'signup' ? 'Signing Up...' : 'Signing In...';
    submitBtn.disabled = true;
    
    // Clear previous messages
    document.getElementById('message').style.display = 'none';
    document.querySelectorAll('.error-text').forEach(span => span.textContent = '');
    
    const formData = new FormData();
    formData.append('username', document.getElementById('username').value);
    formData.append('password', document.getElementById('password').value);
    
    if (currentView === 'signup') {
        formData.append('email', document.getElementById('email').value);
        formData.append('password_confirm', document.getElementById('password_confirm').value);
    }
    
    try {
        const endpoint = currentView === 'signup' ? '/api/auth/signup/' : '/api/auth/signin/';
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess(data.message);
        } else {
            if (typeof data === 'object' && !data.message) {
                showErrors(data);
            } else {
                showMessage(data.message || `${currentView === 'signup' ? 'Registration' : 'Login'} failed. Please try again.`, true);
            }
        }
    } catch (error) {
        showMessage('Connection error. Please make sure the backend is running.', true);
    } finally {
        isLoading = false;
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Set initial view
    currentView = 'signup';
    
    // Add event listeners
    document.getElementById('auth-form').addEventListener('submit', handleSubmit);
    document.getElementById('signup-tab').addEventListener('click', () => switchView('signup'));
    document.getElementById('signin-tab').addEventListener('click', () => switchView('signin'));
    
    // Initialize the view
    switchView('signup');
});