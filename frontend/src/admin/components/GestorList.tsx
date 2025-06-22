import React, { useEffect, useState } from "react";
import styles from "./GestorList.module.css";

type Gestor = {
  id: number;
  nome: string;
  email: string;
};

interface GestorListProps {
  refresh: boolean;
}

export default function GestorList({ refresh }: GestorListProps) {
  const [gestores, setGestores] = useState<Gestor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/gestor")
      .then((res) => res.json())
      .then((data) => {
        setGestores(data);
        setLoading(false);
      });
  }, [refresh]);

  return (
    <div className={styles.listContainer}>
      <h2>Gestores Cadastrados</h2>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {gestores.map((g) => (
              <tr key={g.id}>
                <td>{g.id}</td>
                <td>{g.nome}</td>
                <td>{g.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
