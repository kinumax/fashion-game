/* Design philosophy: Continental Editorial — the app is a moving fashion magazine, not a generic dashboard. */
import ErrorBoundary from "./components/ErrorBoundary";
import GameCanvas from "./components/GameCanvas";

export default function App() {
  return <ErrorBoundary><GameCanvas /></ErrorBoundary>;
}
