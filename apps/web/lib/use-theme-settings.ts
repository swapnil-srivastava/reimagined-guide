import { useTheme } from "next-themes";

export function useThemeSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  const [color, mode] = theme ? theme.split('-') : ['blue', 'light'];
  
  const setColor = (newColor: string) => {
    setTheme(`${newColor}-${mode}`);
  };
  
  const setMode = (newMode: string) => {
    setTheme(`${color}-${newMode}`);
  };
  
  return {
    color,
    mode,
    setColor,
    setMode,
    theme: resolvedTheme,
  };
}
