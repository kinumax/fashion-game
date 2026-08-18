// Starlit Pulse style: the React shell stays quiet so the live stage owns the screen.
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import RhythmGame from "./components/RhythmGame";

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><RhythmGame /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
