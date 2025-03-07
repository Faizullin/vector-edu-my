import { ComponentType } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import * as routes from "~/shared/routes";
import { userInputs } from "~/shared/formSource";
import Home from "./home";
import Login from "./login";
import List from "./list";
import Single from "./single";
import New from "./new";

export const Routing = () => {
  const pages: Array<[string, ComponentType]> = [
    [routes.HOME_ROUTE, Home],
    [routes.LOGIN_ROUTE, Login],
    [routes.USERS_ROUTE, List],
    [routes.USER_ROUTE, Single],
    [
      routes.NEW_USER_ROUTE,
      () => <New inputs={userInputs} title="Add New User" />,
    ],
  ];
  return (
    <Routes>
      {pages.map(([route, Component]) => (
        <Route path={route} element={<Component />} />
      ))}
      <Route path="*" element={<Navigate to={routes.HOME_ROUTE} replace />} />
    </Routes>
  );
};
