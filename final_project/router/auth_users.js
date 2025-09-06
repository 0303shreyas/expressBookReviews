const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username is valid (not already registered)
const isValid = (username) => {
  let existingUser = users.find(u => u.username === username);
  return existingUser ? false : true;
};

// Check if user is authenticated
const authenticatedUser = (username, password) => {
  let validUser = users.find(u => u.username === username && u.password === password);
  return validUser ? true : false;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    // Generate access token
    let accessToken = jwt.sign({ data: username }, "access", { expiresIn: 60 * 60 });

    // Save token in session
    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(403).json({ message: "Invalid login. Check username and password" });
  }
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or update review
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: `Review for book with ISBN ${isbn} has been added/updated` });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: `Review for book with ISBN ${isbn} deleted` });
  } else {
    return res.status(404).json({ message: "No review found for this user" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
