import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SectionTitle from '../components/SectionTitle';
import { getTimetable } from '../utils/api';

const Timetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await getTimetable();
        setTimetable(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching timetable:', error);
        setLoading(false);
      }
    };
    fetchTimetable();
    
    // Refetch on focus to get latest data
    const handleFocus = () => {
      fetchTimetable();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const dayClasses = timetable.filter((item) => item.day === selectedDay);

  return (
    <div className="page-padding">
      <div className="container-responsive max-w-container">
        <SectionTitle
          title="Class Timetable"
          subtitle="Find the perfect class for your schedule"
          center
        />

        {/* Day Selector */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-10 md:mb-12">
          {days.map((day) => (
            <motion.button
              key={day}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDay(day)}
              className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm rounded-lg font-semibold transition-all ${
                selectedDay === day
                  ? 'bg-primary-red text-white'
                  : 'bg-primary-gray text-gray-300 hover:bg-primary-lightGray'
              }`}
            >
              {day.slice(0, 3)}
            </motion.button>
          ))}
        </div>

        {/* Timetable */}
        {loading ? (
          <div className="text-center text-gray-400 py-12 sm:py-16 md:py-20">
            <p>Loading timetable...</p>
          </div>
        ) : dayClasses.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-primary-gray rounded-xl p-4 sm:p-6 border border-primary-lightGray mb-4">
              <h3 className="text-xl sm:text-2xl font-bold gradient-text-red mb-4 sm:mb-6 text-center">
                {selectedDay}
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {dayClasses.map((classItem, index) => (
                  <motion.div
                    key={classItem._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-primary-dark rounded-lg p-4 sm:p-6 border border-primary-lightGray hover:border-primary-blue transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-3 sm:mb-4 md:mb-0">
                        <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">
                          {classItem.className}
                        </h4>
                        <p className="text-sm sm:text-base text-primary-blue font-semibold">{classItem.trainer}</p>
                      </div>
                      <div className="flex flex-col md:items-end">
                        <span className="text-xl sm:text-2xl font-bold gradient-text-red mb-1">
                          {classItem.time}
                        </span>
                        <span className="text-gray-400 text-xs sm:text-sm">{classItem.duration}</span>
                        <span className="text-gray-400 text-xs sm:text-sm mt-1">
                          Capacity: {classItem.capacity}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12 sm:py-16 md:py-20">
            <p>No classes scheduled for {selectedDay}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timetable;

