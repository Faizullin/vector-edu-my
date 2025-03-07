import { useContext } from "react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { DarkModeContext } from "~/app/providers";
import "./navbar.scss";

export const Navbar = () => {
  const { darkMode, setDarkMode } = useContext(DarkModeContext);

  return (
    <div className="navbar">
      <div className="wrapper">
        <div className="search">
          <input type="text" placeholder="Search..." />
          <SearchOutlinedIcon />
        </div>
        <div className="items">
          <div className="item">
            <DarkModeOutlinedIcon
              className="icon"
              onClick={() => setDarkMode(!darkMode)}
            />
          </div>
          <div className="item">
            <img src="ava.jpg" alt="" className="avatar" />
          </div>
        </div>
      </div>
    </div>
  );
};
