
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || 
    (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  useEffect(() => {
    // Aplicar tema quando o componente montar
    applyTheme(isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    applyTheme(!isDarkMode);
  };

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const getButtonClass = () => {
    const baseClasses = "hover:bg-white/20";
    
    // Se estiver na página de login (fundo escuro)
    if (window.location.pathname.includes("login")) {
      return `${baseClasses} text-white hover:text-white`;
    }
    
    // Se estiver no dashboard
    if (isDarkMode) {
      return `${baseClasses} text-white hover:text-white`;
    } else {
      return `${baseClasses} text-gray-700 hover:text-gray-900`;
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className={getButtonClass()}
      title={isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </Button>
  );
}
