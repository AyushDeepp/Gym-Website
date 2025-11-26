import { motion } from 'framer-motion';

const TrainerCard = ({ trainer, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="bg-primary-gray rounded-xl overflow-hidden border border-primary-lightGray hover:border-primary-blue transition-all group"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={trainer.image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'}
          alt={trainer.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-darker to-transparent" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-1">{trainer.name}</h3>
        <p className="text-primary-blue font-semibold mb-3">{trainer.specialization}</p>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{trainer.bio}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-300 text-sm">
            {trainer.experience}+ Years Experience
          </span>
        </div>
        {trainer.certifications && trainer.certifications.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {trainer.certifications.slice(0, 2).map((cert, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-primary-lightGray text-gray-300 text-xs rounded"
              >
                {cert}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TrainerCard;

