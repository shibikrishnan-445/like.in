// Application State Management
class Store {
  constructor() {
    this.state = {
      orders: [],
      dashboardConfig: [], // Array of configured widgets
      dateFilter: 'all', // all, today, 7days, 30days, 90days
      history: [], // Array of history logs
      dbConnected: false
    };

    this.listeners = [];
    // Load from localStorage if present
    this.loadState();
  }

  async loadState() {
    try {
      const savedOrders = localStorage.getItem('likein_orders');
      const dbInitialized = localStorage.getItem('likein_db_init');

      if (dbInitialized && savedOrders) {
        this.state.orders = JSON.parse(savedOrders);
        this.state.dbConnected = true;
      } else {
        // CHALLENGE II Requirement: By default, no data exists in the Customer Order table.
        this.state.orders = [];
        this.state.dbConnected = false;
        localStorage.setItem('likein_db_init', 'true');
        this.saveState();
      }

      const savedConfig = localStorage.getItem('likein_dashboard');
      if (savedConfig) {
        this.state.dashboardConfig = JSON.parse(savedConfig);
      }

      const savedHistory = localStorage.getItem('likein_history');
      if (savedHistory) {
        this.state.history = JSON.parse(savedHistory);
      }
      
      console.log('State loaded successfully. DB Connected:', this.state.dbConnected);
      this.notify();
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
      this.state.dbConnected = false;
      this.notify();
    }
  }

  saveState() {
    localStorage.setItem('likein_orders', JSON.stringify(this.state.orders));
    localStorage.setItem('likein_dashboard', JSON.stringify(this.state.dashboardConfig));
    localStorage.setItem('likein_history', JSON.stringify(this.state.history));
    console.log('State saved. Notifying listeners...');
    this.notify();
  }

  // Orders
  getOrders(userId = null) {
    // Ensure they are sorted by date descending for the UI
    let filteredOrders = [...this.state.orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    // Role-based filtering: strict match by ownerId
    if (userId && userId !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.ownerId === userId);
    } else if (userId === null) {
      // If no userId is provided (and it's not 'all' for Admin), return nothing
      // This prevents anonymous or misconfigured requests from seeing any data
      return [];
    }

    // Apply date filter logic
    if (this.state.dateFilter === 'all') return filteredOrders;

    const now = new Date();
    let filterDate = new Date();

    switch (this.state.dateFilter) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        filterDate.setDate(now.getDate() - 90);
        break;
    }

    return filteredOrders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= filterDate;
    });
  }

  addOrder(order) {
    // Generate simple ID
    order.id = 'ORD-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    // Set created date (now) if not provided
    if (!order.orderDate) {
      order.orderDate = new Date().toISOString();
    }
    
    // Convert numbers
    order.quantity = Number(order.quantity);
    order.unitPrice = Number(order.unitPrice);
    order.totalAmount = order.quantity * order.unitPrice;

    this.state.orders.unshift(order);
    this.addHistory('Order Created', `Order ${order.id} for ${order.customerName}`);
    this.saveState();
  }

  updateOrder(id, updatedData) {
    const index = this.state.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      this.state.orders[index] = { 
        ...this.state.orders[index], 
        ...updatedData,
        quantity: Number(updatedData.quantity),
        unitPrice: Number(updatedData.unitPrice),
        totalAmount: Number(updatedData.quantity) * Number(updatedData.unitPrice)
      };
      const order = this.state.orders[index];
      this.addHistory('Order Updated', `Order ${id} for ${order.customerName} updated`);
      this.saveState();
    }
  }

  payOrder(id) {
    const index = this.state.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      const order = this.state.orders[index];
      order.status = 'Completed';
      this.addHistory('Order Paid', `Payment received for ${order.customerName} (Order ${id})`);
      this.saveState();
    }
  }

  deleteOrder(id) {
    const order = this.state.orders.find(o => o.id === id);
    const customer = order ? order.customerName : 'Unknown';
    this.state.orders = this.state.orders.filter(o => o.id !== id);
    this.addHistory('Order Deleted', `Order ${id} for ${customer} was removed`);
    this.saveState();
  }

  // Dashboard Config
  getDashboardConfig() {
    return this.state.dashboardConfig;
  }

  setDashboardConfig(config) {
    this.state.dashboardConfig = config;
    this.saveState();
  }

  // Filtering
  setDateFilter(filterType) {
    this.state.dateFilter = filterType;
    this.notify(); // Re-render dashboard
  }

  // Dummy Data Generation
  generateDummyData(count) {
    const products = ['Fiber Internet 300 Mbps', '5GUnlimited Mobile Plan', 'Fiber Internet 1 Gbps', 'Business Internet 500 Mbps', 'VoIP Corporate Package'];
    const statuses = ['Pending', 'In progress', 'Completed'];
    const countries = ['United States', 'Canada', 'Australia', 'Singapore', 'Hong Kong', 'United Kingdom', 'Germany', 'France'];
    const representatives = ['Mr. Michael Harris', 'Mr. Ryan Cooper', 'Ms. Olivia Carter', 'Mr. Lucas Martin'];
    
    const names = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Robert Brown', 'Emily Davis', 'Michael Wilson', 'Sarah Moore', 'David Taylor', 'Laura Anderson', 'James Thomas'];
    
    const orders = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
        const qty = Math.floor(Math.random() * 5) + 1;
        const price = Math.floor(Math.random() * 200) + 50;
        
        // Random date within the last 90 days
        const randomDaysAgo = Math.floor(Math.random() * 90);
        const orderDate = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);
        
        const firstName = names[Math.floor(Math.random() * names.length)].split(' ')[0];
        const lastName = names[Math.floor(Math.random() * names.length)].split(' ')[1] || 'Smith';
        
        orders.push({
            id: 'ORD-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
            firstName: firstName,
            lastName: lastName,
            customerName: `${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
            phone: '555-01' + Math.floor(Math.random() * 100).toString().padStart(2, '0'),
            address: `${Math.floor(Math.random() * 9999)} Main St`,
            city: 'Metropolis',
            state: 'NY',
            zip: '10001',
            country: countries[Math.floor(Math.random() * countries.length)],
            product: products[Math.floor(Math.random() * products.length)],
            quantity: qty,
            unitPrice: price,
            totalAmount: qty * price,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            createdBy: `${representatives[Math.floor(Math.random() * representatives.length)]} (for ${firstName} ${lastName})`,
            orderDate: orderDate.toISOString(),
            ownerId: 'system'
        });
    }
    
    // Sort by date descending
    return orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  }

  // History Management
  addHistory(action, details) {
    const historyItem = {
      id: 'HIST-' + Date.now(),
      timestamp: new Date().toISOString(),
      action: action,
      details: details
    };
    
    this.state.history.unshift(historyItem);
    
    // Keep only last 20 items
    if (this.state.history.length > 20) {
      this.state.history = this.state.history.slice(0, 20);
    }
  }

  getHistory() {
    return this.state.history;
  }

  // Pub/Sub
  subscribe(listener) {
    this.listeners.push(listener);
    // return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    if (!this.listeners) return;
    this.listeners.forEach(listener => listener(this.state));
  }
}

// Global instance
window.appStore = new Store();

// Helper to reset app from console
window.resetApp = () => {
  localStorage.clear();
  location.reload();
};
