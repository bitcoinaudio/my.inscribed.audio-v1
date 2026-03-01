import React from "react";
import { Navigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";

export default function RequireAnyRole({
  roles = [],
  children,
  redirectTo = "/",
  allowWhenAuthUnavailable = true,
}) {
  const { hasAnyRole, authStatus } = useWallet();

  if (allowWhenAuthUnavailable && authStatus === "unavailable") {
    return children;
  }

  if (!hasAnyRole(roles)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
