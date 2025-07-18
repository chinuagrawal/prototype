const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const KYC = require('../models/KYC');

// 🔍 Search group names by partial match
router.get('/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);

  try {
    const results = await Group.find({
      groupName: { $regex: q, $options: 'i' } // case-insensitive match
    }).limit(10);

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ➕ Add a new group
router.post('/group', async (req, res) => {
  try {
    const { groupName, groupCode } = req.body;
    const newGroup = new Group({ groupName, groupCode });
    await newGroup.save();
    res.status(201).json({ message: 'Group added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding group' });
  }
});

// ➕ Add KYC linked to a group
// Add KYC to group (with duplicate check)
router.post('/kyc', async (req, res) => {
  try {
    const { groupCode, kycCode, userName, aadharNumber, panCard } = req.body;

    const exists = await KYC.findOne({ groupCode, kycCode });
    if (exists) {
      return res.status(400).json({ message: 'KYC code already exists for this group' });
    }

    const kyc = new KYC({ groupCode, kycCode, userName, aadharNumber, panCard });
    await kyc.save();
    res.status(201).json({ message: 'KYC added' });
  } catch (err) {
    console.error('Error adding KYC:', err);
    res.status(500).json({ message: 'Error adding KYC' });
  }
});


// 📄 Fetch all group names and codes
router.get('/group-names', async (req, res) => {
  try {
    const groups = await Group.find({}, 'groupName groupCode');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching groups' });
  }
});

// 📋 Get all KYC details for a specific group
router.get('/kyc/:groupCode', async (req, res) => {
  try {
    const kycList = await KYC.find({ groupCode: req.params.groupCode });
    res.json(kycList);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching KYC data' });
  }
});
// Update KYC details
router.put('/kyc/:id', async (req, res) => {
  try {
    const { userName, aadharNumber, panCard } = req.body;
    await KYC.findByIdAndUpdate(req.params.id, { userName, aadharNumber, panCard });
    res.json({ message: 'KYC updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating KYC' });
  }
});

router.get('/all-kycs', async (req, res) => {
  try {
    const allKycs = await KYC.find(); // You can also add .sort({ kycCode: 1 }) if needed
    res.json(allKycs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching all KYC data' });
  }
});


module.exports = router;
