// Authentication Management
class Auth {
    constructor() {
        this.isAuthenticated = localStorage.getItem('likein_auth') === 'true';
        this.currentUser = JSON.parse(localStorage.getItem('likein_user')) || null;
        this.users = JSON.parse(localStorage.getItem('likein_all_users')) || [];
        
        // Seed initial user if not present
        this.seedInitialUser();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    seedInitialUser() {
        const adminUser = { id: 'krish', email: 'krish@like.in', password: 'krish4405', name: 'Krish', role: 'Admin' };
        if (!this.users.find(u => u.id === adminUser.id)) {
            this.users.push(adminUser);
            localStorage.setItem('likein_all_users', JSON.stringify(this.users));
        }
    }

    init() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const showRegisterLink = document.getElementById('show-register');
        const showLoginLink = document.getElementById('show-login');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const emailOrId = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                this.login(emailOrId, password);
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = document.getElementById('reg-id').value;
                const email = document.getElementById('reg-email').value;
                const password = document.getElementById('reg-password').value;
                this.register(id, email, password);
            });
        }

        if (showRegisterLink) {
            showRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('login-card-inner').classList.add('show-register');
            });
        }

        if (showLoginLink) {
            showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('login-card-inner').classList.remove('show-register');
            });
        }
    }

    register(id, email, password) {
        if (this.users.find(u => u.id === id || u.email === email)) {
            alert('User ID or Email already exists!');
            return;
        }

        const role = (id === 'krish' && password === 'krish4405') ? 'Admin' : 'Customer';
        const newUser = { id, email, password, name: id, role };
        this.users.push(newUser);
        localStorage.setItem('likein_all_users', JSON.stringify(this.users));
        alert('Registration successful! Please login.');
        document.getElementById('login-card-inner').classList.remove('show-register');
    }

    login(emailOrId, password) {
        const user = this.users.find(u => (u.email === emailOrId || u.id === emailOrId) && u.password === password);
        
        if (user) {
            this.isAuthenticated = true;
            this.currentUser = user;
            localStorage.setItem('likein_auth', 'true');
            localStorage.setItem('likein_user', JSON.stringify(user));
            this.updateUI();
            
            if (window.appStore) {
                window.appStore.addHistory('User Login', `Authenticated as ${user.id}`);
                window.appStore.notify();
            }
            // Trigger a refresh or navigation update if needed
            if (window.updateUserUI) window.updateUserUI();
        } else {
            alert('Invalid credentials!');
        }
    }

    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        localStorage.removeItem('likein_auth');
        localStorage.removeItem('likein_user');
        location.reload();
    }

    checkAuth() {
        this.updateUI();
    }

    updateUI() {
        const loginView = document.getElementById('login-view');
        const appContainer = document.querySelector('.app-container');
        
        if (this.isAuthenticated) {
            loginView.classList.add('hidden');
            appContainer.classList.remove('blurred');
        } else {
            loginView.classList.remove('hidden');
            appContainer.classList.add('blurred');
        }
    }
}

// Global instance
window.appAuth = new Auth();
