const express = require('express');
const cors = require('cors');
const db = require('./database');

const transactionsRouter = require('./routes/transactions');
const pocketsRouter = require('./routes/pockets');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/transactions', transactionsRouter);
app.use('/api/pockets', pocketsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AkuKaya API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`AkuKaya API running at http://localhost:${PORT}`);
});
