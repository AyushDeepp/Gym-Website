import { motion } from 'framer-motion';

const ProgramCard = ({ program, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="bg-primary-gray rounded-xl overflow-hidden border border-primary-lightGray hover:border-primary-red transition-all group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={program.image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'}
          alt={program.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-darker to-transparent" />
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 bg-primary-red text-white text-xs font-semibold rounded-full">
            {program.difficulty}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{program.name}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{program.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-primary-blue font-semibold">{program.duration}</span>
          {program.price > 0 && (
            <span className="text-white font-bold">₹{program.price}</span>
          )}
        </div>
        {program.features && program.features.length > 0 && (
          <ul className="mt-4 space-y-2">
            {program.features.slice(0, 3).map((feature, idx) => (
              <li key={idx} className="text-gray-400 text-sm flex items-center">
                <span className="text-primary-red mr-2">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
};

export default ProgramCard;

