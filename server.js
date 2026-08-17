const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
console.log(process.env.MONGO_URI);
// Routes
const inventoryRoutes = require('./routes/inventory');
const stockRoutes = require('./routes/stock');
const activityLogRoutes = require('./routes/activitylog');
const uploadRoutes = require('./routes/upload');

app.use('/api/inventory', inventoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/logs', activityLogRoutes);
app.use('/api/stock', stockRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected!'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});