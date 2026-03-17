const products = ['Fiber Internet 300 Mbps', '5G Unlimited Mobile Plan', 'Fiber Internet 1 Gbps', 'Business Internet 500 Mbps', 'VoIP Corporate Package'];
const statuses = ['Pending', 'In progress', 'Completed'];
const countries = ['United States', 'Canada', 'Australia', 'Singapore', 'Hong Kong', 'United Kingdom', 'Germany', 'France'];
const representatives = ['Mr. Michael Harris', 'Mr. Ryan Cooper', 'Ms. Olivia Carter', 'Mr. Lucas Martin'];
const names = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Robert Brown', 'Emily Davis', 'Michael Wilson', 'Sarah Moore', 'David Taylor', 'Laura Anderson', 'James Thomas', 'William Jackson', 'Linda White', 'Barbara Harris', 'Elizabeth Martin', 'Richard Thompson'];

const orders = [];
const now = new Date();

for (let i = 1; i <= 60; i++) {
    const qty = Math.floor(Math.random() * 5) + 1;
    const price = Math.floor(Math.random() * 200) + 50;
    const randomDaysAgo = Math.floor(Math.random() * 90);
    const orderDate = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);
    
    const firstName = names[Math.floor(Math.random() * names.length)].split(' ')[0];
    const lastName = names[Math.floor(Math.random() * names.length)].split(' ')[1] || 'Smith';
    
    orders.push({
        id: 'ORD-' + i.toString().padStart(6, '0'),
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

console.log(JSON.stringify(orders, null, 2));
