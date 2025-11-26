import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SectionTitle from '../components/SectionTitle';
import TrainerCard from '../components/TrainerCard';
import { getTrainers } from '../utils/api';

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await getTrainers();
        setTrainers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trainers:', error);
        setLoading(false);
      }
    };
    fetchTrainers();
    
    // Refetch on focus to get latest data
    const handleFocus = () => {
      fetchTrainers();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return (
    <div className="page-padding">
      <div className="container-responsive max-w-container">
        <SectionTitle
          title="Our Expert Trainers"
          subtitle="Meet the professionals dedicated to your success"
          center
        />

        {loading ? (
          <div className="text-center text-gray-400 py-12 sm:py-16 md:py-20">
            <p>Loading trainers...</p>
          </div>
        ) : trainers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {trainers.map((trainer, index) => (
              <TrainerCard key={trainer._id} trainer={trainer} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12 sm:py-16 md:py-20">
            <p>No trainers available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trainers;

