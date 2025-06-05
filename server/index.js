import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize JSON files if they don't exist
const usersFile = path.join(dataDir, 'users.json');
const ipRangesFile = path.join(dataDir, 'ipRanges.json');
const settingsFile = path.join(dataDir, 'settings.json');

if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(ipRangesFile)) {
  fs.writeFileSync(ipRangesFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(settingsFile)) {
  fs.writeFileSync(
    settingsFile,
    JSON.stringify({ categories: [
      { id: 'server', name: 'Servers', color: '#3B82F6' },
      { id: 'printer', name: 'Printers', color: '#10B981' },
      { id: 'camera', name: 'Cameras', color: '#F59E0B' },
      { id: 'workstation', name: 'Workstations', color: '#8B5CF6' },
      { id: 'other', name: 'Other', color: '#6B7280' }
    ]}, null, 2)
  );
}

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  // Read existing users
  const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  
  // Check if email already exists
  if (users.some(user => user.email === email)) {
    return res.status(400).json({ message: 'Email already registered' });
  }
  
  // Create new user
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password, // In a real app, this should be hashed
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  // Save updated users
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Read users
  const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  
  // Find user
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  res.status(200).json(userWithoutPassword);
});

// IP Ranges routes
app.get('/api/ip-ranges', (req, res) => {
  const ipRanges = JSON.parse(fs.readFileSync(ipRangesFile, 'utf8'));
  res.json(ipRanges);
});

app.post('/api/ip-ranges', (req, res) => {
  const { name, network, subnet, isDhcp } = req.body;
  
  // Read existing IP ranges
  const ipRanges = JSON.parse(fs.readFileSync(ipRangesFile, 'utf8'));
  
  // Create new IP range
  const newIpRange = {
    id: Date.now().toString(),
    name,
    network,
    subnet,
    isDhcp: Boolean(isDhcp),
    createdAt: new Date().toISOString(),
    addresses: []
  };
  
  ipRanges.push(newIpRange);
  
  // Save updated IP ranges
  fs.writeFileSync(ipRangesFile, JSON.stringify(ipRanges, null, 2));
  
  res.status(201).json(newIpRange);
});

app.post('/api/ip-ranges/:rangeId/addresses', (req, res) => {
  const { rangeId } = req.params;
  const { ip, status, category, notes } = req.body;
  
  // Read existing IP ranges
  const ipRanges = JSON.parse(fs.readFileSync(ipRangesFile, 'utf8'));
  
  // Find the range
  const rangeIndex = ipRanges.findIndex(range => range.id === rangeId);
  
  if (rangeIndex === -1) {
    return res.status(404).json({ message: 'IP range not found' });
  }
  
  // Add new address
  const newAddress = {
    ip,
    status: status || 'available',
    category: category || 'other',
    notes: notes || '',
    updatedAt: new Date().toISOString()
  };
  
  ipRanges[rangeIndex].addresses.push(newAddress);
  
  // Save updated IP ranges
  fs.writeFileSync(ipRangesFile, JSON.stringify(ipRanges, null, 2));
  
  res.status(201).json(newAddress);
});

app.put('/api/ip-ranges/:rangeId/addresses/:ip', (req, res) => {
  const { rangeId, ip } = req.params;
  const { status, category, notes } = req.body;
  
  // Read existing IP ranges
  const ipRanges = JSON.parse(fs.readFileSync(ipRangesFile, 'utf8'));
  
  // Find the range
  const rangeIndex = ipRanges.findIndex(range => range.id === rangeId);
  
  if (rangeIndex === -1) {
    return res.status(404).json({ message: 'IP range not found' });
  }
  
  // Find the address
  const addressIndex = ipRanges[rangeIndex].addresses.findIndex(addr => addr.ip === ip);
  
  if (addressIndex === -1) {
    return res.status(404).json({ message: 'IP address not found' });
  }
  
  // Update the address
  ipRanges[rangeIndex].addresses[addressIndex] = {
    ...ipRanges[rangeIndex].addresses[addressIndex],
    status: status || ipRanges[rangeIndex].addresses[addressIndex].status,
    category: category || ipRanges[rangeIndex].addresses[addressIndex].category,
    notes: notes !== undefined ? notes : ipRanges[rangeIndex].addresses[addressIndex].notes,
    updatedAt: new Date().toISOString()
  };
  
  // Save updated IP ranges
  fs.writeFileSync(ipRangesFile, JSON.stringify(ipRanges, null, 2));
  
  res.json(ipRanges[rangeIndex].addresses[addressIndex]);
});

// Categories routes
app.get('/api/categories', (req, res) => {
  const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  res.json(settings.categories || []);
});

app.post('/api/categories', (req, res) => {
  const { name, color } = req.body;
  
  // Read settings
  const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  
  // Create new category
  const newCategory = {
    id: Date.now().toString(),
    name,
    color
  };
  
  if (!settings.categories) {
    settings.categories = [];
  }
  
  settings.categories.push(newCategory);
  
  // Save updated settings
  fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
  
  res.status(201).json(newCategory);
});

// Export data
app.get('/api/export/json', (req, res) => {
  const ipRanges = JSON.parse(fs.readFileSync(ipRangesFile, 'utf8'));
  res.json(ipRanges);
});

app.get('/api/export/csv', (req, res) => {
  const ipRanges = JSON.parse(fs.readFileSync(ipRangesFile, 'utf8'));
  
  // Create CSV header
  let csv = 'Range Name,Network,IP Address,Status,Category,Notes\n';
  
  // Add rows
  ipRanges.forEach(range => {
    range.addresses.forEach(address => {
      csv += `"${range.name}","${range.network}/${range.subnet}","${address.ip}","${address.status}","${address.category}","${address.notes}"\n`;
    });
  });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=ip-ranges.csv');
  res.send(csv);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});