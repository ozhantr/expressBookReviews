const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Check if the username is already taken
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  // Check if username and password match any registered user
  return users.some(user => user.username === username && user.password === password);
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const accessToken = jwt.sign({ username }, "secret_key", { expiresIn: "1h" });

  req.session.token = accessToken;

  return res.status(200).json({ message: "Login successful", token: accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { review } = req.body;
  const isbn = req.params.isbn;

  const username = req.session.user.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or update the review
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  const username = req.session.user.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found for this book by this user" });
  }

  // Delete the user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
