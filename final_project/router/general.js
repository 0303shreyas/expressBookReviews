const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ---------- Task 6: Register a new user ----------
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// ---------- Task 1 & 10: Get all books ----------
public_users.get('/', async function (req, res) {
  try {
    // Async/Await demonstration
    await new Promise(resolve => setTimeout(resolve, 10)); // simulate async
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// ---------- Task 2 & 11: Get book details by ISBN ----------
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Using Promise callback style
  new Promise((resolve, reject) => {
    if (books[isbn]) resolve(books[isbn]);
    else reject("Book not found");
  })
    .then(book => res.status(200).json(book))
    .catch(err => res.status(404).json({ message: err }));
});

// ---------- Task 3 & 12: Get books by Author ----------
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    // Async/Await style
    let result = [];
    Object.keys(books).forEach(key => {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        result.push(books[key]);
      }
    });

    if (result.length > 0) return res.status(200).json(result);
    else throw new Error("No books found by this author");
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// ---------- Task 4 & 13: Get books by Title ----------
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  // Promise callback style
  new Promise((resolve, reject) => {
    let result = [];
    Object.keys(books).forEach(key => {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
        result.push(books[key]);
      }
    });
    result.length > 0 ? resolve(result) : reject("No books found with this title");
  })
    .then(data => res.status(200).json(data))
    .catch(err => res.status(404).json({ message: err }));
});

// ---------- Task 5: Get book reviews ----------
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
