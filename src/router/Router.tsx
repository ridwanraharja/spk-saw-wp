import { useRoutes } from "react-router";
import { routes } from "./routes";

export function Router() {
  const element = useRoutes(routes);
  return element;
}
