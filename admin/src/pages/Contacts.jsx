import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getContacts, updateContact } from '../utils/api';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data } = await getContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateContact(id, { status });
      fetchContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Error updating contact status');
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="w-full overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text-red mb-4 sm:mb-6 md:mb-8">Contact Submissions</h1>

      <div className="space-y-3 sm:space-y-4">
        {contacts.length > 0 ? (
          contacts.map((contact, index) => (
            <motion.div
              key={contact._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-primary-gray rounded-xl p-4 sm:p-6 border border-primary-lightGray"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 truncate">{contact.name}</h3>
                  <p className="text-primary-blue text-sm sm:text-base truncate">{contact.email}</p>
                  {contact.phone && <p className="text-gray-400 text-xs sm:text-sm">{contact.phone}</p>}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={contact.status}
                    onChange={(e) => handleStatusChange(contact._id, e.target.value)}
                    className="px-2 sm:px-3 py-1.5 sm:py-1 bg-primary-dark border border-primary-lightGray rounded-lg text-white text-xs sm:text-sm w-full sm:w-auto"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                  </select>
                </div>
              </div>
              <div className="mb-3 sm:mb-4">
                <p className="text-gray-300 font-semibold mb-1 sm:mb-2 text-sm sm:text-base break-words">{contact.subject}</p>
                <p className="text-gray-400 text-xs sm:text-sm break-words">{contact.message}</p>
              </div>
              <p className="text-gray-500 text-xs">
                {new Date(contact.createdAt).toLocaleString()}
              </p>
            </motion.div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8 sm:py-12">
            <p>No contact submissions yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;

