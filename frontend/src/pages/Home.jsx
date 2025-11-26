import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import SectionTitle from "../components/SectionTitle";
import ProgramCard from "../components/ProgramCard";
import TrainerCard from "../components/TrainerCard";
import PlanCard from "../components/PlanCard";
import TestimonialCard from "../components/TestimonialCard";
import Counter from "../components/Counter";
import { getPrograms, getTrainers, getPlans } from "../utils/api";

const Home = () => {
  const [programs, setPrograms] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [stats] = useState([
    { number: "5000+", label: "Active Members" },
    { number: "50+", label: "Expert Trainers" },
    { number: "100+", label: "Classes Weekly" },
    { number: "15+", label: "Years Experience" },
  ]);

  // Ensure page starts at top on mount
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Immediate
    scrollToTop();

    // After render
    requestAnimationFrame(() => {
      scrollToTop();
      setTimeout(scrollToTop, 0);
    });
  }, []);

  const testimonials = [
    {
      name: "John Doe",
      role: "Bodybuilder",
      message:
        "Elite Gym transformed my life. The trainers are world-class and the facilities are top-notch.",
    },
    {
      name: "Jane Smith",
      role: "Fitness Enthusiast",
      message:
        "Best gym experience I've ever had. The community is amazing and the results speak for themselves.",
    },
    {
      name: "Mike Johnson",
      role: "Athlete",
      message:
        "Professional training and state-of-the-art equipment. Highly recommend to anyone serious about fitness.",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programsRes, trainersRes, plansRes] = await Promise.all([
          getPrograms(),
          getTrainers(),
          getPlans(),
        ]);
        setPrograms(programsRes.data.slice(0, 3));
        setTrainers(trainersRes.data.slice(0, 3));
        setPlans(plansRes.data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();

    // Refetch on focus to get latest data
    const handleFocus = () => {
      fetchData();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return (
    <div>
      <Hero />

      {/* Stats Section */}
      <section className="section-padding bg-primary-dark">
        <div className="container-responsive max-w-container">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold gradient-text-red mb-1 sm:mb-2">
                  <Counter value={stat.number} />
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm md:text-base">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="section-padding">
        <div className="container-responsive max-w-container">
          <SectionTitle
            title="Our Programs"
            subtitle="Choose from a variety of fitness programs designed to help you achieve your goals"
            center
          />
          {programs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
              {programs.map((program, index) => (
                <ProgramCard
                  key={program._id}
                  program={program}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8 sm:py-12">
              <p>Loading programs...</p>
            </div>
          )}
          <div className="text-center">
            <Link to="/programs">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base border-2 border-primary-blue text-primary-blue font-semibold rounded-lg hover:bg-primary-blue hover:text-white transition-all"
              >
                View All Programs
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trainers Section */}
      <section className="section-padding bg-primary-dark">
        <div className="container-responsive max-w-container">
          <SectionTitle
            title="Expert Trainers"
            subtitle="Meet our world-class trainers dedicated to your success"
            center
          />
          {trainers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
              {trainers.map((trainer, index) => (
                <TrainerCard
                  key={trainer._id}
                  trainer={trainer}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8 sm:py-12">
              <p>Loading trainers...</p>
            </div>
          )}
          <div className="text-center">
            <Link to="/trainers">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base border-2 border-primary-red text-primary-red font-semibold rounded-lg hover:bg-primary-red hover:text-white transition-all"
              >
                Meet All Trainers
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Membership Plans Preview */}
      <section className="section-padding">
        <div className="container-responsive max-w-container">
          <SectionTitle
            title="Membership Plans"
            subtitle="Choose the perfect plan for your fitness journey"
            center
          />
          {plans.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
              {plans.map((plan, index) => (
                <PlanCard key={plan._id} plan={plan} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8 sm:py-12">
              <p>Loading plans...</p>
            </div>
          )}
          <div className="text-center">
            <Link to="/plans">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base bg-primary-red text-white font-semibold rounded-lg glow-red hover:bg-opacity-90 transition-all"
              >
                View All Plans
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-primary-dark">
        <div className="container-responsive max-w-container">
          <SectionTitle
            title="What Our Members Say"
            subtitle="Real stories from real people who transformed their lives"
            center
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-responsive max-w-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary-red to-primary-blue rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Ready to Start Your Fitness Journey?
            </h2>
            <p className="text-white/90 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Join thousands of members who have transformed their lives at
              Elite Gym
            </p>
            <Link to="/plans">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-white text-primary-red font-semibold rounded-lg hover:bg-gray-100 transition-all"
              >
                Get Started Today
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
