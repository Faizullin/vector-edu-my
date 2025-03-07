import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  setAuth: Dispatch<SetStateAction<boolean>>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setAuth: () => {},
});

export const withAuthContext = (component: () => ReactNode) => () => {
  const [isAuthenticated, setAuth] = useState(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuth }}>
      {component()}
    </AuthContext.Provider>
  );
};
