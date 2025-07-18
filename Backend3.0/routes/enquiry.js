const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');
const { v4: uuidv4 } = require('uuid');


router.get('/my-submissions', async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const enquiries = await Enquiry.find({ createdBy: email });
  res.json(enquiries);
});
// GET /api/enquiry/:loanApplicationNumber
router.get('/:loanApplicationNumber', async (req, res) => {
  try {
    const enquiry = await Enquiry.findOne({ loanApplicationNumber: req.params.loanApplicationNumber });
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    res.json(enquiry);
  } catch (error) {
    console.error('Error fetching enquiry:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/enquiry - Submit a new enquiry
router.post('/', async (req, res) => {
  const {
  source,
  sourcingRm,
  businessStage,
  loanApplicationDate,
  loanApplicationNumber,
  loanType,
  purpose,
  firstName,
  middleName,
  lastName,
  phNumber,
  IFSCCode,
  bankName,
  groupName,
  KycSelect,
  createdBy,        // ✅ from frontend
  createdByRole     // ✅ from frontend
} = req.body;

  try {
   const newEnquiry = new Enquiry({
  source,
  sourcingRm,
  businessStage,
  loanApplicationDate,
  loanApplicationNumber,
  loanType,
  purpose,
  firstName,
  middleName,
  lastName,
  phNumber,
  IFSCCode,
  bankName,
  groupName,
  KycSelect,
  createdBy,
  createdByRole
});


    await newEnquiry.save();
    res.status(201).json({ message: 'Enquiry saved successfully' });
  } catch (err) {
    console.error('Error saving enquiry:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/enquiry - Get all enquiries
router.get('/', async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    console.error('🔥 Error in GET /api/enquiry:', err);
    res.status(500).json({ message: 'Error fetching enquiries' });
  }
});


// Approve by Team Lead
// Approve by Team Lead
router.post('/approve/team-lead/:id', async (req, res) => {
  try {
    const update = {
      $set: {
        'status.teamLead.approved': true,
        'status.teamLead.date': new Date(),
        rejectedBy: null,
        rejectionReason: null
      },
      $push: {
        approvalHistory: {
          level: 'Team Lead',
          status: 'approved',
          comment: '',
          date: new Date()
        }
      }
    };

    const result = await Enquiry.findByIdAndUpdate(req.params.id, update, { new: true });

    if (!result) return res.status(404).json({ message: 'Enquiry not found' });

    res.json({ message: 'Approved by Team Lead' });
  } catch (err) {
    console.error('🔥 Error in Team Lead approval:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// Reject by Team Lead
// POST /api/enquiry/reject
router.post('/reject/team-lead/:id', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const update = {
      $set: {
        'status.teamLead.rejected': true,
        'status.teamLead.comment': reason,
        'status.teamLead.date': new Date(),
        rejectionReason: reason,
        rejectedBy: 'Team Lead'
      },
      $push: {
        approvalHistory: {
          level: 'Team Lead',
          status: 'rejected',
          comment: reason,
          date: new Date()
        }
      }
    };

    const result = await Enquiry.findByIdAndUpdate(id, update, { new: true });

    if (!result) return res.status(404).json({ message: "Enquiry not found" });

    res.json({ message: "Rejected by Team Lead" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating rejection" });
  }
});


// GET /api/enquiry/pending/team-lead
// GET /api/enquiry/pending/team-lead
router.get('/pending/team-lead', async (req, res) => {
  try {
    const pendingEnquiries = await Enquiry.find({
      'status.approvedByTeamLead': { $ne: true },
      'status.teamLead.rejected': { $ne: true }
    }).sort({ createdAt: -1 });

    res.json(pendingEnquiries);
  } catch (err) {
    console.error('🔥 Error in GET /pending/team-lead:', err);
    res.status(500).json({ message: 'Error fetching pending enquiries' });
  }
});



module.exports = router;
