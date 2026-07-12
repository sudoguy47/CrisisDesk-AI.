const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const reportRoutes = require('./routes/reportRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/reports', reportRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'CrisisDesk API is running...' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});