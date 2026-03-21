import express from 'express';

const router = express.Router();

// this is a test route for login
router.get('/send', (req, res) => {
  res.json({ message: 'Send message route' });
});

// this is a test route for signup
router.get('/receive', (req, res) => {
  res.json({ message: 'Receive message route' });
});

export default router;