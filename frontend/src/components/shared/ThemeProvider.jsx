import { useEffect } from "react";
import { useSelector } from "react-redux";

/**
 * ThemeProvider
 * Reads theme from Redux (persisted), applies `dark` class to <html>.
 * This ensures the Tailwind dark-mode class strategy works globally.
 */
const ThemeProvider = ({ children }) => {
  const { theme } = useSelector((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return children;
};

export default ThemeProvider;
