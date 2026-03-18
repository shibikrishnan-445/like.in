document.addEventListener('DOMContentLoaded', () => {
    initOrdersLogic();
});

function initOrdersLogic() {
    const createBtn = document.getElementById('create-order-btn');
    const dashCreateBtn = document.getElementById('dashboard-add-order-btn');
    const sidebarCreateBtn = document.getElementById('sidebar-add-order-btn');
    const modal = document.getElementById('order-modal');
    const form = document.getElementById('order-form');
    const submitBtn = document.getElementById('submit-order-btn');
    
    // Auto calculate Total Amount
    const qtyInput = document.getElementById('quantity');
    const priceInput = document.getElementById('unit-price');
    const totalInput = document.getElementById('total-amount');

    const updateTotal = () => {
        const q = parseFloat(qtyInput.value) || 0;
        const p = parseFloat(priceInput.value) || 0;
        totalInput.value = window.formatCurrency(q * p);
    };

    if (qtyInput) qtyInput.addEventListener('input', updateTotal);
    if (priceInput) priceInput.addEventListener('input', updateTotal);

    // Function to open create modal
    const openCreateModal = () => {
        document.getElementById('order-modal-title').textContent = 'Create Order';
        form.reset();
        document.getElementById('order-id').value = '';
        totalInput.value = window.formatCurrency(0);
        modal.classList.remove('hidden');
    };

    if (createBtn) createBtn.addEventListener('click', openCreateModal);
    if (dashCreateBtn) dashCreateBtn.addEventListener('click', openCreateModal);
    if (sidebarCreateBtn) sidebarCreateBtn.addEventListener('click', openCreateModal);

    submitBtn.addEventListener('click', () => {
        if (form.reportValidity()) {
            const formData = {
                firstName: document.getElementById('first-name').value,
                lastName: document.getElementById('last-name').value,
                customerName: `${document.getElementById('first-name').value} ${document.getElementById('last-name').value}`,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                zip: document.getElementById('zip').value,
                country: document.getElementById('country').value,
                product: document.getElementById('product').value,
                quantity: document.getElementById('quantity').value,
                unitPrice: document.getElementById('unit-price').value,
                status: document.getElementById('status').value,
                createdBy: `${document.getElementById('created-by').value} (for ${document.getElementById('first-name').value} ${document.getElementById('last-name').value})`,
                ownerId: window.appAuth.currentUser ? window.appAuth.currentUser.id : 'anonymous'
            };

            const id = document.getElementById('order-id').value;
            
            if (id) {
                window.appStore.updateOrder(id, formData);
                modal.classList.add('hidden');
                renderOrdersTable();
            } else {
                // If new order, add it and then open payment modal
                window.appStore.addOrder(formData);
                const lastOrder = window.appStore.getOrders()[0]; // Get the one we just added
                modal.classList.add('hidden');
                renderOrdersTable();
                
                // Switch to payment
                setTimeout(() => {
                    openPaymentModal(lastOrder.id);
                }, 300);
            }
        }
    });

    // Subscribe to store changes to re-render if we are on the orders view
    window.appStore.subscribe(() => {
        if (document.getElementById('view-orders').classList.contains('active')) {
            renderOrdersTable();
        }
    });

    initPaymentLogic();
}

function initPaymentLogic() {
    const paymentModal = document.getElementById('payment-modal');
    const confirmBtn = document.getElementById('confirm-payment-btn');
    const tabs = document.querySelectorAll('.payment-tab');
    const methodCard = document.getElementById('method-card');
    const methodQr = document.getElementById('method-qr');
    const providerName = document.getElementById('payment-provider-name');
    
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const method = tab.dataset.method;
            if (method === 'card') {
                methodCard.classList.remove('hidden');
                methodQr.classList.add('hidden');
            } else {
                methodCard.classList.add('hidden');
                methodQr.classList.remove('hidden');
                providerName.textContent = method === 'phonepe' ? 'PhonePe' : 'any UPI App';
            }
        });
    });

    confirmBtn.addEventListener('click', () => {
        const orderId = document.getElementById('payment-order-id').value;
        const activeTab = document.querySelector('.payment-tab.active').dataset.method;
        
        // If card, check validity
        if (activeTab === 'card') {
            const cardForm = document.getElementById('payment-form');
            if (!cardForm.checkValidity()) {
                cardForm.reportValidity();
                return;
            }
        }

        simulatePayment(orderId);
    });

    // Close on overlay click or close button
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            paymentModal.classList.add('hidden');
            // Reset overlays
            document.getElementById('payment-processing-overlay').classList.add('hidden');
            document.getElementById('payment-success-overlay').classList.add('hidden');
        });
    });
}

function simulatePayment(orderId) {
    const processingOverlay = document.getElementById('payment-processing-overlay');
    const successOverlay = document.getElementById('payment-success-overlay');
    const steps = [
        document.getElementById('step-1'),
        document.getElementById('step-2'),
        document.getElementById('step-3')
    ];

    processingOverlay.classList.remove('hidden');
    
    // Reset steps
    steps.forEach(s => {
        s.classList.remove('active', 'complete');
    });

    // Sequence simulation
    setTimeout(() => {
        steps[0].classList.add('active');
        setTimeout(() => {
            steps[0].classList.remove('active');
            steps[0].classList.add('complete');
            steps[1].classList.add('active');
            
            setTimeout(() => {
                steps[1].classList.remove('active');
                steps[1].classList.add('complete');
                steps[2].classList.add('active');
                
                setTimeout(() => {
                    steps[2].classList.remove('active');
                    steps[2].classList.add('complete');
                    
                    // Finalize
                    window.appStore.payOrder(orderId);
                    processingOverlay.classList.add('hidden');
                    successOverlay.classList.remove('hidden');
                    renderOrdersTable();
                }, 1000);
            }, 1200);
        }, 800);
    }, 500);
}

window.currentOrdersPage = 1;
window.ordersPerPage = 20;

window.renderOrdersTable = () => {
    const tableBody = document.getElementById('orders-table-body');
    const emptyState = document.getElementById('orders-empty-state');
    
    const currentUser = window.appAuth.currentUser;
    const isAdmin = currentUser && currentUser.role === 'Admin';
    
    // Admin sees all, Customer sees only personal orders
    const allOrders = isAdmin ? window.appStore.getOrders('all') : window.appStore.getOrders(currentUser.id);

    if (allOrders.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'flex';
        document.querySelector('.premium-table').style.display = 'none';
        const paginationControls = document.getElementById('orders-pagination');
        if (paginationControls) paginationControls.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    document.querySelector('.premium-table').style.display = 'table';
    
    // Pagination logic
    const totalPages = Math.ceil(allOrders.length / window.ordersPerPage);
    if (window.currentOrdersPage > totalPages) window.currentOrdersPage = totalPages;
    if (window.currentOrdersPage < 1) window.currentOrdersPage = 1;

    const startIndex = (window.currentOrdersPage - 1) * window.ordersPerPage;
    const orders = allOrders.slice(startIndex, startIndex + window.ordersPerPage);
    
    tableBody.innerHTML = orders.map(order => {
        let statusClass = 'status-pending';
        if (order.status === 'In progress') statusClass = 'status-progress';
        if (order.status === 'Completed') statusClass = 'status-completed';

        const currentUser = window.appAuth.currentUser;
        const isAdmin = currentUser && currentUser.role === 'Admin';
        // Ownership check: matches ID or matches name (fallback for seeded data)
        const isOwner = currentUser && (order.ownerId === currentUser.id || order.customerName.toLowerCase().includes(currentUser.id.toLowerCase()));
        const canAction = isAdmin || isOwner;

        return `
            <tr style="${!canAction ? 'opacity: 0.7;' : ''}">
                <td>
                    <div class="font-medium">${order.customerName}</div>
                    <div class="text-xs text-muted" style="color:var(--text-muted); font-size:0.8rem;">${order.email}</div>
                </td>
                <td>${order.product}</td>
                <td>${window.formatDate(order.orderDate)}</td>
                <td class="font-medium">${window.formatCurrency(order.totalAmount)}</td>
                <td><span class="status-badge ${statusClass}">${order.status}</span></td>
                <td>
                    <div class="action-links">
                        ${canAction && order.status === 'Pending' ? `<button class="action-btn pay-btn" style="color:var(--brand-success)" data-id="${order.id}">Pay</button>` : ''}
                        ${canAction ? `
                            <button class="action-btn edit-btn" data-id="${order.id}">Edit</button>
                            <button class="action-btn delete delete-btn" data-id="${order.id}">Delete</button>
                        ` : '<span class="text-muted" style="font-size:0.75rem;">View Only</span>'}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Attach event listeners for Edit/Delete
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => editOrder(e.target.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm('Are you sure you want to delete this order?')) {
                window.appStore.deleteOrder(e.target.dataset.id);
                renderOrdersTable();
            }
        });
    });

    document.querySelectorAll('.pay-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            openPaymentModal(e.target.dataset.id);
        });
    });

    renderOrdersPagination(totalPages);
};

function renderOrdersPagination(totalPages) {
    let paginationContainer = document.getElementById('orders-pagination');
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'orders-pagination';
        paginationContainer.className = 'pagination-controls';
        paginationContainer.style.display = 'flex';
        paginationContainer.style.justifyContent = 'center';
        paginationContainer.style.alignItems = 'center';
        paginationContainer.style.gap = '15px';
        paginationContainer.style.marginTop = '20px';
        paginationContainer.style.padding = '10px';
        const tableContainer = document.querySelector('.table-container');
        tableContainer.appendChild(paginationContainer);
    }
    
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'flex';
    
    let html = `<button class="btn btn-secondary" onclick="window.changeOrdersPage(${window.currentOrdersPage - 1})" ${window.currentOrdersPage === 1 ? 'disabled' : ''}>Previous</button>`;
    html += `<span style="font-size:0.9rem; color:var(--text-muted);">Page ${window.currentOrdersPage} of ${totalPages}</span>`;
    html += `<button class="btn btn-secondary" onclick="window.changeOrdersPage(${window.currentOrdersPage + 1})" ${window.currentOrdersPage === totalPages ? 'disabled' : ''}>Next</button>`;
    
    paginationContainer.innerHTML = html;
}

window.changeOrdersPage = (page) => {
    window.currentOrdersPage = page;
    window.renderOrdersTable();
};

function openPaymentModal(id) {
    const order = window.appStore.getOrders().find(o => o.id === id);
    if (!order) return;

    document.getElementById('payment-order-id').value = order.id;
    const summaryContainer = document.getElementById('payment-order-summary');
    
    summaryContainer.innerHTML = `
        <div class="payment-row">
            <span>Customer:</span>
            <span>${order.customerName}</span>
        </div>
        <div class="payment-row">
            <span>Product:</span>
            <span>${order.product}</span>
        </div>
        <div class="payment-row">
            <span>Quantity:</span>
            <span>${order.quantity}</span>
        </div>
        <div class="payment-row payment-total">
            <span>Total to Pay:</span>
            <span>${window.formatCurrency(order.totalAmount)}</span>
        </div>
    `;

    document.getElementById('payment-modal').classList.remove('hidden');
}

function editOrder(id) {
    const order = window.appStore.getOrders().find(o => o.id === id);
    if (!order) return;

    document.getElementById('order-modal-title').textContent = 'Edit Order';
    document.getElementById('order-id').value = order.id;
    
    // Fill fields
    document.getElementById('first-name').value = order.firstName || '';
    document.getElementById('last-name').value = order.lastName || '';
    document.getElementById('email').value = order.email;
    document.getElementById('phone').value = order.phone;
    document.getElementById('address').value = order.address;
    document.getElementById('city').value = order.city;
    document.getElementById('state').value = order.state;
    document.getElementById('zip').value = order.zip;
    document.getElementById('country').value = order.country;
    document.getElementById('product').value = order.product;
    document.getElementById('quantity').value = order.quantity;
    document.getElementById('unit-price').value = order.unitPrice;
    document.getElementById('total-amount').value = window.formatCurrency(order.totalAmount);
    document.getElementById('status').value = order.status;
    document.getElementById('created-by').value = order.createdBy;

    document.getElementById('order-modal').classList.remove('hidden');
}
