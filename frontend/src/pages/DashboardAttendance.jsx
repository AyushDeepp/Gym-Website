import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiLogIn,
  FiLogOut,
  FiClock,
  FiCalendar,
  FiTrendingUp,
  FiActivity,
  FiCheckCircle,
  FiXCircle,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiAward,
  FiTarget,
  FiBarChart2,
} from 'react-icons/fi';
import { checkIn, checkOut, getTodayAttendance, getUserAttendance } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const formatTime = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatDateShort = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const formatDuration = (minutes) => {
  if (!minutes) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

const DashboardAttendance = () => {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [filterPeriod, setFilterPeriod] = useState('all'); // 'all', 'week', 'month'
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAttendance();
  }, [user, filterPeriod]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      
      // Add date filters based on period
      if (filterPeriod === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        params.startDate = weekAgo.toISOString().split('T')[0];
      } else if (filterPeriod === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        params.startDate = monthAgo.toISOString().split('T')[0];
      }

      const [todayRes, historyRes] = await Promise.all([
        getTodayAttendance(),
        getUserAttendance(user._id, params),
      ]);
      setTodayAttendance(todayRes.data);
      setAttendanceHistory(historyRes.data?.attendance || []);
      setStats(historyRes.data?.stats || null);
    } catch (error) {
      console.error('Attendance load failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setProcessing(true);
    try {
      const { data } = await checkIn();
      setTodayAttendance(data);
      setSuccessMessage('Successfully checked in! Welcome to the gym! 💪');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await fetchAttendance();
    } catch (error) {
      console.error('Check-in failed', error);
      alert(error.response?.data?.message || 'Check-in failed. You may already be checked in today.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    setProcessing(true);
    try {
      const { data } = await checkOut();
      setTodayAttendance(data);
      const duration = data.duration ? formatDuration(data.duration) : '';
      setSuccessMessage(`Successfully checked out! Great session! ${duration ? `You stayed for ${duration}.` : ''} 🎉`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await fetchAttendance();
    } catch (error) {
      console.error('Check-out failed', error);
      alert(error.response?.data?.message || 'Check-out failed. Please check in first.');
    } finally {
      setProcessing(false);
    }
  };

  const canCheckIn = !todayAttendance || todayAttendance.status === 'checked-out';
  const canCheckOut = todayAttendance && todayAttendance.status === 'checked-in';

  // Calendar view helpers
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateInHistory = (date) => {
    return attendanceHistory.some((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getDate() === date &&
        entryDate.getMonth() === selectedMonth &&
        entryDate.getFullYear() === selectedYear
      );
    });
  };

  const getDateStatus = (date) => {
    const entry = attendanceHistory.find((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getDate() === date &&
        entryDate.getMonth() === selectedMonth &&
        entryDate.getFullYear() === selectedYear
      );
    });
    return entry?.status || null;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 sm:h-10 lg:h-12" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === new Date().getDate() &&
        selectedMonth === new Date().getMonth() &&
        selectedYear === new Date().getFullYear();
      const hasAttendance = isDateInHistory(day);
      const status = getDateStatus(day);

      days.push(
        <div
          key={day}
          className={`h-8 sm:h-10 lg:h-12 flex items-center justify-center rounded-lg border transition-all text-xs sm:text-sm ${
            isToday
              ? 'bg-primary-red/20 border-primary-red text-primary-red font-bold'
              : hasAttendance
              ? status === 'checked-out'
                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
              : 'border-primary-lightGray/30 text-gray-500'
          }`}
        >
          <span>{day}</span>
        </div>
      );
    }

    return (
      <div className="bg-primary-darker border border-primary-lightGray rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg">
            {monthNames[selectedMonth]} {selectedYear}
          </h3>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear(selectedYear - 1);
                } else {
                  setSelectedMonth(selectedMonth - 1);
                }
              }}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-primary-gray transition-colors"
            >
              <FiChevronLeft className="text-white text-sm sm:text-base" />
            </button>
            <button
              onClick={() => {
                const now = new Date();
                setSelectedMonth(now.getMonth());
                setSelectedYear(now.getFullYear());
              }}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear(selectedYear + 1);
                } else {
                  setSelectedMonth(selectedMonth + 1);
                }
              }}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-primary-gray transition-colors"
            >
              <FiChevronRight className="text-white text-sm sm:text-base" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-gray-400 text-xs sm:text-sm font-semibold py-1 sm:py-2">
              {day.substring(0, 1)}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">{days}</div>
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-500/20 border border-green-500/50" />
            <span className="text-gray-400">Completed</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-yellow-500/20 border border-yellow-500/50" />
            <span className="text-gray-400">Active</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border border-primary-lightGray/30" />
            <span className="text-gray-400">No attendance</span>
          </div>
        </div>
      </div>
    );
  };

  // Calculate weekly stats
  const weeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekEntries = attendanceHistory.filter(
      (entry) => new Date(entry.date) >= weekAgo
    );
    return {
      visits: weekEntries.length,
      hours: weekEntries.reduce((sum, e) => sum + (e.duration || 0), 0) / 60,
      avgDuration: weekEntries.length > 0
        ? weekEntries.reduce((sum, e) => sum + (e.duration || 0), 0) / weekEntries.length
        : 0,
    };
  };

  const weekStats = weeklyStats();

  return (
    <div className="min-h-screen bg-primary-darker pt-20 sm:pt-24 pb-12 sm:pb-16 px-3 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Success Notification */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500/20 border border-green-500/50 text-green-400 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <FiCheckCircle className="text-2xl" />
                <p className="font-semibold">{successMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-primary-red mb-2">Gym Access</p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-1 sm:mb-2">Attendance & Check-In</h1>
          <p className="text-gray-400 text-xs sm:text-sm">Track your gym visits and build consistency.</p>
        </header>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
            <p className="text-gray-400 mt-4">Loading attendance...</p>
          </div>
        ) : (
          <>
            {/* Today's Status Card - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-primary-gray to-primary-darker border border-primary-lightGray rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
                <div className="flex-1 w-full">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-primary-red/20 rounded-lg">
                      <FiActivity className="text-primary-red text-lg sm:text-xl lg:text-2xl" />
                    </div>
                    <span className="text-base sm:text-lg lg:text-xl">Today's Status</span>
                  </h2>
                  {todayAttendance ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <motion.div
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="bg-primary-darker rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-primary-lightGray/60 flex-1 min-w-[100px] sm:min-w-[140px]"
                        >
                          <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-2">Check-In</p>
                          <p className="text-white text-lg sm:text-xl lg:text-2xl font-bold">{formatTime(todayAttendance.checkIn)}</p>
                          <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1">{formatDateShort(todayAttendance.date)}</p>
                        </motion.div>
                        {todayAttendance.checkOut ? (
                          <>
                            <div className="text-primary-red text-xl sm:text-2xl lg:text-3xl hidden sm:block">→</div>
                            <motion.div
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              className="bg-primary-darker rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-primary-lightGray/60 flex-1 min-w-[100px] sm:min-w-[140px]"
                            >
                              <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-2">Check-Out</p>
                              <p className="text-white text-lg sm:text-xl lg:text-2xl font-bold">{formatTime(todayAttendance.checkOut)}</p>
                            </motion.div>
                            {todayAttendance.duration && (
                              <>
                                <div className="text-primary-red text-xl sm:text-2xl lg:text-3xl hidden sm:block">→</div>
                                <motion.div
                                  initial={{ scale: 0.9 }}
                                  animate={{ scale: 1 }}
                                  className="bg-primary-darker rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-primary-lightGray/60 flex-1 min-w-[100px] sm:min-w-[140px]"
                                >
                                  <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-2">Duration</p>
                                  <p className="text-white text-lg sm:text-xl lg:text-2xl font-bold">{formatDuration(todayAttendance.duration)}</p>
                                </motion.div>
                              </>
                            )}
                          </>
                        ) : (
                          <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="ml-auto"
                          >
                            <span className="px-3 sm:px-5 py-2 sm:py-3 bg-green-500/20 border border-green-500/50 text-green-400 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
                              <span className="hidden sm:inline">Currently In Gym</span>
                              <span className="sm:hidden">In Gym</span>
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-primary-darker/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-primary-lightGray/30">
                      <p className="text-gray-400 text-xs sm:text-sm flex items-center gap-2">
                        <FiClock className="text-primary-red text-sm sm:text-base" />
                        <span>No check-in recorded for today. Ready to start your workout?</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                  {canCheckIn && (
                    <motion.button
                      onClick={handleCheckIn}
                      disabled={processing}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-gradient-to-r from-primary-red to-primary-red/80 text-white rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold hover:from-primary-red/90 hover:to-primary-red/70 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                    >
                      {processing ? (
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        <FiLogIn className="text-base sm:text-lg lg:text-xl" />
                      )}
                      Check In
                    </motion.button>
                  )}
                  {canCheckOut && (
                    <motion.button
                      onClick={handleCheckOut}
                      disabled={processing}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold hover:from-blue-600 hover:to-blue-500 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                    >
                      {processing ? (
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        <FiLogOut className="text-base sm:text-lg lg:text-xl" />
                      )}
                      Check Out
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Enhanced Statistics */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-primary-gray to-primary-darker border border-primary-lightGray rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="p-1.5 sm:p-2 lg:p-3 bg-primary-red/20 rounded-lg">
                      <FiCalendar className="text-primary-red text-base sm:text-xl lg:text-2xl" />
                    </div>
                    <FiTrendingUp className="text-green-400 text-sm sm:text-base lg:text-xl hidden sm:block" />
                  </div>
                  <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-2">Total Visits</p>
                  <p className="text-white text-2xl sm:text-3xl lg:text-4xl font-black">{stats.totalVisits || 0}</p>
                  <p className="text-gray-500 text-[10px] sm:text-xs mt-1 sm:mt-2 hidden sm:block">All time check-ins</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-primary-gray to-primary-darker border border-primary-lightGray rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="p-1.5 sm:p-2 lg:p-3 bg-blue-500/20 rounded-lg">
                      <FiClock className="text-blue-400 text-base sm:text-xl lg:text-2xl" />
                    </div>
                    <FiBarChart2 className="text-blue-400 text-sm sm:text-base lg:text-xl hidden sm:block" />
                  </div>
                  <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-2">Total Hours</p>
                  <p className="text-white text-2xl sm:text-3xl lg:text-4xl font-black">{stats.totalHours ? stats.totalHours.toFixed(1) : '0'}</p>
                  <p className="text-gray-500 text-[10px] sm:text-xs mt-1 sm:mt-2 hidden sm:block">Hours logged</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-primary-gray to-primary-darker border border-primary-lightGray rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="p-1.5 sm:p-2 lg:p-3 bg-yellow-500/20 rounded-lg">
                      <FiActivity className="text-yellow-400 text-base sm:text-xl lg:text-2xl" />
                    </div>
                    <FiTarget className="text-yellow-400 text-sm sm:text-base lg:text-xl hidden sm:block" />
                  </div>
                  <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-2">Avg Duration</p>
                  <p className="text-white text-xl sm:text-2xl lg:text-4xl font-black">
                    {stats.averageDuration ? formatDuration(Math.round(stats.averageDuration)) : '—'}
                  </p>
                  <p className="text-gray-500 text-[10px] sm:text-xs mt-1 sm:mt-2 hidden sm:block">Per session</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-primary-gray to-primary-darker border border-primary-lightGray rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="p-1.5 sm:p-2 lg:p-3 bg-green-500/20 rounded-lg">
                      <FiAward className="text-green-400 text-base sm:text-xl lg:text-2xl" />
                    </div>
                    <FiTrendingUp className="text-green-400 text-sm sm:text-base lg:text-xl hidden sm:block" />
                  </div>
                  <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-2">Current Streak</p>
                  <p className="text-white text-2xl sm:text-3xl lg:text-4xl font-black">{stats.currentStreak || 0} days</p>
                  <p className="text-gray-500 text-[10px] sm:text-xs mt-1 sm:mt-2 hidden sm:block">Keep it up! 🔥</p>
                </motion.div>
              </div>
            )}

            {/* Weekly Summary */}
            {weekStats.visits > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary-gray border border-primary-lightGray rounded-xl sm:rounded-2xl p-4 sm:p-6"
              >
                <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                  <FiBarChart2 className="text-primary-red text-sm sm:text-base" />
                  <span className="text-sm sm:text-base lg:text-lg">This Week's Summary</span>
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                  <div className="bg-primary-darker rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary-lightGray/50">
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">Visits</p>
                    <p className="text-white text-lg sm:text-xl lg:text-2xl font-bold">{weekStats.visits}</p>
                  </div>
                  <div className="bg-primary-darker rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary-lightGray/50">
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">Hours</p>
                    <p className="text-white text-lg sm:text-xl lg:text-2xl font-bold">{weekStats.hours.toFixed(1)}</p>
                  </div>
                  <div className="bg-primary-darker rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary-lightGray/50">
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">Avg Duration</p>
                    <p className="text-white text-base sm:text-lg lg:text-2xl font-bold">{formatDuration(Math.round(weekStats.avgDuration))}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* View Toggle and Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none ${
                    viewMode === 'list'
                      ? 'bg-primary-red text-white'
                      : 'bg-primary-gray text-gray-400 hover:text-white'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none ${
                    viewMode === 'calendar'
                      ? 'bg-primary-red text-white'
                      : 'bg-primary-gray text-gray-400 hover:text-white'
                  }`}
                >
                  Calendar
                </button>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <FiFilter className="text-gray-400 text-sm sm:text-base hidden sm:block" />
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-gray border border-primary-lightGray rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-red w-full sm:w-auto"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
            </div>

            {/* Calendar or List View */}
            {viewMode === 'calendar' ? (
              renderCalendar()
            ) : (
              <section className="bg-primary-gray/60 border border-primary-lightGray rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-7">
                <h2 className="text-white text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-5 flex items-center gap-2">
                  <FiCalendar className="text-primary-red text-sm sm:text-base" />
                  <span>Attendance History</span>
                </h2>
                {attendanceHistory.length ? (
                  <div className="space-y-2 sm:space-y-3">
                    {attendanceHistory.map((entry, index) => (
                      <motion.div
                        key={entry._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-primary-darker border border-primary-lightGray rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 hover:border-primary-red/50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                          <div className="flex-1 w-full">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <p className="text-white font-bold text-sm sm:text-base lg:text-lg">{formatDate(entry.date)}</p>
                              {entry.status === 'checked-in' ? (
                                <span className="px-2 sm:px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-300 rounded-full animate-pulse" />
                                  Active
                                </span>
                              ) : (
                                <span className="px-2 sm:px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-300 rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-1">
                                  <FiCheckCircle className="text-[10px] sm:text-xs" />
                                  Completed
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-gray-400">
                              <span className="flex items-center gap-1.5 sm:gap-2">
                                <FiLogIn className="text-primary-red text-xs sm:text-sm" />
                                <span>In: {formatTime(entry.checkIn)}</span>
                              </span>
                              {entry.checkOut && (
                                <span className="flex items-center gap-1.5 sm:gap-2">
                                  <FiLogOut className="text-blue-400 text-xs sm:text-sm" />
                                  <span>Out: {formatTime(entry.checkOut)}</span>
                                </span>
                              )}
                              {entry.duration && (
                                <span className="flex items-center gap-1.5 sm:gap-2">
                                  <FiClock className="text-yellow-400 text-xs sm:text-sm" />
                                  <span>Duration: {formatDuration(entry.duration)}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <FiCalendar className="text-gray-600 text-3xl sm:text-4xl lg:text-5xl mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-400 text-xs sm:text-sm">No attendance history yet. Check in to start tracking!</p>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardAttendance;
