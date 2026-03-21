import express from 'express';

const router = express.Router();

// this is a test route for login
router.get('/login', (req, res) => {
  res.json({ message: 'Login route' });
});

// this is a test route for signup
router.get('/signup', (req, res) => {
  res.json({ message: 'Signup route' });
});

router.get('/logout', (req, res) => {
  res.json({ message: 'Logout route' });
});

export default router;