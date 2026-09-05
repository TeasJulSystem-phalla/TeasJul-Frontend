import { useLocation } from "react-router-dom";

export function useBasePath() {
  const { pathname } = useLocation();
  return pathname.startsWith("/manager") ? "/manager" : "";
}
