import { useState } from "react";
import { Routing } from "~/pages";
import { withProviders, DarkModeContext } from "./providers";
import "./styles/index.scss";

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      <div className={darkMode ? "app dark" : "app"}>
        <Routing />
      </div>
    </DarkModeContext.Provider>
  );
};

export default withProviders(App);
