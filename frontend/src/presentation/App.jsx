import { useCallback, useEffect, useState } from "react";
import AppHome from "./pages/app-home";
import AuthPage from "./pages/auth";
import JoinInvitePage from "./pages/join-invite";
import LandingPage from "./pages/landing";
import ProfilePage from "./pages/profile";
import ServerPage from "./pages/server";
import { toServerDto } from "../application/dto/mappers.js";
import {
  clearAuthSessionUseCase,
  getStoredSessionUseCase,
  joinInvitationUseCase,
  resolveInvitationUseCase,
  saveAuthSessionUseCase,
} from "./composition/container.js";

function getRoute(pathname = window.location.pathname) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "invite" && segments[1]) {
    return { screen: "join-invite", inviteCode: decodeURIComponent(segments[1]) };
  }

  if (pathname === "/register") return { screen: "register" };
  if (pathname === "/login") return { screen: "login" };
  if (pathname === "/app/profile") return { screen: "profile" };
  if (pathname === "/app") return { screen: "home" };

  return { screen: "landing" };
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredSessionUseCase.execute());
  const [selectedServer, setSelectedServer] = useState(null);
  const [userServers, setUserServers] = useState([]);
  const [pendingInvite, setPendingInvite] = useState(null);
  const [authNotice, setAuthNotice] = useState("");
  const [route, setRoute] = useState(() => {
    const initialRoute = getRoute();

    if (["home", "profile"].includes(initialRoute.screen) && !currentUser) {
      window.history.replaceState({}, "", "/login");
      return { screen: "login" };
    }

    return initialRoute;
  });

  const navigate = useCallback((path, { replace = false } = {}) => {
    if (replace) {
      window.history.replaceState({}, "", path);
    } else {
      window.history.pushState({}, "", path);
    }

    setRoute(getRoute(path));
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleServersLoaded = useCallback((servers) => {
    setUserServers(servers);
  }, []);

  const handleServerJoined = useCallback((server) => {
    setUserServers((currentServers) => {
      const alreadyExists = currentServers.some((currentServer) => currentServer.id === server.id);
      return alreadyExists ? currentServers : [...currentServers, server];
    });
    setSelectedServer(server);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const nextRoute = getRoute();

      if (["home", "profile"].includes(nextRoute.screen) && !currentUser) {
        window.history.replaceState({}, "", "/login");
        setRoute({ screen: "login" });
        return;
      }

      setRoute(nextRoute);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [currentUser]);

  const resolveInvite = useCallback(async (code) => {
    return resolveInvitationUseCase.execute({ code });
  }, []);

  async function joinInviteWithCurrentSession(invite) {
    const data = await joinInvitationUseCase.execute({ code: invite.code });
    const joinedServer = data.server
      ? toServerDto(data.server, data.member?.role ?? "member")
      : invite.server;

    setPendingInvite(null);
    handleServerJoined(joinedServer);
    navigate("/app", { replace: true });
  }

  function handleJoinInvite(code) {
    navigate(`/invite/${encodeURIComponent(code.trim())}`);
  }

  async function handleInviteContinue(invite) {
    if (!currentUser) {
      setPendingInvite(invite);
      navigate("/login");
      return;
    }

    await joinInviteWithCurrentSession(invite);
  }

  async function handleAuthenticated(user, token) {
    const normalizedUser = saveAuthSessionUseCase.execute({ user, token });
    setCurrentUser(normalizedUser);
    setAuthNotice("");

    if (pendingInvite) {
      await joinInviteWithCurrentSession(pendingInvite);
      return;
    }

    navigate("/app", { replace: true });
  }

  function handleRegistered() {
    setAuthNotice("Tu cuenta fue creada. Ahora inicia sesión para continuar.");
    navigate("/login", { replace: true });
  }

  function handleAuthBack() {
    if (pendingInvite) {
      navigate(`/invite/${encodeURIComponent(pendingInvite.code)}`);
      return;
    }

    navigate("/");
  }

  function handleBackToLanding() {
    setPendingInvite(null);
    setSelectedServer(null);
    setUserServers([]);
    navigate("/");
  }

  function handleLogout() {
    setSelectedServer(null);
    setUserServers([]);
    setPendingInvite(null);
    setCurrentUser(null);
    clearAuthSessionUseCase.execute();
    navigate("/", { replace: true });
  }

  function handleProfileSaved(user) {
    const normalizedUser = saveAuthSessionUseCase.execute({ user });
    setCurrentUser(normalizedUser);
  }

  if (route.screen === "join-invite") {
    return (
      <JoinInvitePage
        code={route.inviteCode}
        currentUser={currentUser}
        onBack={handleBackToLanding}
        onContinue={handleInviteContinue}
        onLoadInvite={resolveInvite}
      />
    );
  }

  if (route.screen === "register" || route.screen === "login") {
    const mode = route.screen;

    return (
      <AuthPage
        key={mode}
        mode={mode}
        notice={mode === "login" ? authNotice : ""}
        helperText={
          pendingInvite
            ? `Crea una cuenta o inicia sesión para unirte a ${pendingInvite.server.name}.`
            : undefined
        }
        onAuthenticated={handleAuthenticated}
        onBack={handleAuthBack}
        onRegistered={handleRegistered}
        onSwitchMode={(nextMode) => navigate(`/${nextMode}`)}
      />
    );
  }

  if (route.screen === "landing") {
    return (
      <LandingPage
        currentUser={currentUser}
        onJoinInvite={handleJoinInvite}
        onLogin={() => navigate("/login")}
        onRegister={() => navigate("/register")}
        onEnterApp={() => navigate(currentUser ? "/app" : "/login")}
      />
    );
  }

  if (route.screen === "profile") {
    return (
      <ProfilePage
        currentUser={currentUser}
        onBack={() => navigate("/app")}
        onLogout={handleLogout}
        onSaved={handleProfileSaved}
      />
    );
  }

  if (selectedServer) {
    return (
      <ServerPage
        key={selectedServer.id}
        currentUser={currentUser}
        server={selectedServer}
        servers={userServers.length > 0 ? userServers : [selectedServer]}
        onBack={() => setSelectedServer(null)}
        onLogout={handleLogout}
        onProfile={() => navigate("/app/profile")}
        onServerJoined={handleServerJoined}
        onServerSelected={setSelectedServer}
      />
    );
  }

  if (!currentUser) return null;

  return (
    <AppHome
      currentUser={currentUser}
      onLogout={handleLogout}
      onProfile={() => navigate("/app/profile")}
      onServerJoined={handleServerJoined}
      onServerSelected={setSelectedServer}
      onServersLoaded={handleServersLoaded}
    />
  );
}

export default App;
