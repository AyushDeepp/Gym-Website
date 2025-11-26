import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      // Force scroll position
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };

    // Immediate scroll
    scrollToTop();
    
    // Also try after a small delay to catch any late renders
    const timeoutId = setTimeout(scrollToTop, 0);
    
    // And after animation frame
    requestAnimationFrame(scrollToTop);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
