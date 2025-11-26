import { motion } from 'framer-motion';
import SectionTitle from '../components/SectionTitle';
import {
  FiAward,
  FiTarget,
  FiClock,
  FiUsers,
  FiTrendingUp,
} from 'react-icons/fi';
import { FaDumbbell } from 'react-icons/fa';

const About = () => {
  const features = [
    {
      icon: FaDumbbell,
      title: 'State-of-the-Art Equipment',
      description: 'Latest fitness equipment from world-renowned brands',
    },
    {
      icon: FiAward,
      title: 'Expert Trainers',
      description: 'Certified professionals with years of experience',
    },
    {
      icon: FiTarget,
      title: 'Personalized Programs',
      description: 'Customized workout plans tailored to your goals',
    },
    {
      icon: FiClock,
      title: 'Flexible Timings',
      description: 'Open 24/7 to fit your busy schedule',
    },
    {
      icon: FiUsers,
      title: 'Community Support',
      description: 'Join a supportive community of fitness enthusiasts',
    },
    {
      icon: FiTrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your progress with advanced tracking tools',
    },
  ];

  return (
    <div className="page-padding">
      {/* Hero Section */}
      <section className="section-padding">
        <div className="container-responsive max-w-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              <span className="gradient-text-red">About</span>{' '}
              <span className="text-white">Elite Gym</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed px-4">
              We are more than just a gym. We are a community dedicated to helping you achieve
              your fitness goals and transform your life. With world-class facilities, expert
              trainers, and a supportive environment, we provide everything you need to succeed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-primary-dark">
        <div className="container-responsive max-w-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold gradient-text-red mb-3 sm:mb-4">Our Mission</h2>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                To empower individuals to achieve their fitness goals through world-class
                facilities, expert guidance, and a supportive community. We believe that
                everyone deserves access to the tools and knowledge needed to live a healthy,
                active lifestyle.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold gradient-text-blue mb-3 sm:mb-4">Our Vision</h2>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                To become the leading fitness destination, recognized for excellence in training,
                innovation in fitness technology, and commitment to member success. We envision
                a future where fitness is accessible, enjoyable, and transformative for everyone.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="container-responsive max-w-container">
          <SectionTitle
            title="Why Choose Us"
            subtitle="Discover what makes Elite Gym the perfect choice for your fitness journey"
            center
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-primary-gray rounded-xl p-5 sm:p-6 border border-primary-lightGray hover:border-primary-red transition-all"
                >
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 text-primary-red">
                    <IconComponent />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding bg-primary-dark">
        <div className="container-responsive max-w-container">
          <div className="max-w-4xl mx-auto">
            <SectionTitle
              title="Our Story"
              subtitle=""
              center
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4 sm:space-y-6 text-sm sm:text-base text-gray-300 leading-relaxed"
            >
              <p>
                Elite Gym was founded with a simple yet powerful vision: to create a fitness
                facility that goes beyond the ordinary. We recognized that many people struggle
                to find a gym that combines top-notch equipment, expert guidance, and a
                welcoming community.
              </p>
              <p>
                Since our inception, we've been committed to providing an exceptional fitness
                experience. Our team of certified trainers brings years of experience and
                passion to every session. We've invested in the latest equipment and technology
                to ensure you have everything you need to succeed.
              </p>
              <p>
                But what truly sets us apart is our community. We believe that fitness is a
                journey best taken together. Our members support and motivate each other,
                creating an environment where everyone can thrive. Whether you're a beginner
                taking your first steps or an experienced athlete pushing your limits, you'll
                find a home at Elite Gym.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

