document.addEventListener('DOMContentLoaded', () => {
    // Check Auth State First
    if (window.appAuth) {
        window.appAuth.checkAuth();
    }
    
    initNavigation();
    initGlobalListeners();
    initAccordions();
    initDbStatus();
    initMobileMenu();

    // Sync User Info if logged in
    if (window.appAuth && window.appAuth.isAuthenticated) {
        window.updateUserUI();
    }
});

function initDbStatus() {
    const statusContainer = document.getElementById('db-status');
    const statusDot = statusContainer.querySelector('.status-dot');
    const statusText = statusContainer.querySelector('.status-text');

    const updateStatus = (state) => {
        console.log('Updating DB Status UI:', state.dbConnected);
        if (state.dbConnected) {
            statusContainer.classList.add('connected');
            statusContainer.classList.remove('error');
            statusText.textContent = 'Database Connected';
        } else {
            statusContainer.classList.remove('connected');
            statusContainer.classList.add('error');
            statusText.textContent = 'Disconnected';
        }
    };

    // Initial check (in case store already finished loading as it is async now)
    updateStatus(window.appStore.state);

    // Subscribe to store changes
    window.appStore.subscribe((state) => {
        updateStatus(state);
    });
}

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const dashboardActions = document.getElementById('dashboard-actions');
    const ordersActions = document.getElementById('orders-actions');
    const pageTitle = document.getElementById('page-title');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.dataset.tab;
            
            // Update Active Nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Switch Views
            views.forEach(view => {
                view.classList.add('hidden');
                view.classList.remove('active');
            });
            
            // Reset Configuration Mode if active
            const isConfigActive = !document.getElementById('view-config').classList.contains('hidden');
            if (isConfigActive && tabName !== 'dashboard') {
                if (window.exitConfigMode) window.exitConfigMode();
            }

            // Show Selected View
            if (tabName === 'dashboard') {
                document.getElementById('view-dashboard').classList.remove('hidden');
                document.getElementById('view-dashboard').classList.add('active');
                pageTitle.textContent = 'Dashboard';
                dashboardActions.classList.remove('hidden');
                ordersActions.classList.add('hidden');
                
                // Re-render dashboard if needed
                if (window.renderDashboard) window.renderDashboard();
                
            } else if (tabName === 'orders') {
                const user = window.appAuth.currentUser;
                
                document.getElementById('view-orders').classList.remove('hidden');
                document.getElementById('view-orders').classList.add('active');
                pageTitle.textContent = (user && user.role === 'Admin') ? 'Customer Orders' : 'My Orders';
                dashboardActions.classList.add('hidden');
                ordersActions.classList.remove('hidden');
                
                // Render orders
                if (window.renderOrdersTable) window.renderOrdersTable();
            } else if (tabName === 'users') {
                document.getElementById('view-users').classList.remove('hidden');
                document.getElementById('view-users').classList.add('active');
                pageTitle.textContent = 'User Management';
                dashboardActions.classList.add('hidden');
                ordersActions.classList.add('hidden');
                
            } else if (tabName === 'profile') {
                document.getElementById('view-profile').classList.remove('hidden');
                document.getElementById('view-profile').classList.add('active');
                pageTitle.textContent = 'My Profile';
                dashboardActions.classList.add('hidden');
                ordersActions.classList.add('hidden');
                
                // Update profile info
                window.updateUserUI();
            }
        });
    });
}

window.updateUserUI = () => {
    const user = window.appAuth.currentUser;
    if (!user) return;

    // Update Header Sign Out button or User Display
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.querySelector('span').textContent = `Sign Out (${user.id})`;
    }

    // RBAC: Toggle Orders Nav Item (Visible for all, but titled differently)
    const ordersNavItem = document.querySelector('.nav-item[data-tab="orders"]');
    if (ordersNavItem) {
        ordersNavItem.classList.remove('hidden');
        ordersNavItem.querySelector('span').textContent = (user.role === 'Admin') ? 'Customer Orders' : 'My Orders';
    }

    // RBAC: Hide Add Order buttons for Admin
    const sidebarAddBtn = document.getElementById('sidebar-add-order-btn');
    const dashAddBtn = document.getElementById('dashboard-add-order-btn');
    const sidebarUsersBtn = document.getElementById('sidebar-users-btn');
    
    if (user.role === 'Admin') {
        if (sidebarAddBtn) sidebarAddBtn.classList.add('hidden');
        if (dashAddBtn) dashAddBtn.classList.add('hidden');
        if (sidebarUsersBtn) sidebarUsersBtn.classList.remove('hidden');
    } else {
        if (sidebarAddBtn) sidebarAddBtn.classList.remove('hidden');
        if (dashAddBtn) dashAddBtn.classList.remove('hidden');
        if (sidebarUsersBtn) sidebarUsersBtn.classList.add('hidden');
    }

    // Update Profile View if active
    const nameDisplay = document.getElementById('profile-name-display');
    const emailDisplay = document.getElementById('profile-email-display');
    const idDisplay = document.getElementById('profile-id-display');
    const roleDisplay = document.getElementById('profile-role-display');
    const avatarInitial = document.getElementById('profile-avatar-initial');

    if (nameDisplay) nameDisplay.textContent = user.name || user.id;
    if (emailDisplay) emailDisplay.textContent = user.email;
    if (idDisplay) idDisplay.textContent = `ID: ${user.id}`;
    if (roleDisplay) roleDisplay.textContent = user.role || 'User';
    if (avatarInitial) avatarInitial.textContent = (user.name || user.id).charAt(0).toUpperCase();

    // Render personal transactions
    const transactionContainer = document.getElementById('user-order-history');
};

function initAccordions() {
    const headers = document.querySelectorAll('.accordion-header');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const accordion = header.closest('.accordion');
            // Toggle active state to open/close
            accordion.classList.toggle('active');
        });
    });
}

function initGlobalListeners() {
    // Date Filter listener
    const dateFilter = document.getElementById('date-filter');
    if (dateFilter) {
        dateFilter.addEventListener('change', (e) => {
            window.appStore.setDateFilter(e.target.value);
        });
    }

    // Modal close listeners
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal-overlay').classList.add('hidden');
        });
    });

    // Close modal on outside click
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                e.currentTarget.classList.add('hidden');
            }
        });
    }

    // Share link listener
    const shareBtn = document.getElementById('share-link-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                showToast('Link copied to clipboard!');
            });
        });
    }

    // Logout listener
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (window.appAuth) {
                window.appAuth.logout();
            }
        });
    }
}

function initMobileMenu() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (!mobileToggle || !sidebar) return;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });
}

function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.classList.add('visible');
    
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

// Utility formatting
window.formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

window.formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
};
