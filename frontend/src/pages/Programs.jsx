import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SectionTitle from '../components/SectionTitle';
import ProgramCard from '../components/ProgramCard';
import { getPrograms } from '../utils/api';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        // Add cache-busting timestamp to ensure fresh data
        const response = await getPrograms();
        setPrograms(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching programs:', error);
        setLoading(false);
      }
    };
    fetchPrograms();
    
    // Refetch on focus to get latest data
    const handleFocus = () => {
      fetchPrograms();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const filteredPrograms =
    filter === 'all'
      ? programs
      : programs.filter((program) => program.difficulty.toLowerCase() === filter);

  return (
    <div className="page-padding">
      <div className="container-responsive max-w-container">
        <SectionTitle
          title="Our Programs"
          subtitle="Choose the perfect program to achieve your fitness goals"
          center
        />

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12">
          {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
            <motion.button
              key={level}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(level)}
              className={`px-4 sm:px-6 py-2 text-xs sm:text-sm rounded-lg font-semibold transition-all ${
                filter === level
                  ? 'bg-primary-red text-white'
                  : 'bg-primary-gray text-gray-300 hover:bg-primary-lightGray'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Programs Grid */}
        {loading ? (
          <div className="text-center text-gray-400 py-12 sm:py-16 md:py-20">
            <p>Loading programs...</p>
          </div>
        ) : filteredPrograms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPrograms.map((program, index) => (
              <ProgramCard key={program._id} program={program} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12 sm:py-16 md:py-20">
            <p>No programs found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Programs;

