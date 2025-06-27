import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./admin/layout/AdminLayout";
import DashboardGestor from "./admin/page/DashboardGestor";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";

const ClientesPage = () => <h1>Página de Clientes</h1>;
const PedidosPage = () => <h1>Página de Pedidos</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="gestores" element={<DashboardGestor />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="pedidos" element={<PedidosPage />} />
            <Route index element={<Navigate to="gestores" replace />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
