import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Import all pages
import Login from "./pages/Login";
import RoleSelect from "./pages/RoleSelect";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import WaitingRoom from "./pages/WaitingRoom";
import Playing from "./pages/Playing";
import Solo from "./pages/Solo";
import SoloPlaying from "./pages/SoloPlaying";
import SoloResults from "./pages/SoloResults";

import UsernameSelection from "./pages/UsernameSelection";

function Router() {
  return (
    <Switch>
      {/* Auth & Role Selection */}
      <Route path={"/"} component={Login} />
      <Route path={"/role-select"} component={RoleSelect} />
      
      {/* Room Owner Routes */}
      <Route path={"/room/create"} component={CreateRoom} />
      <Route path={"/room/:code/waiting"} component={WaitingRoom} />
      <Route path={"/room/:code/playing"} component={Playing} />
      
      {/* Player Routes */}
      <Route path={"/room/join"} component={JoinRoom} />
      
      {/* Solo Mode Routes */}
      <Route path={"/solo"} component={Solo} />
      <Route path={"/solo/playing"} component={SoloPlaying} />
      <Route path={"/solo/results"} component={SoloResults} />
      
      {/* 404 */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
