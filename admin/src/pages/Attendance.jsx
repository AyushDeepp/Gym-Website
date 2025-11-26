import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiFilter,
  FiUser,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiDownload,
  FiRefreshCw,
  FiUserCheck,
  FiTrendingUp,
  FiUsers,
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiEdit,
  FiX,
} from 'react-icons/fi';
import {
  getAllAttendance,
  getAttendanceStats,
  deleteAttendance,
  adminCheckIn,
  adminCheckOut,
  getCustomers,
} from '../utils/api';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    userId: '',
    status: 'all',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
  });
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkInForm, setCheckInForm] = useState({
    userId: '',
    checkInTime: new Date().toISOString().slice(0, 16),
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchAttendance();
    fetchStats();
    fetchCustomers();
  }, [filters, pagination.page]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.userId && { userId: filters.userId }),
      };
      const { data } = await getAllAttendance(params);
      setAttendance(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = {
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      };
      const { data } = await getAttendanceStats(params);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await getCustomers({ limit: 1000, role: 'member' });
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      await adminCheckIn(checkInForm);
      alert('Check-in recorded successfully!');
      setShowCheckInModal(false);
      setCheckInForm({
        userId: '',
        checkInTime: new Date().toISOString().slice(0, 16),
        date: new Date().toISOString().split('T')[0],
      });
      fetchAttendance();
      fetchStats();
    } catch (error) {
      console.error('Check-in error:', error);
      alert(error.response?.data?.message || 'Failed to record check-in');
    }
  };

  const handleCheckOut = async (attendanceId) => {
    try {
      await adminCheckOut({ attendanceId });
      alert('Check-out recorded successfully!');
      fetchAttendance();
      fetchStats();
    } catch (error) {
      console.error('Check-out error:', error);
      alert(error.response?.data?.message || 'Failed to record check-out');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) return;
    try {
      await deleteAttendance(id);
      alert('Attendance record deleted successfully!');
      fetchAttendance();
      fetchStats();
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Failed to delete attendance record');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const filteredAttendance = attendance.filter((record) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const userName = record.userId?.name?.toLowerCase() || '';
      const userEmail = record.userId?.email?.toLowerCase() || '';
      if (!userName.includes(searchLower) && !userEmail.includes(searchLower)) {
        return false;
      }
    }
    if (filters.status !== 'all' && record.status !== filters.status) {
      return false;
    }
    return true;
  });

  const todayStats = {
    totalCheckIns: attendance.filter((a) => {
      const today = new Date().toISOString().split('T')[0];
      return new Date(a.date).toISOString().split('T')[0] === today;
    }).length,
    checkedIn: attendance.filter((a) => {
      const today = new Date().toISOString().split('T')[0];
      return new Date(a.date).toISOString().split('T')[0] === today && a.status === 'checked-in';
    }).length,
    checkedOut: attendance.filter((a) => {
      const today = new Date().toISOString().split('T')[0];
      return new Date(a.date).toISOString().split('T')[0] === today && a.status === 'checked-out';
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Attendance Management</h1>
          <p className="text-gray-400 text-sm">Manage and track member attendance records</p>
        </div>
        <button
          onClick={() => setShowCheckInModal(true)}
          className="px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-red/90 transition-colors flex items-center gap-2"
        >
          <FiPlus className="text-lg" />
          <span>Mark Attendance</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-gray border border-primary-lightGray rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <FiUsers className="text-2xl text-primary-red" />
            <span className="text-xs text-gray-400">Total Members</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.overallStats?.uniqueMembers || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Active members</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-primary-gray border border-primary-lightGray rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <FiCheckCircle className="text-2xl text-green-400" />
            <span className="text-xs text-gray-400">Today's Check-ins</span>
          </div>
          <p className="text-2xl font-bold text-white">{todayStats.totalCheckIns}</p>
          <p className="text-xs text-gray-400 mt-1">
            {todayStats.checkedIn} checked in, {todayStats.checkedOut} checked out
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-primary-gray border border-primary-lightGray rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <FiBarChart2 className="text-2xl text-blue-400" />
            <span className="text-xs text-gray-400">Total Visits</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.overallStats?.totalCheckIns || 0}</p>
          <p className="text-xs text-gray-400 mt-1">All time check-ins</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-primary-gray border border-primary-lightGray rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <FiClock className="text-2xl text-yellow-400" />
            <span className="text-xs text-gray-400">Total Hours</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats?.overallStats?.totalHours?.toFixed(1) || '0.0'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Hours logged</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-primary-gray border border-primary-lightGray rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Search Member</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Name or email..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-primary-darker border border-primary-lightGray rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-red"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-4 py-2 bg-primary-darker border border-primary-lightGray rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2 bg-primary-darker border border-primary-lightGray rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 bg-primary-darker border border-primary-lightGray rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red"
            >
              <option value="all">All Status</option>
              <option value="checked-in">Checked In</option>
              <option value="checked-out">Checked Out</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFilters({
                search: '',
                startDate: '',
                endDate: '',
                userId: '',
                status: 'all',
              });
            }}
            className="px-4 py-2 bg-primary-darker border border-primary-lightGray text-white rounded-lg hover:bg-primary-lightGray transition-colors"
          >
            <FiX className="inline mr-2" />
            Clear Filters
          </button>
          <button
            onClick={() => {
              fetchAttendance();
              fetchStats();
            }}
            className="px-4 py-2 bg-primary-darker border border-primary-lightGray text-white rounded-lg hover:bg-primary-lightGray transition-colors"
          >
            <FiRefreshCw className="inline mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-primary-gray border border-primary-lightGray rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-darker border-b border-primary-lightGray">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Member</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Check In</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Check Out</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Duration</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((record) => (
                  <motion.tr
                    key={record._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-primary-lightGray hover:bg-primary-darker/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium">{record.userId?.name || 'N/A'}</p>
                        <p className="text-gray-400 text-xs">{record.userId?.email || ''}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{formatDate(record.date)}</td>
                    <td className="px-4 py-3 text-gray-300">{formatTime(record.checkIn)}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {record.checkOut ? formatTime(record.checkOut) : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{formatDuration(record.duration)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          record.status === 'checked-out'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {record.status === 'checked-out' ? 'Checked Out' : 'Checked In'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {record.status === 'checked-in' && (
                          <button
                            onClick={() => handleCheckOut(record._id)}
                            className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                            title="Check Out"
                          >
                            <FiXCircle />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg bg-primary-darker border border-primary-lightGray text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-lightGray transition-colors"
            >
              <FiChevronLeft />
            </button>
            <span className="text-white text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page >= pagination.pages}
              className="p-2 rounded-lg bg-primary-darker border border-primary-lightGray text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-lightGray transition-colors"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Check-In Modal */}
      <AnimatePresence>
        {showCheckInModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckInModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div
                className="bg-primary-gray border border-primary-lightGray rounded-lg p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Mark Attendance</h2>
                  <button
                    onClick={() => setShowCheckInModal(false)}
                    className="p-2 rounded-lg hover:bg-primary-lightGray transition-colors"
                  >
                    <FiX className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Member</label>
                    <select
                      value={checkInForm.userId}
                      onChange={(e) => setCheckInForm({ ...checkInForm, userId: e.target.value })}
                      className="w-full px-4 py-2 bg-primary-darker border border-primary-lightGray rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red"
                    >
                      <option value="">Select a member</option>
                      {customers.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name} ({customer.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Date</label>
                    <input
                      type="date"
                      value={checkInForm.date}
                      onChange={(e) => setCheckInForm({ ...checkInForm, date: e.target.value })}
                      className="w-full px-4 py-2 bg-primary-darker border border-primary-lightGray rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Check-In Time</label>
                    <input
                      type="datetime-local"
                      value={checkInForm.checkInTime}
                      onChange={(e) => setCheckInForm({ ...checkInForm, checkInTime: e.target.value })}
                      className="w-full px-4 py-2 bg-primary-darker border border-primary-lightGray rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={handleCheckIn}
                      disabled={!checkInForm.userId || !checkInForm.date}
                      className="flex-1 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Mark Check-In
                    </button>
                    <button
                      onClick={() => setShowCheckInModal(false)}
                      className="px-4 py-2 bg-primary-darker border border-primary-lightGray text-white rounded-lg hover:bg-primary-lightGray transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Attendance;

