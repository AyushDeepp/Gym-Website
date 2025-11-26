import Attendance from '../models/Attendance.js';

const memberRoles = ['member', 'admin', 'super_admin'];

// @desc    Check in a member
// @route   POST /api/attendance/checkin
// @access  Private (Member)
export const checkIn = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!memberRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Only members can check in' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existingAttendance) {
      return res.status(400).json({ 
        message: 'Already checked in today',
        attendance: existingAttendance,
      });
    }

    const checkInTime = new Date();
    const attendance = await Attendance.create({
      userId: req.user._id,
      checkIn: checkInTime,
      date: today,
      status: 'checked-in',
    });

    res.status(201).json(attendance);
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check out a member
// @route   POST /api/attendance/checkout
// @access  Private (Member)
export const checkOut = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!memberRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Only members can check out' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
      status: 'checked-in',
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No active check-in found for today' });
    }

    const checkOutTime = new Date();
    attendance.checkOut = checkOutTime;
    attendance.status = 'checked-out';
    attendance.calculateDuration();
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's attendance status
// @route   GET /api/attendance/today
// @access  Private (Member)
export const getTodayAttendance = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    res.json(attendance || null);
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's attendance history
// @route   GET /api/attendance/user/:userId
// @access  Private (Member/Admin)
export const getUserAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    const isAdmin = !!req.admin || (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin'));
    const isOwner = req.user && req.user._id.toString() === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to view this attendance' });
    }

    const { startDate, endDate, limit = 30 } = req.query;
    let query = { userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'name email');

    // Calculate statistics
    const stats = {
      totalVisits: attendance.length,
      totalHours: attendance.reduce((sum, a) => sum + (a.duration || 0), 0) / 60,
      averageDuration: attendance.length > 0
        ? attendance.reduce((sum, a) => sum + (a.duration || 0), 0) / attendance.length
        : 0,
      currentStreak: calculateStreak(attendance),
    };

    res.json({ attendance, stats });
  } catch (error) {
    console.error('Get user attendance error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all attendance (Admin only)
// @route   GET /api/attendance
// @access  Private (Admin)
export const getAllAttendance = async (req, res) => {
  try {
    const isAdmin = !!req.admin || (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin'));

    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { startDate, endDate, userId, limit = 100 } = req.query;
    let query = {};

    if (userId) {
      query.userId = userId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1, checkIn: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'name email role');

    res.json(attendance);
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private (Admin)
export const getAttendanceStats = async (req, res) => {
  try {
    const isAdmin = !!req.admin || (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin'));

    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { startDate, endDate } = req.query;
    let dateQuery = {};

    if (startDate || endDate) {
      dateQuery.date = {};
      if (startDate) {
        dateQuery.date.$gte = new Date(startDate);
      }
      if (endDate) {
        dateQuery.date.$lte = new Date(endDate);
      }
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateQuery.date = { $gte: thirtyDaysAgo };
    }

    const stats = await Attendance.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: '$userId',
          totalVisits: { $sum: 1 },
          totalMinutes: { $sum: '$duration' },
          lastVisit: { $max: '$date' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          userName: '$user.name',
          userEmail: '$user.email',
          totalVisits: 1,
          totalHours: { $divide: ['$totalMinutes', 60] },
          lastVisit: 1,
        },
      },
      { $sort: { totalVisits: -1 } },
    ]);

    const overallStats = {
      totalCheckIns: await Attendance.countDocuments(dateQuery),
      uniqueMembers: stats.length,
      averageVisitsPerMember: stats.length > 0 ? stats.reduce((sum, s) => sum + s.totalVisits, 0) / stats.length : 0,
      totalHours: stats.reduce((sum, s) => sum + (s.totalHours || 0), 0),
    };

    res.json({ stats, overallStats });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete attendance entry (Admin only)
// @route   DELETE /api/attendance/:id
// @access  Private (Admin)
export const deleteAttendance = async (req, res) => {
  try {
    const isAdmin = !!req.admin || (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin'));

    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance entry not found' });
    }

    res.json({ message: 'Attendance entry deleted successfully' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin check in a member
// @route   POST /api/attendance/admin/checkin
// @access  Private (Admin)
export const adminCheckIn = async (req, res) => {
  try {
    const isAdmin = !!req.admin || (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin'));

    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { userId, checkInTime, date } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const User = (await import('../models/User.js')).default;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if already checked in for this date
    const existingAttendance = await Attendance.findOne({
      userId,
      date: {
        $gte: attendanceDate,
        $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existingAttendance) {
      return res.status(400).json({ 
        message: 'User already checked in for this date',
        attendance: existingAttendance,
      });
    }

    const checkIn = checkInTime ? new Date(checkInTime) : new Date();
    const attendance = await Attendance.create({
      userId,
      checkIn,
      date: attendanceDate,
      status: 'checked-in',
    });

    res.status(201).json(attendance);
  } catch (error) {
    console.error('Admin check-in error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin check out a member
// @route   POST /api/attendance/admin/checkout
// @access  Private (Admin)
export const adminCheckOut = async (req, res) => {
  try {
    const isAdmin = !!req.admin || (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin'));

    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { attendanceId, checkOutTime } = req.body;

    if (!attendanceId) {
      return res.status(400).json({ message: 'Attendance ID is required' });
    }

    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance entry not found' });
    }

    if (attendance.status === 'checked-out') {
      return res.status(400).json({ message: 'Already checked out' });
    }

    const checkOut = checkOutTime ? new Date(checkOutTime) : new Date();
    attendance.checkOut = checkOut;
    attendance.status = 'checked-out';
    attendance.calculateDuration();
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    console.error('Admin check-out error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate streak
function calculateStreak(attendance) {
  if (!attendance || attendance.length === 0) return 0;

  const sorted = [...attendance].sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const entry of sorted) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));

    if (diffDays === streak) {
      streak++;
    } else if (diffDays > streak) {
      break;
    }
  }

  return streak;
}

