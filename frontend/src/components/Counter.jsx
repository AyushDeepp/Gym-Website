import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

const Counter = ({ value, suffix = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);

  // Extract number from value (handles formats like "5000+", "50+", etc.)
  const numValue = parseInt(value.replace(/\D/g, ''));
  const hasPlus = value.includes('+');

  useEffect(() => {
    if (isInView) {
      let startTime = null;
      const duration = 2000; // 2 seconds
      const startValue = 0;
      const endValue = numValue;

      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
        
        setCount(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(endValue);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, numValue]);

  return (
    <span ref={ref}>
      {count}{hasPlus ? '+' : ''}{suffix}
    </span>
  );
};

export default Counter;

