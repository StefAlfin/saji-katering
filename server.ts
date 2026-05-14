import express from 'express';
import { createServer as createViteServer } from 'vite';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || 'saji-katering-secret-key-123';

const uploadsDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

async function setupDatabase(): Promise<Database> {
  const dbPath = process.env.VERCEL ? '/tmp/database.sqlite' : './database.sqlite';
  
  if (process.env.VERCEL && !fs.existsSync('/tmp/database.sqlite')) {
    const sourceDbPath = path.join(process.cwd(), 'database.sqlite');
    if (fs.existsSync(sourceDbPath)) {
      fs.copyFileSync(sourceDbPath, '/tmp/database.sqlite');
    }
  }

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'user'
    );
    
    CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      image_url TEXT,
      category TEXT
    );
    
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      menu_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (menu_id) REFERENCES menus(id)
    );
    
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total_price INTEGER NOT NULL,
      status TEXT DEFAULT 'Menunggu',
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      menu_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (menu_id) REFERENCES menus(id)
    );
    
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      rating INTEGER NOT NULL,
      content TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // add username to existing users table if needed
  try {
    await db.exec('ALTER TABLE users ADD COLUMN username TEXT');
    await db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    await db.run("UPDATE users SET username = 'admin' WHERE email = 'admin@gmail.com'");
  } catch (e) {
    // Column might already exist, so just ensure index exists
    await db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)');
  }

  // add address to existing orders table if needed
  try {
    await db.exec('ALTER TABLE orders ADD COLUMN address TEXT');
  } catch (e) {
    // Column might already exist
  }

  // add phone to existing users table if needed
  try {
    await db.exec('ALTER TABLE users ADD COLUMN phone TEXT');
  } catch (e) {
    // Column might already exist
  }

  // add rating and comment to existing orders table if needed
  try {
    await db.exec('ALTER TABLE orders ADD COLUMN rating INTEGER');
  } catch (e) {
    // Column might already exist
  }
  try {
    await db.exec('ALTER TABLE orders ADD COLUMN comment TEXT');
  } catch (e) {
    // Column might already exist
  }

  // add event_date to existing orders table if needed
  try {
    await db.exec('ALTER TABLE orders ADD COLUMN event_date DATETIME');
  } catch (e) {
    // Column might already exist
  }

  // Add reviews and wishlists tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      menu_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (menu_id) REFERENCES menus(id)
    );

    CREATE TABLE IF NOT EXISTS wishlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      menu_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (menu_id) REFERENCES menus(id),
      UNIQUE(user_id, menu_id)
    );
  `);

  // Seed menus if empty
  const menuCount = await db.get('SELECT COUNT(*) as count FROM menus');
  if (menuCount.count === 0) {
    await db.exec(`
      INSERT INTO menus (name, description, price, image_url, category) VALUES
      ('Nasi Kotak Ayam Bakar', 'Nasi putih, ayam bakar saus madu, lalapan, sambal terasi, tahu tempe.', 25000, 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=500&q=80', 'Nasi Kotak'),
      ('Tumpeng Mini', 'Nasi kuning tumpeng lengkap dengan orek tempe, telur balado, dan perkedel.', 35000, 'https://images.unsplash.com/photo-1555507036-ab1e4006a8a0?w=500&q=80', 'Tradisional'),
      ('Snack Box Manis & Gurih', 'Isi 3 macam (lemper ayam, pastel, bolu kukus) beserta air mineral.', 15000, 'https://images.unsplash.com/photo-1576014131792-5e9c0c8cb08d?w=500&q=80', 'Snack'),
      ('Prasmanan Paket Gold', 'Pilihan ayam, daging rendang, sayur sop, kerupuk, buah segar, dan es buah.', 75000, 'https://images.unsplash.com/photo-1555243896-c709bfa0b564?w=500&q=80', 'Prasmanan')
    `);
  }

  // Seed admin user if empty
  const adminExists = await db.get('SELECT id FROM users WHERE email = ?', ['admin@gmail.com']);
  if (!adminExists) {
    const hashedPw = await bcrypt.hash('admin123', 10);
    await db.run('INSERT INTO users (name, username, email, password, role) VALUES (?, ?, ?, ?, ?)', ['Admin Saji', 'admin', 'admin@gmail.com', hashedPw, 'admin']);
  }

  return db;
}

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token missing' });
  
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());
  app.use('/uploads', express.static(uploadsDir));
  
  const db = await setupDatabase();

  // ----- API ROUTES -----

  // Auth
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, username, email, password, phone } = req.body;
      const hashedPw = await bcrypt.hash(password, 10);
      const result = await db.run('INSERT INTO users (name, username, email, password, phone) VALUES (?, ?, ?, ?, ?)', [name, username, email, hashedPw, phone]);
      res.json({ id: result.lastID, name, username, email, phone });
    } catch (e: any) {
      if (e.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Username atau Email sudah ada' });
      } else {
        res.status(500).json({ error: e.message });
      }
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, username: user.username, email: user.email, role: user.role } });
  });

  // Current User
  app.get('/api/auth/me', authenticateToken, (req: any, res: any) => {
    res.json(req.user);
  });

  // Menus
  app.get('/api/menus', async (req, res) => {
    const menus = await db.all(`
      SELECT m.*, 
             COALESCE((SELECT AVG(rating) FROM reviews WHERE menu_id = m.id), 0) as avg_rating,
             (SELECT COUNT(*) FROM reviews WHERE menu_id = m.id) as review_count
      FROM menus m
    `);
    res.json(menus);
  });
  
  app.post('/api/menus', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
    console.log('POST /api/menus - body:', req.body, 'file:', req.file);
    try {
      const { name, description, price, category } = req.body;
      const image_url = req.file ? '/uploads/' + req.file.filename : req.body.image_url || '';
      const result = await db.run(
        'INSERT INTO menus (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)',
        [name, description, Number(price) || 0, image_url, category]
      );
      res.json({ id: result.lastID });
    } catch (err: any) {
      console.error('POST /api/menus error:', err);
      res.status(500).json({ error: err.message });
    }
  });
  
  app.delete('/api/menus/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
      await db.run('DELETE FROM menus WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err: any) {
      console.error('DELETE /api/menus error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/menus/:id', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
    console.log('PUT /api/menus/:id - body:', req.body, 'file:', req.file);
    try {
      const { name, description, price, category, image_url } = req.body;
      let query = 'UPDATE menus SET name = ?, description = ?, price = ?, category = ?';
      let params: any[] = [name, description, Number(price) || 0, category];
      
      if (req.file) {
        query += ', image_url = ?';
        params.push('/uploads/' + req.file.filename);
      } else if (image_url !== undefined) {
        query += ', image_url = ?';
        params.push(image_url);
      }
      
      query += ' WHERE id = ?';
      params.push(req.params.id);
      
      await db.run(query, params);
      res.json({ success: true });
    } catch (err: any) {
      console.error('PUT /api/menus error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Cart
  app.get('/api/cart', authenticateToken, async (req: any, res: any) => {
    const cart = await db.all(`
      SELECT c.id, c.quantity, m.id as menu_id, m.name, m.price, m.image_url 
      FROM cart c
      JOIN menus m ON c.menu_id = m.id
      WHERE c.user_id = ?
    `, [req.user.id]);
    res.json(cart);
  });

  app.post('/api/cart', authenticateToken, async (req: any, res: any) => {
    const { menu_id } = req.body;
    const user_id = req.user.id;
    
    // Check if exists
    const existing = await db.get('SELECT * FROM cart WHERE user_id = ? AND menu_id = ?', [user_id, menu_id]);
    if (existing) {
      await db.run('UPDATE cart SET quantity = quantity + 1 WHERE id = ?', [existing.id]);
    } else {
      await db.run('INSERT INTO cart (user_id, menu_id, quantity) VALUES (?, ?, ?)', [user_id, menu_id, 1]);
    }
    res.json({ success: true });
  });

  app.put('/api/cart/:id', authenticateToken, async (req: any, res: any) => {
    const { quantity } = req.body;
    await db.run('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, req.user.id]);
    res.json({ success: true });
  });

  app.delete('/api/cart/:id', authenticateToken, async (req: any, res: any) => {
    await db.run('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  });

  app.delete('/api/cart', authenticateToken, async (req: any, res: any) => {
    await db.run('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    res.json({ success: true });
  });

  // Orders
  app.post('/api/orders', authenticateToken, async (req: any, res: any) => {
    const user_id = req.user.id;
    const { address, event_date } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    if (!event_date) {
      return res.status(400).json({ error: 'Event date is required' });
    }
    
    // Get cart items
    const cartItems = await db.all('SELECT c.*, m.price FROM cart c JOIN menus m ON c.menu_id = m.id WHERE c.user_id = ?', [user_id]);
    if (cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });
    
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const orderResult = await db.run('INSERT INTO orders (user_id, total_price, address, event_date) VALUES (?, ?, ?, ?)', [user_id, totalPrice, address, event_date]);
    const orderId = orderResult.lastID;
    
    for (const item of cartItems) {
      await db.run('INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES (?, ?, ?, ?)', 
        [orderId, item.menu_id, item.quantity, item.price]);
    }
    
    await db.run('DELETE FROM cart WHERE user_id = ?', [user_id]);
    res.json({ id: orderId, message: 'Order placed successfully' });
  });

  app.get('/api/orders', authenticateToken, async (req: any, res: any) => {
    // Otomatisasi Status Acara: auto close past events
    await db.run("UPDATE orders SET status = 'Selesai' WHERE event_date < CURRENT_TIMESTAMP AND status != 'Selesai' AND status != 'Dibatalkan'");

    if (req.user.role === 'admin') {
      const orders = await db.all(`
        SELECT o.*, u.name as user_name 
        FROM orders o JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `);
      res.json(orders);
    } else {
      const orders = await db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
      res.json(orders);
    }
  });

  app.get('/api/orders/:id', authenticateToken, async (req: any, res: any) => {
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const items = await db.all(`
      SELECT oi.*, m.name, m.image_url 
      FROM order_items oi JOIN menus m ON oi.menu_id = m.id
      WHERE oi.order_id = ?
    `, [req.params.id]);
    
    res.json({ ...order, items });
  });

  app.put('/api/orders/:id/status', authenticateToken, isAdmin, async (req, res) => {
    const { status } = req.body;
    await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  });

  app.post('/api/orders/:id/review', authenticateToken, async (req: any, res: any) => {
    try {
      const { rating, comment } = req.body;
      const orderId = req.params.id;
      
      const order = await db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, req.user.id]);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      if (order.status !== 'Selesai') return res.status(400).json({ error: 'Pesanan belum selesai' });

      await db.run('UPDATE orders SET rating = ?, comment = ? WHERE id = ?', [rating, comment, orderId]);
      res.json({ success: true });
    } catch(err: any) {
      console.error('POST /api/orders/:id/review error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Get all reviews for the home page (where order is complete and rating exists)
  app.get('/api/all-reviews', async (req, res) => {
    try {
      const reviews = await db.all(`
        SELECT o.id, o.rating, o.comment, o.created_at, u.name as user_name
        FROM orders o 
        JOIN users u ON o.user_id = u.id 
        WHERE o.rating IS NOT NULL
        ORDER BY o.id DESC
        LIMIT 10
      `);
      res.json(reviews);
    } catch(err: any) {
      console.error('GET /api/all-reviews error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Reviews
  app.get('/api/reviews/menu/:menuId', async (req, res) => {
    const reviews = await db.all(`
      SELECT r.*, u.name as user_name 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.menu_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.menuId]);
    res.json(reviews);
  });

  app.post('/api/reviews', authenticateToken, async (req: any, res: any) => {
    const { menu_id, rating, comment } = req.body;
    if (!menu_id || !rating) return res.status(400).json({ error: 'Missing required fields' });
    
    // Optional: check if user bought it (for now just allow)
    await db.run(
      'INSERT INTO reviews (user_id, menu_id, rating, comment) VALUES (?, ?, ?, ?)',
      [req.user.id, menu_id, rating, comment]
    );
    res.json({ success: true });
  });

  // Wishlists
  app.get('/api/wishlist', authenticateToken, async (req: any, res: any) => {
    const wishlists = await db.all(`
      SELECT w.id as wishlist_id, m.* 
      FROM wishlists w 
      JOIN menus m ON w.menu_id = m.id 
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `, [req.user.id]);
    res.json(wishlists);
  });

  app.post('/api/wishlist', authenticateToken, async (req: any, res: any) => {
    const { menu_id } = req.body;
    if (!menu_id) return res.status(400).json({ error: 'Menu ID is required' });
    
    const existing = await db.get('SELECT * FROM wishlists WHERE user_id = ? AND menu_id = ?', [req.user.id, menu_id]);
    if (existing) {
      await db.run('DELETE FROM wishlists WHERE id = ?', [existing.id]);
      res.json({ success: true, added: false });
    } else {
      await db.run('INSERT INTO wishlists (user_id, menu_id) VALUES (?, ?)', [req.user.id, menu_id]);
      res.json({ success: true, added: true });
    }
  });

  // Testimonials
  app.get('/api/testimonials', async (req, res) => {
    const testimonials = await db.all(`
      SELECT t.*, u.name as user_name 
      FROM testimonials t 
      LEFT JOIN users u ON t.user_id = u.id
    `);
    // Seed test data if empty
    if (testimonials.length === 0) {
       return res.json([
         { id: 1, user_name: "Budi Santoso", rating: 5, content: "Katering terenak yang pernah saya pesan, porsi pas dan pelayanan cepat!" },
         { id: 2, user_name: "Siti Rahma", rating: 5, content: "Snack box-nya variatif, sangat cocok untuk acara arisan keluarga." }
       ]);
    }
    res.json(testimonials);
  });

  app.post('/api/testimonials', authenticateToken, async (req: any, res: any) => {
    const { rating, content } = req.body;
    await db.run('INSERT INTO testimonials (user_id, rating, content) VALUES (?, ?, ?)', [req.user.id, rating, content]);
    res.json({ success: true });
  });

  // Admin User endpoints
  app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
    const users = await db.all("SELECT id, name, username, email, role FROM users WHERE role != 'admin'");
    res.json(users);
  });

  app.delete('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
    const userId = req.params.id;
    
    // First, clear any references to avoiding constraint issues
    await db.run('DELETE FROM cart WHERE user_id = ?', [userId]);
    await db.run('DELETE FROM reviews WHERE user_id = ?', [userId]);
    await db.run('DELETE FROM wishlists WHERE user_id = ?', [userId]);
    await db.run('DELETE FROM testimonials WHERE user_id = ?', [userId]);
    
    // For orders, we can also delete them and their items
    const orders = await db.all('SELECT id FROM orders WHERE user_id = ?', [userId]);
    for (const order of orders) {
      await db.run('DELETE FROM order_items WHERE order_id = ?', [order.id]);
    }
    await db.run('DELETE FROM orders WHERE user_id = ?', [userId]);

    await db.run('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ success: true });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  
  return app;
}

// For local dev, we run it
if (!process.env.VERCEL) {
  startServer();
}

// For Vercel, we export a handler
export default async function handler(req: any, res: any) {
  const app = await startServer();
  return app(req, res);
}
