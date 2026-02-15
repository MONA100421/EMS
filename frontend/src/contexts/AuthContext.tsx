import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "employee" | "hr";

interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<boolean>;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<string, User & { password: string }> = {
  employee: {
    id: "1",
    username: "employee",
    email: "john.doe@company.com",
    role: "employee",
    firstName: "John",
    lastName: "Doe",
    password: "password123",
  },
  hr: {
    id: "2",
    username: "hr",
    email: "sarah.hr@company.com",
    role: "hr",
    firstName: "Sarah",
    lastName: "Johnson",
    password: "password123",
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const foundUser = mockUsers[username];
    if (foundUser && foundUser.password === password) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real app, this would create a new user
    const newUser: User = {
      id: Date.now().toString(),
      username: data.username,
      email: data.email,
      role: "employee",
      firstName: "New",
      lastName: "User",
    };
    setUser(newUser);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
