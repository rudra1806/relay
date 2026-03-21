import express from 'express';

const app = express();

// this is a test route to check if the backend is working
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// this is a test route for login
app.get('/api/auth/login', (req, res) => {
  res.json({ message: 'Login route' });
});

// this is a test route for signup
app.get('/api/auth/signup', (req, res) => {
  res.json({ message: 'Signup route' });
});

app.get('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logout route' });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});