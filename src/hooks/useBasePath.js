import { useLocation } from "react-router-dom";

export function useBasePath() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/manager")) return "/manager";
  if (pathname.startsWith("/owner")) return "/owner";
  return "";
}
