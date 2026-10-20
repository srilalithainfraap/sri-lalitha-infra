const asyncHandler = require('express-async-handler');
const Plot = require('../models/Plot');
const Enquiry = require('../models/Enquiry');
const Visit = require('../models/Visit');
const User = require('../models/User');

// GET /api/dashboard/admin
const getAdminStats = asyncHandler(async (_req, res) => {
  const [
    totalPlots, available, reserved, sold,
    totalEnquiries, newEnquiries,
    totalVisits, pendingVisits,
    totalUsers,
  ] = await Promise.all([
    Plot.countDocuments(),
    Plot.countDocuments({ status: 'available' }),
    Plot.countDocuments({ status: 'reserved' }),
    Plot.countDocuments({ status: 'sold' }),
    Enquiry.countDocuments(),
    Enquiry.countDocuments({ status: 'new' }),
    Visit.countDocuments(),
    Visit.countDocuments({ status: 'pending' }),
    User.countDocuments({ role: 'user' }),
  ]);

  const recentEnquiries = await Enquiry.find().sort({ createdAt: -1 }).limit(5);
  const recentVisits    = await Visit.find().sort({ createdAt: -1 }).limit(5);

  res.json({
    success: true,
    stats: {
      plots: { total: totalPlots, available, reserved, sold },
      enquiries: { total: totalEnquiries, new: newEnquiries },
      visits: { total: totalVisits, pending: pendingVisits },
      users: { total: totalUsers },
    },
    recentEnquiries,
    recentVisits,
  });
});

// GET /api/dashboard/user
const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).populate('savedPlots');

  const [enquiries, visits] = await Promise.all([
    Enquiry.find({ userId }).sort({ createdAt: -1 }),
    Visit.find({ userId }).sort({ createdAt: -1 }),
  ]);

  res.json({
    success: true,
    stats: {
      savedPlots: user.savedPlots?.length ?? 0,
      visits: visits.length,
      enquiries: enquiries.length,
    },
    savedPlots: user.savedPlots ?? [],
    visits,
    enquiries,
  });
});

module.exports = { getAdminStats, getUserStats };
