require('dotenv').config();

const path = require('path');
const bcrypt = require('bcryptjs');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const morgan = require('morgan');
const { getContent, saveContent, getHistory, undoLastChange } = require('./contentStore');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'super-secret-key';

const adminPasswordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.json({ limit: '2mb' }));
app.use(methodOverride('_method'));
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.user = req.session.user;
  next();
});

app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
app.use(express.static(path.join(__dirname, '..')));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

function requireAdmin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'Please login to access admin panel.');
    return res.redirect('/admin/login');
  }

  next();
}

app.get('/admin/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/admin');
  }

  return res.render('login');
});

app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (username !== ADMIN_USERNAME) {
    req.flash('error', 'Invalid credentials.');
    return res.redirect('/admin/login');
  }

  const isMatch = await bcrypt.compare(password || '', adminPasswordHash);

  if (!isMatch) {
    req.flash('error', 'Invalid credentials.');
    return res.redirect('/admin/login');
  }

  req.session.user = { username };
  req.flash('success', 'Welcome to the admin dashboard.');
  return res.redirect('/admin');
});

app.post('/admin/logout', requireAdmin, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

app.get('/admin', requireAdmin, (req, res) => {
  res.render('dashboard');
});

app.get('/admin/content', requireAdmin, (req, res) => {
  const content = getContent();
  res.render('content', { content });
});

app.post('/admin/content', requireAdmin, (req, res) => {
  try {
    const parsedContent = JSON.parse(req.body.content || '{}');
    saveContent(parsedContent, { action: 'Manual content update', section: 'all' });
    req.flash('success', 'Content updated successfully.');
    return res.redirect('/admin/content');
  } catch (error) {
    req.flash('error', `Content update failed: ${error.message}`);
    return res.redirect('/admin/content');
  }
});

app.get('/admin/history', requireAdmin, (req, res) => {
  const history = getHistory();
  res.render('history', { history });
});

app.post('/admin/history/undo', requireAdmin, (req, res) => {
  const undone = undoLastChange();

  if (!undone) {
    req.flash('error', 'No previous state found to undo.');
    return res.redirect('/admin/history');
  }

  req.flash('success', `Undo completed: ${undone.action} (${new Date(undone.createdAt).toLocaleString()})`);
  return res.redirect('/admin/history');
});

app.get('/api/content', (req, res) => {
  res.json(getContent());
});

app.post('/api/content/section/:section', requireAdmin, (req, res) => {
  const { section } = req.params;
  const existing = getContent();

  if (!(section in existing)) {
    return res.status(404).json({ error: 'Section not found.' });
  }

  existing[section] = req.body;
  saveContent(existing, { action: 'Section updated via API', section });
  return res.json({ message: 'Section updated.', section });
});

app.listen(PORT, () => {
  console.log(`CMS server is running on http://localhost:${PORT}`);
});
