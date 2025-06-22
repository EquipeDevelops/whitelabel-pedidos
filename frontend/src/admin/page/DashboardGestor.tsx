import { useState } from "react";
import GestorList from "../components/GestorList";
import GestorForm from "../components/GestorForm";
import styles from "./DashboardGestor.module.css";

export default function DashboardGestor() {
  const [refresh, setRefresh] = useState(false);

  return (
    <div className={styles.dashboard}>
      <h1>Painel de Administração</h1>
      <GestorForm onSuccess={() => setRefresh(!refresh)} />
      <GestorList refresh={refresh} />
    </div>
  );
}
