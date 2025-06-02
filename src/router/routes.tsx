import type { RouteObject } from "react-router";
import { DashboardPage } from "../pages/DashboardPage";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <DashboardPage />,
  },
  // Add more routes here as needed
];
