import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, TokenManager, authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is authenticated on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = TokenManager.getUser();
        const isAuth = TokenManager.isAuthenticated();

        if (isAuth && savedUser) {
          // Verify token is still valid by fetching profile
          try {
            const response = await authApi.getProfile();
            if (response.success && response.data) {
              setUser(response.data.user);
            } else {
              // Token invalid, clear auth
              TokenManager.clearAuth();
            }
          } catch (error) {
            console.error("Profile fetch failed:", error);
            TokenManager.clearAuth();
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        TokenManager.clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authApi.login({ email, password });

      if (response.success && response.data) {
        setUser(response.data.user);
        toast({
          title: "Login Berhasil",
          description: `Selamat datang, ${response.data.user.name}!`,
        });
        return true;
      } else {
        toast({
          title: "Login Gagal",
          description: response.message || "Email atau password tidak valid",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Gagal",
        description: error.message || "Terjadi kesalahan saat login",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    name: string,
    password: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authApi.register({ email, name, password });

      if (response.success && response.data) {
        setUser(response.data.user);
        toast({
          title: "Registrasi Berhasil",
          description: `Akun berhasil dibuat. Selamat datang, ${response.data.user.name}!`,
        });
        return true;
      } else {
        toast({
          title: "Registrasi Gagal",
          description: response.message || "Gagal membuat akun",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registrasi Gagal",
        description: error.message || "Terjadi kesalahan saat registrasi",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      TokenManager.clearAuth();
      toast({
        title: "Logout Berhasil",
        description: "Anda telah keluar dari sistem",
      });
    }
  };

  const updateProfile = async (data: {
    name?: string;
    email?: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authApi.updateProfile(data);

      if (response.success && response.data) {
        setUser(response.data.user);
        toast({
          title: "Profil Diperbarui",
          description: "Profil berhasil diperbarui",
        });
        return true;
      } else {
        toast({
          title: "Update Gagal",
          description: response.message || "Gagal memperbarui profil",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        title: "Update Gagal",
        description: error.message || "Terjadi kesalahan saat update profil",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user && TokenManager.isAuthenticated(),
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
