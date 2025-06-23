import { useState } from "react";
import GestorList from "../components/GestorList";
import GestorForm from "../components/GestorForm";
import styles from "./DashboardGestor.module.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DashboardGestor() {
  const [refresh, setRefresh] = useState(false);

  const handleSuccess = () => {
    setRefresh(!refresh);
  };

  return (
    <div className={styles.dashboard}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <h1>Painel de Administração</h1>
      <GestorForm onSuccess={handleSuccess} />
      <GestorList refresh={refresh} onAction={handleSuccess} />
    </div>
  );
}
