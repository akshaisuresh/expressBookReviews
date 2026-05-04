cat > index.js << 'EOF'
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { general } = require('./router/general.js');
const { authenticated, JWT_SECRET } = require('./router/auth_users.js');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'fingerprint_customer',
  resave: true,
  saveUninitialized: true,
}));

// JWT middleware for protected routes
app.use('/customer/auth/*', (req, res, next) => {
  if (req.session.authorization) {
    const token = req.session.authorization.token;
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Token invalid. Please login again." });
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json({ message: "User not logged in." });
  }
});

app.use('/', general);
app.use('/customer', authenticated);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
EOF
