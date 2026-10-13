import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);

  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const appPublicSettings = {
    appName: "ChronoTwin-X",
    version: "1.0",
  };

  // Check existing login session
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser && typeof parsedUser === "object") {
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("user");
        }
      }
    } catch (error) {
      console.error("Authentication check failed:", error);

      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);

      setAuthError({
        type: "auth_error",
        message: "Unable to restore login session.",
      });
    } finally {
      setAuthChecked(true);
      setIsLoadingAuth(false);
    }
  }, []);

  // Login
  const login = (userData) => {
    try {
      if (!userData) {
        throw new Error("User data is required.");
      }

      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      setAuthError(null);

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      console.error("Login failed:", error);

      setAuthError({
        type: "login_error",
        message: "Unable to save login session.",
      });

      return {
        success: false,
        error,
      };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);

    navigate("/login", { replace: true });
  };

  // Navigate to login
  const navigateToLogin = () => {
    navigate("/login", { replace: true });
  };

  // Recheck authentication
  const checkUserAuth = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser && typeof parsedUser === "object") {
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Authentication check failed:", error);

      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const checkAppState = () => {
    checkUserAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,

        isLoadingAuth,
        isLoadingPublicSettings,
        authChecked,

        authError,
        appPublicSettings,

        login,
        logout,
        navigateToLogin,

        checkUserAuth,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Named export
export { AuthProvider };

// useAuth hook
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

// Default export
export default AuthProvider;