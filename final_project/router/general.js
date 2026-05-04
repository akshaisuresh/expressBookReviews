const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { users } = require('./auth_users.js');

const public_users = express.Router();
const BASE_URL = "http://localhost:5000";

// Task 7: Register new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  const exists = users.find(u => u.username === username);
  if (exists) {
    return res.status(409).json({ message: `User '${username}' already exists.` });
  }
  users.push({ username, password });
  return res.status(201).json({ message: `User '${username}' registered successfully!` });
});

// Task 2: Get all books — async/await
public_users.get('/', async (req, res) => {
  try {
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Task 3: Get by ISBN — Promise
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    const book = books[isbn];
    book ? resolve(book) : reject(new Error(`No book found with ISBN: ${isbn}`));
  })
    .then(book => res.status(200).json(book))
    .catch(err => res.status(404).json({ message: err.message }));
});

// Task 4: Get by Author — async/await + Axios
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author.toLowerCase();
    const response = await axios.get(`${BASE_URL}/`);
    const matched = Object.entries(response.data)
      .filter(([, b]) => b.author.toLowerCase() === author)
      .map(([isbn, b]) => ({ isbn, ...b }));
    matched.length > 0
      ? res.status(200).json(matched)
      : res.status(404).json({ message: `No books found by author: ${req.params.author}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Task 5: Get by Title — async/await + Axios
public_users.get('/title/:title', async (req, res) => {
  try {
    const title = req.params.title.toLowerCase();
    const response = await axios.get(`${BASE_URL}/`);
    const matched = Object.entries(response.data)
      .filter(([, b]) => b.title.toLowerCase() === title)
      .map(([isbn, b]) => ({ isbn, ...b }));
    matched.length > 0
      ? res.status(200).json(matched)
      : res.status(404).json({ message: `No books found with title: ${req.params.title}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Task 6: Get book review
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  book
    ? res.status(200).json(book.reviews)
    : res.status(404).json({ message: `No book found with ISBN: ${req.params.isbn}` });
});

module.exports.general = public_users;
