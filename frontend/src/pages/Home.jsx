import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import SectionTitle from "../components/SectionTitle";
import PlanCard from "../components/PlanCard";
import TestimonialCard from "../components/TestimonialCard";
import { useAuth } from "../context/AuthContext";
import { getPlans, getTransformations } from "../utils/api";
import {
  FiCompass,
  FiUsers,
  FiAward,
  FiActivity,
  FiTarget,
  FiHeart,
  FiBook,
  FiCoffee,
  FiTrendingUp,
  FiTool,
  FiDatabase,
  FiCalendar,
  FiImage,
  FiLayers,
  FiChevronLeft,
  FiChevronRight,
  FiBarChart2,
  FiCamera,
  FiUserCheck,
  FiArrowRight,
  FiLock,
} from "react-icons/fi";

const Home = () => {
  const { isAuthenticated, isMember, isVisitor } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [transformations, setTransformations] = useState([]);
  const [currentTransformIndex, setCurrentTransformIndex] = useState(0);

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
    {
      name: "Sarah Williams",
      role: "Yoga Instructor",
      message:
        "The variety of classes and expert guidance helped me achieve my fitness goals faster than I ever imagined.",
    },
    {
      name: "David Chen",
      role: "Marathon Runner",
      message:
        "Outstanding facilities and supportive community. This is more than a gym, it's a lifestyle transformation.",
    },
    {
      name: "Emily Rodriguez",
      role: "Personal Trainer",
      message:
        "As a trainer myself, I can confidently say Elite Gym has the best equipment and atmosphere in the city.",
    },
  ];

  // Value proposition cards
  const valueProps = [
    {
      icon: FiAward,
      title: "World-Class Facilities",
      text: "State-of-the-art equipment and premium amenities",
    },
    {
      icon: FiUsers,
      title: "Expert Trainers",
      text: "Certified professionals dedicated to your success",
    },
    {
      icon: FiTarget,
      title: "Personalized Programs",
      text: "Customized plans tailored to your fitness goals",
    },
    {
      icon: FiActivity,
      title: "Proven Results",
      text: "Thousands of successful transformations",
    },
    {
      icon: FiHeart,
      title: "Supportive Community",
      text: "Join a network of motivated fitness enthusiasts",
    },
    {
      icon: FiTrendingUp,
      title: "Continuous Progress",
      text: "Track and improve with advanced tools",
    },
  ];

  // Website features
  const websiteFeatures = [
    {
      icon: FiBook,
      title: "Workout Library",
      access: "Public",
      description: "Access hundreds of workout plans and exercises",
      path: "/dashboard/workouts",
      requiresAuth: true,
    },
    {
      icon: FiCoffee,
      title: "Diet Plans",
      access: "Member Only",
      description: "Personalized nutrition plans for your goals",
      path: "/dashboard/diet",
      requiresAuth: true,
    },
    {
      icon: FiTrendingUp,
      title: "Progress Tracking",
      access: "Member Only",
      description: "Monitor your fitness journey with detailed analytics",
      path: "/dashboard/progress",
      requiresAuth: true,
    },
    {
      icon: FiTool,
      title: "BMI/TDEE Tools",
      access: "Public",
      description: "Calculate your body metrics and caloric needs",
      path: "/tools",
      requiresAuth: false,
    },
    {
      icon: FiDatabase,
      title: "Exercise Database",
      access: "Public",
      description: "Comprehensive library of exercises with instructions",
      path: "/exercises",
      requiresAuth: false,
    },
    {
      icon: FiCalendar,
      title: "Class Timetable",
      access: "Public",
      description: "View and book fitness classes",
      path: "/timetable",
      requiresAuth: false,
    },
    {
      icon: FiImage,
      title: "Transformation Wall",
      access: "Public",
      description: "Get inspired by real member success stories",
      path: "/transformations",
      requiresAuth: false,
    },
    {
      icon: FiLayers,
      title: "Programs Preview",
      access: "Public",
      description: "Explore our fitness programs and offerings",
      path: "/programs",
      requiresAuth: false,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, transformationsRes] = await Promise.all([
          getPlans(),
          getTransformations({ params: { approved: true, featured: true } }),
        ]);
        setPlans(plansRes.data.slice(0, 3));
        setTransformations(transformationsRes.data.slice(0, 6));
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

  // Auto-rotate transformation carousel
  useEffect(() => {
    if (transformations.length > 1) {
      const interval = setInterval(() => {
        setCurrentTransformIndex((prev) => (prev + 1) % transformations.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [transformations.length]);

  const handleRoleNavigation = (role) => {
    if (role === "exploring") {
      navigate("/programs");
    } else if (role === "join") {
      navigate("/plans");
    } else if (role === "member" && isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const getCTAText = () => {
    if (!isAuthenticated) return "Create Account";
    if (isVisitor) return "Become a Member";
    if (isMember) return "Continue Your Journey";
    return "Get Started";
  };

  const getCTALink = () => {
    if (!isAuthenticated) return "/login";
    if (isVisitor) return "/plans";
    if (isMember) return "/dashboard";
    return "/plans";
  };

  return (
    <div>
      <Hero />

      {/* User Role Quick Navigation Panel */}
      <section className="section-padding bg-primary-dark">
        <div className="container-responsive max-w-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {isMember ? (
              // Member Panel
              <div className="bg-primary-gray rounded-xl p-4 sm:p-6 md:p-8 border-2 border-primary-red">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-primary-red/20 rounded-lg flex-shrink-0">
                    <FiUserCheck className="text-2xl sm:text-3xl text-primary-red" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                      Member Dashboard
                    </h2>
                    <p className="text-gray-400 text-xs sm:text-sm md:text-base hidden sm:block">
                      Access all premium features and track your progress
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {[
                    {
                      icon: FiActivity,
                      title: "Check-In",
                      description: "Track gym attendance",
                      path: "/dashboard/attendance",
                    },
                    {
                      icon: FiBook,
                      title: "Workout Library",
                      description: "Assigned programs & demos",
                      path: "/dashboard/workouts",
                    },
                    {
                      icon: FiCoffee,
                      title: "Nutrition Hub",
                      description: "Meal plans & macros",
                      path: "/dashboard/diet",
                    },
                    {
                      icon: FiBarChart2,
                      title: "Progress Tracker",
                      description: "Log stats & charts",
                      path: "/dashboard/progress",
                    },
                    {
                      icon: FiCamera,
                      title: "Transformation",
                      description: "Submit spotlight story",
                      path: "/dashboard/transformation-submit",
                    },
                    {
                      icon: FiDatabase,
                      title: "Exercise Database",
                      description: "Browse all exercises",
                      path: "/exercises",
                    },
                  ].map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        onClick={() => navigate(feature.path)}
                        className="bg-primary-darker p-3 sm:p-4 md:p-5 rounded-lg border-2 border-primary-lightGray hover:border-primary-red cursor-pointer transition-all group"
                      >
                        <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div className="p-1.5 sm:p-2 bg-primary-red/20 rounded-lg group-hover:bg-primary-red/30 transition-colors flex-shrink-0">
                            <Icon className="text-lg sm:text-xl text-primary-red" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-0.5 sm:mb-1 line-clamp-1">
                              {feature.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 hidden sm:block">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center text-primary-red text-xs sm:text-sm font-semibold group-hover:gap-2 transition-all">
                          <span className="hidden sm:inline">Access Now</span>
                          <span className="sm:hidden">Access</span>
                          <FiArrowRight className="ml-1 text-xs sm:text-sm group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="mt-4 sm:mt-6 text-center">
                  <Link to="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base bg-primary-red text-white font-semibold rounded-lg glow-red hover:bg-opacity-90 transition-all"
                    >
                      Go to Full Dashboard
                    </motion.button>
                  </Link>
                </div>
              </div>
            ) : isVisitor ? (
              // Visitor Panel
              <div className="bg-primary-gray rounded-xl p-4 sm:p-6 md:p-8 border-2 border-primary-blue">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-primary-blue/20 rounded-lg flex-shrink-0">
                    <FiUsers className="text-2xl sm:text-3xl text-primary-blue" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                      Visitor Panel
                    </h2>
                    <p className="text-gray-400 text-xs sm:text-sm md:text-base hidden sm:block">
                      Explore available features. Upgrade to unlock premium
                      access
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {[
                    {
                      icon: FiBook,
                      title: "Workout Library",
                      description: "Browse workout plans (limited access)",
                      path: "/dashboard/workouts",
                      available: true,
                    },
                    {
                      icon: FiDatabase,
                      title: "Exercise Database",
                      description: "Comprehensive exercise library",
                      path: "/exercises",
                      available: true,
                    },
                    {
                      icon: FiTool,
                      title: "BMI/TDEE Tools",
                      description: "Calculate body metrics",
                      path: "/tools",
                      available: true,
                    },
                    {
                      icon: FiCalendar,
                      title: "Class Timetable",
                      description: "View fitness class schedule",
                      path: "/timetable",
                      available: true,
                    },
                    {
                      icon: FiImage,
                      title: "Transformations",
                      description: "View success stories",
                      path: "/transformations",
                      available: true,
                    },
                    {
                      icon: FiCoffee,
                      title: "Diet Plans",
                      description: "Personalized nutrition plans",
                      path: "/dashboard/diet",
                      available: false,
                      locked: true,
                    },
                    {
                      icon: FiBarChart2,
                      title: "Progress Tracking",
                      description: "Monitor your fitness journey",
                      path: "/dashboard/progress",
                      available: false,
                      locked: true,
                    },
                    {
                      icon: FiActivity,
                      title: "Check-In",
                      description: "Track gym attendance",
                      path: "/dashboard/attendance",
                      available: false,
                      locked: true,
                    },
                  ].map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={feature.available ? { y: -5 } : {}}
                        onClick={() =>
                          feature.available
                            ? navigate(feature.path)
                            : navigate("/plans")
                        }
                        className={`bg-primary-darker p-3 sm:p-4 md:p-5 rounded-lg border-2 transition-all ${
                          feature.available
                            ? "border-primary-lightGray hover:border-primary-blue cursor-pointer group"
                            : "border-primary-lightGray/50 opacity-75 cursor-pointer group"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div
                            className={`p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0 ${
                              feature.available
                                ? "bg-primary-blue/20 group-hover:bg-primary-blue/30"
                                : "bg-gray-500/20"
                            }`}
                          >
                            <Icon
                              className={`text-lg sm:text-xl ${
                                feature.available
                                  ? "text-primary-blue"
                                  : "text-gray-500"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                              <h3
                                className={`text-sm sm:text-base md:text-lg font-bold line-clamp-1 ${
                                  feature.available
                                    ? "text-white"
                                    : "text-gray-500"
                                }`}
                              >
                                {feature.title}
                              </h3>
                              {feature.locked && (
                                <FiLock className="text-gray-500 text-xs sm:text-sm flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 hidden sm:block">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`flex items-center text-xs sm:text-sm font-semibold transition-all ${
                            feature.available
                              ? "text-primary-blue group-hover:gap-2"
                              : "text-gray-500"
                          }`}
                        >
                          <span className="line-clamp-1">
                            {feature.available ? (
                              <>
                                <span className="hidden sm:inline">
                                  Access Now
                                </span>
                                <span className="sm:hidden">Access</span>
                              </>
                            ) : (
                              <>
                                <span className="hidden sm:inline">
                                  Upgrade to Unlock
                                </span>
                                <span className="sm:hidden">Upgrade</span>
                              </>
                            )}
                          </span>
                          <FiArrowRight
                            className={`ml-1 text-xs sm:text-sm transition-transform flex-shrink-0 ${
                              feature.available
                                ? "group-hover:translate-x-1"
                                : ""
                            }`}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link to="/plans">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base bg-primary-red text-white font-semibold rounded-lg glow-red hover:bg-opacity-90 transition-all"
                    >
                      Become a Member
                    </motion.button>
                  </Link>
                  <Link to="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-primary-blue text-primary-blue font-semibold rounded-lg hover:bg-primary-blue hover:text-white transition-all"
                    >
                      Go to Dashboard
                    </motion.button>
                  </Link>
                </div>
              </div>
            ) : (
              // Non-logged in Panel
              <div className="bg-primary-gray rounded-xl p-4 sm:p-6 md:p-8 border-2 border-primary-lightGray">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-primary-blue/20 rounded-lg flex-shrink-0">
                    <FiCompass className="text-2xl sm:text-3xl text-primary-blue" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                      Explore Elite Gym
                    </h2>
                    <p className="text-gray-400 text-xs sm:text-sm md:text-base hidden sm:block">
                      Discover what we offer and start your fitness journey
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {[
                    {
                      icon: FiTool,
                      title: "Health Tools",
                      description: "BMI & TDEE calculators",
                      path: "/tools",
                    },
                    {
                      icon: FiDatabase,
                      title: "Exercise Database",
                      description: "Browse exercises",
                      path: "/exercises",
                    },
                    {
                      icon: FiCalendar,
                      title: "Class Schedule",
                      description: "View timetable",
                      path: "/timetable",
                    },
                    {
                      icon: FiImage,
                      title: "Success Stories",
                      description: "Member transformations",
                      path: "/transformations",
                    },
                    {
                      icon: FiLayers,
                      title: "Programs",
                      description: "Fitness programs",
                      path: "/programs",
                    },
                    {
                      icon: FiUsers,
                      title: "Trainers",
                      description: "Meet our experts",
                      path: "/trainers",
                    },
                    {
                      icon: FiAward,
                      title: "About Us",
                      description: "Learn more",
                      path: "/about",
                    },
                    {
                      icon: FiActivity,
                      title: "Get Started",
                      description: "Join Elite Gym",
                      path: "/plans",
                    },
                  ].map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        onClick={() => navigate(feature.path)}
                        className="bg-primary-darker p-3 sm:p-4 md:p-5 rounded-lg border-2 border-primary-lightGray hover:border-primary-blue cursor-pointer transition-all group"
                      >
                        <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div className="p-1.5 sm:p-2 bg-primary-blue/20 rounded-lg group-hover:bg-primary-blue/30 transition-colors flex-shrink-0">
                            <Icon className="text-lg sm:text-xl text-primary-blue" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-0.5 sm:mb-1 line-clamp-1">
                              {feature.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 hidden sm:block">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center text-primary-blue text-xs sm:text-sm font-semibold group-hover:gap-2 transition-all">
                          <span>Explore</span>
                          <FiArrowRight className="ml-1 text-xs sm:text-sm group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link to="/plans">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base bg-primary-red text-white font-semibold rounded-lg glow-red hover:bg-opacity-90 transition-all"
                    >
                      Get Started
                    </motion.button>
                  </Link>
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-primary-blue text-primary-blue font-semibold rounded-lg hover:bg-primary-blue hover:text-white transition-all"
                    >
                      Sign In
                    </motion.button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Why Elite Gym - Value Proposition Cards */}
      <section className="section-padding">
        <div className="container-responsive max-w-container">
          <SectionTitle
            title="Why Elite Gym"
            subtitle="Experience the difference that sets us apart"
            center
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {valueProps.map((prop, index) => {
              const Icon = prop.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-primary-gray rounded-xl p-4 sm:p-6 md:p-8 border-2 border-primary-lightGray hover:border-primary-blue transition-all"
                >
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                    <div className="p-2 sm:p-2.5 md:p-3 bg-primary-red/20 rounded-lg flex-shrink-0">
                      <Icon className="text-2xl sm:text-2xl md:text-3xl text-primary-red" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">
                      {prop.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm sm:text-base">
                    {prop.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Short About Section */}
      <section className="section-padding bg-primary-dark">
        <div className="container-responsive max-w-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12"
          >
            <div className="w-full lg:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop"
                alt="Elite Gym"
                className="w-full h-auto rounded-xl object-cover"
              />
            </div>
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                <span className="gradient-text-red">Elite Gym</span> - Where
                Excellence Meets Fitness
              </h2>
              <p className="text-lg sm:text-xl text-gray-300 mb-4 font-semibold">
                We're not just a gym—we're a movement. A community of
                individuals committed to pushing boundaries, breaking limits,
                and achieving the extraordinary.
              </p>
              <p className="text-base sm:text-lg text-gray-400">
                With cutting-edge facilities, world-class trainers, and a
                passion for transformation, Elite Gym is where your fitness
                journey becomes legendary.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Website Features Grid */}
      <section className="section-padding">
        <div className="container-responsive max-w-container">
          <SectionTitle
            title="Website Features"
            subtitle="Discover powerful tools to enhance your fitness journey"
            center
          />
          {/* Mobile: Horizontal Infinite Scroll */}
          <div className="block sm:hidden relative overflow-hidden">
            {/* Gradient overlays for fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10 pointer-events-none" />

            {/* Infinite scrolling container */}
            <div className="overflow-hidden">
              <div className="website-features-scroll flex gap-4">
                {/* Duplicate features for seamless infinite scroll */}
                {[...websiteFeatures, ...websiteFeatures].map(
                  (feature, index) => {
                    const Icon = feature.icon;
                    const handleClick = () => {
                      if (feature.requiresAuth && !isAuthenticated) {
                        navigate("/login", {
                          state: { from: { pathname: feature.path } },
                        });
                      } else {
                        navigate(feature.path);
                      }
                    };

                    return (
                      <div
                        key={`feature-mobile-${index}`}
                        className="flex-shrink-0 w-[280px]"
                      >
                        <motion.div
                          whileHover={{ y: -5 }}
                          onClick={handleClick}
                          className="bg-primary-gray rounded-xl p-5 border-2 border-primary-lightGray hover:border-primary-blue transition-all cursor-pointer h-full"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-primary-blue/20 rounded-lg">
                              <Icon className="text-xl text-primary-blue" />
                            </div>
                            <span
                              className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                feature.access === "Public"
                                  ? "bg-primary-blue/20 text-primary-blue"
                                  : "bg-primary-red/20 text-primary-red"
                              }`}
                            >
                              {feature.access}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-xs text-gray-400 line-clamp-2">
                            {feature.description}
                          </p>
                        </motion.div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {websiteFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const handleClick = () => {
                if (feature.requiresAuth && !isAuthenticated) {
                  navigate("/login", {
                    state: { from: { pathname: feature.path } },
                  });
                } else {
                  navigate(feature.path);
                }
              };

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  onClick={handleClick}
                  className="bg-primary-gray rounded-xl p-6 border-2 border-primary-lightGray hover:border-primary-blue transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-primary-blue/20 rounded-lg">
                      <Icon className="text-2xl text-primary-blue" />
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        feature.access === "Public"
                          ? "bg-primary-blue/20 text-primary-blue"
                          : "bg-primary-red/20 text-primary-red"
                      }`}
                    >
                      {feature.access}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Transformation Carousel with CTA */}
      {transformations.length > 0 && (
        <section className="section-padding bg-primary-dark">
          <div className="container-responsive max-w-container">
            <SectionTitle
              title="Transformations"
              subtitle="Real results from real members"
              center
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative h-96 sm:h-[500px] rounded-xl overflow-hidden border-2 border-primary-lightGray">
                {transformations.map((transform, index) => (
                  <motion.div
                    key={transform._id}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: index === currentTransformIndex ? 1 : 0,
                      scale: index === currentTransformIndex ? 1 : 1.1,
                    }}
                    transition={{ duration: 0.5 }}
                    className={`absolute inset-0 ${
                      index === currentTransformIndex ? "z-10" : "z-0"
                    }`}
                  >
                    <div className="relative h-full">
                      <img
                        src={transform.afterImage}
                        alt="Transformation"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
                        <p className="text-sm sm:text-base mb-2 line-clamp-2">
                          {transform.story}
                        </p>
                        <Link
                          to="/transformations"
                          className="text-primary-blue hover:text-primary-red font-semibold text-sm sm:text-base inline-flex items-center gap-2"
                        >
                          View Full Story
                          <FiChevronRight />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {transformations.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentTransformIndex(
                        (prev) =>
                          (prev - 1 + transformations.length) %
                          transformations.length
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
                  >
                    <FiChevronLeft className="text-2xl" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentTransformIndex(
                        (prev) => (prev + 1) % transformations.length
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
                  >
                    <FiChevronRight className="text-2xl" />
                  </button>
                  <div className="flex justify-center gap-2 mt-4">
                    {transformations.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTransformIndex(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentTransformIndex
                            ? "w-8 bg-primary-red"
                            : "w-2 bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
            <div className="text-center mt-8">
              <Link to="/transformations">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-primary-red text-white font-semibold rounded-lg glow-red hover:bg-opacity-90 transition-all"
                >
                  View All Transformations
                </motion.button>
              </Link>
            </div>
          </div>
        </section>
      )}

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

      {/* Testimonials Section - Infinite Horizontal Scroll */}
      <section className="section-padding bg-primary-dark overflow-hidden">
        <div className="container-responsive max-w-container">
          <SectionTitle
            title="What Our Members Say"
            subtitle="Real stories from real people who transformed their lives"
            center
          />
          <div className="relative">
            {/* Gradient overlays for fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-primary-dark to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-primary-dark to-transparent z-10 pointer-events-none" />

            {/* Infinite scrolling container */}
            <div className="overflow-hidden">
              <div className="testimonial-scroll flex gap-6 sm:gap-8">
                {/* Duplicate testimonials for seamless infinite scroll */}
                {[...testimonials, ...testimonials].map(
                  (testimonial, index) => (
                    <div
                      key={`testimonial-${index}`}
                      className="flex-shrink-0 w-[280px] sm:w-[400px]"
                    >
                      <TestimonialCard
                        testimonial={testimonial}
                        index={index % testimonials.length}
                        disableAnimation={true}
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart CTA Footer */}
      <section className="section-padding">
        <div className="container-responsive max-w-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary-red to-primary-blue rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              {isMember
                ? "Continue Your Journey"
                : isVisitor
                ? "Become a Member"
                : "Ready to Start Your Fitness Journey?"}
            </h2>
            <p className="text-white/90 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              {isMember
                ? "Access your dashboard and keep pushing towards your goals"
                : isVisitor
                ? "Upgrade to a full membership and unlock all features"
                : "Join thousands of members who have transformed their lives at Elite Gym"}
            </p>
            <Link to={getCTALink()}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-white text-primary-red font-semibold rounded-lg hover:bg-gray-100 transition-all"
              >
                {getCTAText()}
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
