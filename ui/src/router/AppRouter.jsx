import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "../auth/RequireAuth";
import RequireAdmin from "../auth/RequireAdmin";

import Login from "../pages/Login";
import Home from "../pages/Home";
import Orders from "../pages/Orders";
import Checkout from "../pages/Checkout";
import Admin from "../pages/Admin";
import AdminUsers from "../pages/AdminUsers";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
      <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
      <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />

      <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
      <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
