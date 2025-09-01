import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, search } = useLocation(); // include query string

  useEffect(() => {
    const scrollToTop = () => {
      const start = window.scrollY;
      const duration = 600; // animation duration in ms
      let startTime = null;

      // easing function (ease-in then fast-out)
      const easeInFlashOut = (t) => t * t * (2 - t);

      const animation = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        window.scrollTo(0, start * (1 - easeInFlashOut(progress)));

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      };

      requestAnimationFrame(animation);
    };

    scrollToTop();
  }, [pathname, search]); // depend on both

  return null;
};

export default ScrollToTop;