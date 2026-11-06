import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


export default function ProtectedRoute({
  children,
  allowedRoles = [],
}) {

  const token = sessionStorage.getItem("token");
  // const token = localStorage.getItem("token");

  // No token
  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {

    const decoded = jwtDecode(token);
    // console.log(decoded);

    // backend token payload
    const role = decoded.role_code;

    // role check
    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(role)
    ) {
      return <Navigate to="/" replace />;
    }

    return children;

  } catch (err) {

    console.error("Invalid token:", err);

    return <Navigate to="/" replace />;
  }
}