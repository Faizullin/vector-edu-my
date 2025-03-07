import { Dispatch, SetStateAction, createContext } from "react";

type TDarkModeContext = {
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
};

export const DarkModeContext = createContext<TDarkModeContext>({
  darkMode: false,
  setDarkMode: () => {},
});
