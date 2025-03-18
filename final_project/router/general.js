const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }  

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    // Simulating fetching books with async-await
    const response = await new Promise((resolve) => {
      setTimeout(() => resolve(books), 500);
    });

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  let isbn = req.params.isbn;
  let book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

public_users.get('/axios/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;

    // Simulate fetching book details via Axios
    const response = await axios.get(`http://localhost:8080/isbn/${isbn}`);

    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  let author = req.params.author;
  let matchingBooks = [];

  Object.keys(books).forEach((key) => {
    if (books[key].author === author) {
      matchingBooks.push(books[key]);
    }
  });

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found for the given author" });
  }
});

public_users.get('/axios/author/:author', async function (req, res) {
  try {
    const author = req.params.author;

    // Simulate fetching book details via Axios
    const response = await axios.get(`http://localhost:8080/author/${author}`);

    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching the given author", error: error.message });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  let title = req.params.title;
  let matchingBooks = [];

  Object.keys(books).forEach((key) => {
    if (books[key].title === title) {
      matchingBooks.push(books[key]);
    }
  });

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found with the given title" });
  }
});

public_users.get('/axios/title/:title', async function (req, res) {
  try {
    const title = req.params.title;

    // Simulate fetching book details via Axios
    const response = await axios.get(`http://localhost:8080/title/${title}`);

    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching the given title", error: error.message });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  let isbn = req.params.isbn;
  let book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
