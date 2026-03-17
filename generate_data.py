import json
import random
from datetime import datetime, timedelta

products = ['Fiber Internet 300 Mbps', '5G Unlimited Mobile Plan', 'Fiber Internet 1 Gbps', 'Business Internet 500 Mbps', 'VoIP Corporate Package']
statuses = ['Pending', 'In progress', 'Completed']
countries = ['United States', 'Canada', 'Australia', 'Singapore', 'Hong Kong', 'United Kingdom', 'Germany', 'France']
representatives = ['Mr. Michael Harris', 'Mr. Ryan Cooper', 'Ms. Olivia Carter', 'Mr. Lucas Martin']
names = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Robert Brown', 'Emily Davis', 'Michael Wilson', 'Sarah Moore', 'David Taylor', 'Laura Anderson', 'James Thomas', 'William Jackson', 'Linda White', 'Barbara Harris', 'Elizabeth Martin', 'Richard Thompson']

orders = []
now = datetime.now()

for i in range(1, 61):
    qty = random.randint(1, 5)
    price = random.randint(50, 250)
    random_days_ago = random.randint(0, 90)
    order_date = now - timedelta(days=random_days_ago)
    
    full_name = random.choice(names)
    first_name = full_name.split(' ')[0]
    last_name = full_name.split(' ')[1] if ' ' in full_name else 'Smith'
    
    order = {
        "id": f"ORD-{i:06d}",
        "firstName": first_name,
        "lastName": last_name,
        "customerName": f"{first_name} {last_name}",
        "email": f"{first_name.lower()}.{last_name.lower()}@example.com",
        "phone": f"555-01{random.randint(0, 99):02d}",
        "address": f"{random.randint(1, 9999)} Main St",
        "city": "Metropolis",
        "state": "NY",
        "zip": "10001",
        "country": random.choice(countries),
        "product": random.choice(products),
        "quantity": qty,
        "unitPrice": price,
        "totalAmount": qty * price,
        "status": random.choice(statuses),
        "createdBy": f"{random.choice(representatives)} (for {first_name} {last_name})",
        "orderDate": order_date.isoformat() + "Z"
    }
    orders.append(order)

print(json.dumps(orders, indent=2))
