import { useEffect, useRef } from "react";
import { Switch, Route, Redirect, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Resources from "@/pages/Resources";
import ResourceDetail from "@/pages/ResourceDetail";
import Journal from "@/pages/Journal";
import JournalNew from "@/pages/JournalNew";
import JournalDetail from "@/pages/JournalDetail";
import Affirmations from "@/pages/Affirmations";
import Journey from "@/pages/Journey";
import Emergency from "@/pages/Emergency";
import DailyPractice from "@/pages/DailyPractice";
import VideoLibrary from "@/pages/VideoLibrary";
import LiveSessions from "@/pages/LiveSessions";
import Membership from "@/pages/Membership";
import Booking from "@/pages/Booking";
import Admin from "@/pages/Admin";
import LandingPage from "@/pages/LandingPage";
import NotFound from "@/pages/not-found";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(150deg, hsl(340 65% 28%) 0%, hsl(320 50% 22%) 55%, hsl(280 45% 20%) 100%)" }}>
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(150deg, hsl(340 65% 28%) 0%, hsl(320 50% 22%) 55%, hsl(280 45% 20%) 100%)" }}>
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function ProtectedLayout() {
  return (
    <>
      <Show when="signed-in">
        <Layout>
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/resources" component={Resources} />
            <Route path="/resources/:id">
              {(params) => <ResourceDetail id={params.id ?? ""} />}
            </Route>
            <Route path="/journal" component={Journal} />
            <Route path="/journal/new" component={JournalNew} />
            <Route path="/journal/:id">
              {(params) => <JournalDetail id={params.id ?? ""} />}
            </Route>
            <Route path="/affirmations" component={Affirmations} />
            <Route path="/journey" component={Journey} />
            <Route path="/daily" component={DailyPractice} />
            <Route path="/videos" component={VideoLibrary} />
            <Route path="/live" component={LiveSessions} />
            <Route path="/booking" component={Booking} />
            <Route path="/admin" component={Admin} />
            <Route path="/membership" component={Membership} />
            <Route path="/emergency" component={Emergency} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route component={ProtectedLayout} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
