import { motion } from 'framer-motion';

const SectionTitle = ({ title, subtitle, center = false }) => {
  return (
    <div className={`mb-12 ${center ? 'text-center' : ''}`}>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-bold mb-4"
      >
        <span className="gradient-text-red">{title}</span>
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-400 text-lg"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};

export default SectionTitle;

