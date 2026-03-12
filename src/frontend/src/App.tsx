import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useMyProfile } from "./hooks/useQueries";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";

// Root route with auth logic wrapper
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: ProtectedDashboard,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProtectedProfile,
});

function ProtectedDashboard() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const { data: profile, isLoading } = useMyProfile();

  if (isInitializing || isFetching || isLoading) {
    return <LoadingScreen />;
  }

  if (!identity) {
    window.location.href = "/";
    return null;
  }

  if (actor && !isLoading && profile === null) {
    window.location.href = "/register";
    return null;
  }

  return <DashboardPage />;
}

function ProtectedProfile() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const { data: profile, isLoading } = useMyProfile();

  if (isInitializing || isFetching || isLoading) {
    return <LoadingScreen />;
  }

  if (!identity) {
    window.location.href = "/";
    return null;
  }

  if (actor && !isLoading && profile === null) {
    window.location.href = "/register";
    return null;
  }

  return <ProfilePage />;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <img
          src="/assets/generated/logo-agrix-transparent.dim_120x120.png"
          alt="Smart Farming AI Marketplace"
          className="w-16 h-16 opacity-80"
        />
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-body">Loading...</p>
      </div>
    </div>
  );
}

const routeTree = rootRoute.addChildren([
  landingRoute,
  registerRoute,
  dashboardRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
