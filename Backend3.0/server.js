const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.get("/", (req, res) => res.send("Server is running"));
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes

const groupRoutes = require('./routes/group');
app.use('/api/groups', groupRoutes);



const enquiryRoutes = require('./routes/enquiry');
app.use('/api/enquiry', enquiryRoutes);  // ✅ Correct route mount

const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);             // ✅ OK for /api/login etc.

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
