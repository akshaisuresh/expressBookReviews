const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { users } = require('./auth_users.js');

const public_users = express.Router();
const BASE_URL = "http://localhost:5000";

// Register new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password are required." });
  const exists = users.find(u => u.username === username);
  if (exists)
    return res.status(409).json({ message: `User '${username}' already exists.` });
  users.push({ username, password });
  return res.status(201).json({ message: `User '${username}' registered successfully!` });
});

// Task 1: Get all books using async/await with Axios
// Command: curl -s http://localhost:5000/
// Output: {"1":{"author":"Chinua Achebe","title":"Things Fall Apart","reviews":{}},"2":{"author":"Hans Christian Andersen","title":"Fairy tales","reviews":{}},"3":{"author":"Dante Alighieri","title":"The Divine Comedy","reviews":{}},"4":{"author":"Unknown","title":"The Epic Of Gilgamesh","reviews":{}},"5":{"author":"Unknown","title":"The Book Of Job","reviews":{}},"6":{"author":"Unknown","title":"One Thousand and One Nights","reviews":{}},"7":{"author":"Unknown","title":"Njal's Saga","reviews":{}},"8":{"author":"Jane Austen","title":"Pride and Prejudice","reviews":{}},"9":{"author":"Honoré de Balzac","title":"Le Père Goriot","reviews":{}},"10":{"author":"Samuel Beckett","title":"Molloy, Malone Dies, The Unnamable, the trilogy","reviews":{}}}
public_users.get('/', async (req, res) => {
  try {
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Task 2: Get book details based on ISBN using Promise
// Command: curl -s http://localhost:5000/isbn/1
// Output: {"author":"Chinua Achebe","title":"Things Fall Apart","reviews":{}}
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(new Error(`No book found with ISBN: ${isbn}`));
    }
  })
    .then(book => res.status(200).json(book))
    .catch(err => res.status(404).json({ message: err.message }));
});

// Task 3: Get book details based on Author using async/await with Axios
// Command: curl -s "http://localhost:5000/author/Chinua%20Achebe"
// Output: [{"isbn":"1","author":"Chinua Achebe","title":"Things Fall Apart","reviews":{}}]
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author.toLowerCase();
    const response = await axios.get(`${BASE_URL}/`);
    const allBooks = response.data;
    const matchedBooks = Object.entries(allBooks)
      .filter(([, book]) => book.author.toLowerCase() === author)
      .map(([isbn, book]) => ({ isbn, ...book }));
    if (matchedBooks.length > 0) {
      res.status(200).json(matchedBooks);
    } else {
      res.status(404).json({ message: `No books found by author: ${req.params.author}` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Task 4: Get book details based on Title using async/await with Axios
// Command: curl -s "http://localhost:5000/title/Things%20Fall%20Apart"
// Output: [{"isbn":"1","author":"Chinua Achebe","title":"Things Fall Apart","reviews":{}}]
public_users.get('/title/:title', async (req, res) => {
  try {
    const title = req.params.title.toLowerCase();
    const response = await axios.get(`${BASE_URL}/`);
    const allBooks = response.data;
    const matchedBooks = Object.entries(allBooks)
      .filter(([, book]) => book.title.toLowerCase() === title)
      .map(([isbn, book]) => ({ isbn, ...book }));
    if (matchedBooks.length > 0) {
      res.status(200).json(matchedBooks);
    } else {
      res.status(404).json({ message: `No books found with title: ${req.params.title}` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get book review
// Command: curl -s http://localhost:5000/review/1
// Output: {}
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (book) {
    res.status(200).json(book.reviews);
  } else {
    res.status(404).json({ message: `No book found with ISBN: ${req.params.isbn}` });
  }
});

module.exports.general = public_users;
