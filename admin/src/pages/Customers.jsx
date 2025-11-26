import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiFilter,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiCreditCard,
  FiDollarSign,
  FiEdit,
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiUserCheck,
  FiFileText,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import {
  getCustomers,
  getCustomerById,
  updateCustomerRole,
  updateCustomerMembership,
  getCustomerPayments,
  updateCustomerNotes,
  assignTrainer,
  deleteCustomer,
  getTrainers,
  getPlans,
} from '../utils/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [payments, setPayments] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    role: 'all',
    membershipStatus: 'all',
    expiringSoon: false,
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchTrainers();
    fetchPlans();
    checkAdminRole();
  }, [filters, pagination.page]);

  const checkAdminRole = () => {
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    setIsSuperAdmin(admin.role === 'superadmin');
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.role !== 'all' && { role: filters.role }),
        ...(filters.membershipStatus !== 'all' && { membershipStatus: filters.membershipStatus }),
        ...(filters.expiringSoon && { expiringSoon: 'true' }),
        ...(filters.search && { search: filters.search }),
      };
      const { data } = await getCustomers(params);
      setCustomers(data.customers || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainers = async () => {
    try {
      const { data } = await getTrainers();
      setTrainers(data || []);
    } catch (error) {
      console.error('Error fetching trainers:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data } = await getPlans();
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleViewCustomer = async (customerId) => {
    try {
      const { data } = await getCustomerById(customerId);
      setSelectedCustomer(data.customer);
      setPayments(data.payments || []);
      setShowModal(true);
      setActiveTab('overview');
    } catch (error) {
      console.error('Error fetching customer:', error);
      alert('Failed to load customer details');
    }
  };

  const handleUpdateRole = async (customerId, newRole) => {
    try {
      await updateCustomerRole(customerId, { role: newRole });
      fetchCustomers();
      if (selectedCustomer?._id === customerId) {
        setSelectedCustomer({ ...selectedCustomer, role: newRole });
      }
      alert('Role updated successfully');
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    }
  };

  const handleUpdateMembership = async (data) => {
    try {
      await updateCustomerMembership(selectedCustomer._id, data);
      await handleViewCustomer(selectedCustomer._id);
      fetchCustomers();
      alert('Membership updated successfully');
    } catch (error) {
      console.error('Error updating membership:', error);
      alert('Failed to update membership');
    }
  };

  const handleAssignTrainer = async (trainerId) => {
    try {
      await assignTrainer(selectedCustomer._id, { trainerId });
      await handleViewCustomer(selectedCustomer._id);
      alert('Trainer assigned successfully');
    } catch (error) {
      console.error('Error assigning trainer:', error);
      alert('Failed to assign trainer');
    }
  };

  const handleUpdateNotes = async (notes) => {
    try {
      await updateCustomerNotes(selectedCustomer._id, { notes });
      await handleViewCustomer(selectedCustomer._id);
      alert('Notes updated successfully');
    } catch (error) {
      console.error('Error updating notes:', error);
      alert('Failed to update notes');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteCustomer(customerId);
      fetchCustomers();
      setShowModal(false);
      alert('Customer deleted successfully');
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert(error.response?.data?.message || 'Failed to delete customer');
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

  const getMembershipStatus = (customer) => {
    if (!customer.membership) return { label: 'None', color: 'text-gray-400' };
    if (customer.membership.status === 'active') {
      const endDate = new Date(customer.membership.endDate);
      const now = new Date();
      if (endDate < now) {
        return { label: 'Expired', color: 'text-red-400' };
      }
      return { label: 'Active', color: 'text-green-400' };
    }
    return { label: customer.membership.status || 'N/A', color: 'text-yellow-400' };
  };

  if (loading && customers.length === 0) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text-red">Customers</h1>
        <div className="bg-primary-gray rounded-xl px-4 sm:px-6 py-3 sm:py-4 border border-primary-lightGray w-full sm:w-auto">
          <p className="text-gray-400 text-sm mb-1">Total Customers</p>
          <p className="text-2xl font-bold gradient-text-blue">{pagination.total}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-primary-gray rounded-xl p-4 sm:p-6 border border-primary-lightGray mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Search</label>
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
            <label className="block text-sm text-gray-400 mb-2">Role</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full px-4 py-2 bg-primary-darker border border-primary-lightGray rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red"
            >
              <option value="all">All Roles</option>
              <option value="visitor">Visitor</option>
              <option value="member">Member</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Membership</label>
            <select
              value={filters.membershipStatus}
              onChange={(e) => setFilters({ ...filters, membershipStatus: e.target.value })}
              className="w-full px-4 py-2 bg-primary-darker border border-primary-lightGray rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
              <option value="none">No Membership</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Options</label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.expiringSoon}
                onChange={(e) => setFilters({ ...filters, expiringSoon: e.target.checked })}
                className="w-4 h-4 text-primary-red bg-primary-darker border-primary-lightGray rounded focus:ring-primary-red"
              />
              <span className="text-white text-sm">Expiring Soon</span>
            </label>
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="space-y-4">
        {customers.length > 0 ? (
          customers.map((customer, index) => {
            const membershipStatus = getMembershipStatus(customer);
            return (
              <motion.div
                key={customer._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-primary-gray rounded-xl p-4 sm:p-6 border border-primary-lightGray cursor-pointer hover:border-primary-red transition-colors"
                onClick={() => handleViewCustomer(customer._id)}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{customer.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        customer.role === 'member' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {customer.role.toUpperCase()}
                      </span>
                      {membershipStatus.label !== 'None' && (
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${membershipStatus.color}`}>
                          {membershipStatus.label}
                        </span>
                      )}
                    </div>
                    <p className="text-primary-blue mb-1">{customer.email}</p>
                    {customer.phone && (
                      <p className="text-gray-400 text-sm">{customer.phone}</p>
                    )}
                    {customer.membership && (
                      <p className="text-gray-400 text-sm mt-2">
                        Plan: {customer.membership.planName} • Expires: {formatDate(customer.membership.endDate)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm mb-1">Joined</p>
                    <p className="text-gray-300">{formatDate(customer.createdAt)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-400">
            No customers found
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1}
            className="p-2 bg-primary-gray border border-primary-lightGray rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-lightGray transition-colors"
          >
            <FiChevronLeft />
          </button>
          <span className="text-gray-400">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page === pagination.pages}
            className="p-2 bg-primary-gray border border-primary-lightGray rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-lightGray transition-colors"
          >
            <FiChevronRight />
          </button>
        </div>
      )}

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {showModal && selectedCustomer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-8 lg:inset-12 bg-primary-gray rounded-2xl border border-primary-lightGray z-50 overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-primary-lightGray">
                <h2 className="text-2xl font-bold gradient-text-red">{selectedCustomer.name}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-primary-lightGray rounded-lg transition-colors"
                >
                  <FiX className="text-white text-xl" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {/* Tabs */}
                <div className="flex space-x-2 mb-6 border-b border-primary-lightGray">
                  {['overview', 'membership', 'payments', 'attendance', 'notes'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 font-medium transition-colors capitalize ${
                        activeTab === tab
                          ? 'text-primary-red border-b-2 border-primary-red'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div>
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-primary-darker p-6 rounded-lg border border-primary-lightGray">
                          <h3 className="text-lg font-bold text-white mb-4">Personal Information</h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Name</p>
                              <p className="text-white">{selectedCustomer.name}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Email</p>
                              <p className="text-white">{selectedCustomer.email}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Phone</p>
                              <p className="text-white">{selectedCustomer.phone || 'Not provided'}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Role</p>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  selectedCustomer.role === 'member' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {selectedCustomer.role.toUpperCase()}
                                </span>
                                <select
                                  value={selectedCustomer.role}
                                  onChange={(e) => handleUpdateRole(selectedCustomer._id, e.target.value)}
                                  className="px-2 py-1 bg-primary-gray border border-primary-lightGray rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-red"
                                >
                                  <option value="visitor">Visitor</option>
                                  <option value="member">Member</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Joined</p>
                              <p className="text-white">{formatDate(selectedCustomer.createdAt)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-primary-darker p-6 rounded-lg border border-primary-lightGray">
                          <h3 className="text-lg font-bold text-white mb-4">Membership Status</h3>
                          {selectedCustomer.membership ? (
                            <div className="space-y-3">
                              <div>
                                <p className="text-gray-400 text-sm mb-1">Plan</p>
                                <p className="text-white">{selectedCustomer.membership.planName || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm mb-1">Status</p>
                                <p className={`capitalize ${
                                  selectedCustomer.membership.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                                }`}>
                                  {selectedCustomer.membership.status}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm mb-1">Start Date</p>
                                <p className="text-white">{formatDate(selectedCustomer.membership.startDate)}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm mb-1">End Date</p>
                                <p className="text-white">{formatDate(selectedCustomer.membership.endDate)}</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-400">No active membership</p>
                          )}
                        </div>
                      </div>

                      <div className="bg-primary-darker p-6 rounded-lg border border-primary-lightGray">
                        <h3 className="text-lg font-bold text-white mb-4">Assigned Trainer</h3>
                        {selectedCustomer.assignedTrainer ? (
                          <div>
                            <p className="text-white">{selectedCustomer.assignedTrainer.name}</p>
                            <p className="text-gray-400 text-sm">{selectedCustomer.assignedTrainer.specialization}</p>
                          </div>
                        ) : (
                          <p className="text-gray-400">No trainer assigned</p>
                        )}
                        <div className="mt-4">
                          <label className="block text-sm text-gray-400 mb-2">Assign Trainer</label>
                          <select
                            onChange={(e) => handleAssignTrainer(e.target.value)}
                            className="w-full px-4 py-2 bg-primary-gray border border-primary-lightGray rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red"
                          >
                            <option value="">Select trainer...</option>
                            {trainers.map((trainer) => (
                              <option key={trainer._id} value={trainer._id}>
                                {trainer.name} - {trainer.specialization}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Membership Tab */}
                  {activeTab === 'membership' && (
                    <MembershipTab
                      customer={selectedCustomer}
                      plans={plans}
                      onUpdate={handleUpdateMembership}
                    />
                  )}

                  {/* Payments Tab */}
                  {activeTab === 'payments' && (
                    <PaymentsTab payments={payments} />
                  )}

                  {/* Attendance Tab */}
                  {activeTab === 'attendance' && (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-xl mb-2">Coming Soon</p>
                      <p className="text-sm">Attendance tracking will be available in a future update.</p>
                    </div>
                  )}

                  {/* Notes Tab */}
                  {activeTab === 'notes' && (
                    <NotesTab
                      customer={selectedCustomer}
                      onUpdate={handleUpdateNotes}
                    />
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-primary-lightGray flex justify-between items-center">
                <div>
                  {isSuperAdmin && (
                    <button
                      onClick={() => handleDeleteCustomer(selectedCustomer._id)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <FiTrash2 className="inline mr-2" />
                      Delete Customer
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-red/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Membership Tab Component
const MembershipTab = ({ customer, plans, onUpdate }) => {
  const [formData, setFormData] = useState({
    planId: customer.membership?.planId?._id || '',
    startDate: customer.membership?.startDate ? new Date(customer.membership.startDate).toISOString().split('T')[0] : '',
    endDate: customer.membership?.endDate ? new Date(customer.membership.endDate).toISOString().split('T')[0] : '',
    status: customer.membership?.status || 'active',
    autoRenew: customer.membership?.autoRenew || false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="bg-primary-darker p-6 rounded-lg border border-primary-lightGray">
      <h3 className="text-lg font-bold text-white mb-4">Update Membership</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Plan</label>
          <select
            value={formData.planId}
            onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
            className="w-full px-4 py-2 bg-primary-gray border border-primary-lightGray rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red"
          >
            <option value="">Select plan...</option>
            {plans.map((plan) => (
              <option key={plan._id} value={plan._id}>
                {plan.name} - ₹{plan.price} ({plan.duration})
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 bg-primary-gray border border-primary-lightGray rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-2 bg-primary-gray border border-primary-lightGray rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 bg-primary-gray border border-primary-lightGray rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red"
          >
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.autoRenew}
              onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
              className="w-4 h-4 text-primary-red bg-primary-gray border-primary-lightGray rounded focus:ring-primary-red"
            />
            <span className="text-white text-sm">Auto Renew</span>
          </label>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-red/90 transition-colors"
        >
          Update Membership
        </button>
      </form>
    </div>
  );
};

// Payments Tab Component
const PaymentsTab = ({ payments }) => {
  if (payments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No payment history found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <div key={payment._id} className="bg-primary-darker p-4 rounded-lg border border-primary-lightGray">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="text-white font-semibold">{payment.planName}</h4>
              <p className="text-gray-400 text-sm">{payment.orderId}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary-red">₹{payment.amount}</p>
              <p className={`text-sm ${
                payment.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {payment.status.toUpperCase()}
              </p>
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            {new Date(payment.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};

// Notes Tab Component
const NotesTab = ({ customer, onUpdate }) => {
  const [notes, setNotes] = useState(customer.notes || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(notes);
  };

  return (
    <div className="bg-primary-darker p-6 rounded-lg border border-primary-lightGray">
      <h3 className="text-lg font-bold text-white mb-4">Admin Notes</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={10}
          className="w-full px-4 py-2 bg-primary-gray border border-primary-lightGray rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red mb-4"
          placeholder="Add notes about this customer..."
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-red/90 transition-colors"
        >
          Save Notes
        </button>
      </form>
    </div>
  );
};

export default Customers;

