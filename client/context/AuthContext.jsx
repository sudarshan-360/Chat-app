import { createContext, useContext, useState, useEffect } from "react";
import API from "../src/utils/api";

const AuthContext = createContext();

// Create a global event emitter for profile updates
const profileUpdateEvent = new EventTarget();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get("/auth/check-auth");
      if (data.success) {
        setUser(data.user);
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data;
  };

  const signup = async (fullName, email, password) => {
    const { data } = await API.post("/auth/signup", { fullName, email, password });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data;
  };

  const updateProfile = async (profileData) => {
    const { data } = await API.put("/users/update", profileData);
    if (data.success) {
      setUser(data.user);
      // Emit profile update event for other components to listen
      profileUpdateEvent.dispatchEvent(new CustomEvent('profileUpdated', { detail: data.user }));
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { profileUpdateEvent }; // Export for other components to listen to profile updates
