const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();
const JWT_SECRET = "your_jwt_secret_key";
let users = [];

const isValid = (username) => users.some(u => u.username === username);
const authenticatedUser = (username, password) =>
  users.some(u => u.username === username && u.password === password);

// Task 8: Login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required." });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials." });
  }
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  req.session.authorization = { token, username };
  return res.status(200).json({
    message: `User '${username}' logged in successfully!`,
    token,
  });
});

// Task 9: Add/Modify Review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;
  if (!username) return res.status(401).json({ message: "User not logged in." });
  if (!review) return res.status(400).json({ message: "Review text required." });
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: `No book with ISBN: ${isbn}` });
  book.reviews[username] = review;
  return res.status(200).json({
    message: `Review for ISBN ${isbn} by '${username}' added/updated!`,
    reviews: book.reviews,
  });
});

// Task 10: Delete Review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;
  if (!username) return res.status(401).json({ message: "User not logged in." });
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: `No book with ISBN: ${isbn}` });
  if (!book.reviews[username]) return res.status(404).json({ message: "No review found." });
  delete book.reviews[username];
  return res.status(200).json({
    message: `Review by '${username}' for ISBN ${isbn} deleted!`,
    reviews: book.reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.JWT_SECRET = JWT_SECRET;
