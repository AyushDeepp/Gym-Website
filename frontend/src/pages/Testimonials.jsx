import { motion } from 'framer-motion';
import SectionTitle from '../components/SectionTitle';
import TestimonialCard from '../components/TestimonialCard';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'John Doe',
      role: 'Bodybuilder',
      message:
        'Elite Gym transformed my life. The trainers are world-class and the facilities are top-notch. I\'ve achieved goals I never thought possible.',
    },
    {
      name: 'Jane Smith',
      role: 'Fitness Enthusiast',
      message:
        'Best gym experience I\'ve ever had. The community is amazing and the results speak for themselves. Highly recommend!',
    },
    {
      name: 'Mike Johnson',
      role: 'Athlete',
      message:
        'Professional training and state-of-the-art equipment. The personalized attention I receive here is unmatched.',
    },
    {
      name: 'Sarah Williams',
      role: 'Yoga Instructor',
      message:
        'The variety of classes and the quality of instruction is outstanding. I\'ve found my fitness home at Elite Gym.',
    },
    {
      name: 'David Brown',
      role: 'Marathon Runner',
      message:
        'The cardio equipment and training programs have helped me improve my running times significantly. Great place!',
    },
    {
      name: 'Emily Davis',
      role: 'Personal Trainer',
      message:
        'As a trainer myself, I can say Elite Gym has everything you need. The atmosphere is motivating and the staff is professional.',
    },
    {
      name: 'Chris Wilson',
      role: 'Weightlifter',
      message:
        'The strength training area is incredible. I\'ve been able to push my limits with the best equipment available.',
    },
    {
      name: 'Lisa Anderson',
      role: 'Fitness Beginner',
      message:
        'I was intimidated at first, but the welcoming community and supportive trainers made my fitness journey enjoyable.',
    },
    {
      name: 'Robert Taylor',
      role: 'Bodybuilder',
      message:
        'Five years at Elite Gym and I\'m still discovering new ways to improve. This place never stops evolving.',
    },
  ];

  return (
    <div className="page-padding">
      <div className="container-responsive max-w-container">
        <SectionTitle
          title="Member Testimonials"
          subtitle="Real stories from real people who transformed their lives"
          center
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;

