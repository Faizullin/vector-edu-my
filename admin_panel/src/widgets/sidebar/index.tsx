import { useContext } from "react";
import { Link } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { DarkModeContext } from "~/app/providers";
import "./sidebar.scss";

export const Sidebar = () => {
  const { setDarkMode } = useContext(DarkModeContext);
  return (
    <div className="sidebar">
      <div className="top">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">Vector Education</span>
        </Link>
      </div>
      <hr />
      <div className="center">
        <ul>
          <p className="title">ОСНОВНОЕ</p>
          <li>
            <DashboardIcon className="icon" />
            <span>Дашборд</span>
          </li>
          <p className="title">Списки</p>
          <Link to="/users" style={{ textDecoration: "none" }}>
            <li>
              <PersonOutlineIcon className="icon" />
              <span>Пользователи</span>
            </li>
          </Link>
          <p className="title">Другие</p>
          <li>
            <InsertChartIcon className="icon" />
            <span>Статистика</span>
          </li>
          <li>
            <NotificationsNoneIcon className="icon" />
            <span>Уведомления</span>
          </li>
          <li>
            <PsychologyOutlinedIcon className="icon" />
            <span>Логи</span>
          </li>
          <li>
            <SettingsApplicationsIcon className="icon" />
            <span>Настройки</span>
          </li>
          <p className="title">ПОЛЬЗОВАТЕЛЬ</p>
          <li>
            <AccountCircleOutlinedIcon className="icon" />
            <span>Профиль</span>
          </li>
          <li>
            <ExitToAppIcon className="icon" />
            <span>Выход</span>
          </li>
        </ul>
      </div>
      <div className="bottom">
        <div className="colorOption" onClick={() => setDarkMode(false)}></div>
        <div className="colorOption" onClick={() => setDarkMode(true)}></div>
      </div>
    </div>
  );
};
