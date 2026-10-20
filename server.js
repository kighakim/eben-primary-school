require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import models
const Contact = require('./models/Contact');
const News = require('./models/News');

// Routes
app.get('/', (req, res) => res.render('index'));
app.get('/about', (req, res) => res.render('about'));
app.get('/admissions', (req, res) => res.render('admissions'));
app.get('/boarding', (req, res) => res.render('boarding'));

app.get('/news', async (req, res) => {
  const newsItems = await News.find().sort({ date: -1 });
  res.render('news', { news: newsItems });
});

app.get('/contact', (req, res) => res.render('contact'));

// Handle contact form submission
app.post('/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;
  await Contact.create({ name, email, phone, message });
  res.redirect('/contact?success=true');
});

// Admin page
app.get('/admin', async (req, res) => {
  const messages = await Contact.find().sort({ date: -1 });
  const newsItems = await News.find().sort({ date: -1 });
  res.render('admin', { messages, news: newsItems });
});

// Add news
app.post('/admin/news', async (req, res) => {
  await News.create({
    title: req.body.title,
    content: req.body.content,
    date: new Date()
  });
  res.redirect('/admin');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));