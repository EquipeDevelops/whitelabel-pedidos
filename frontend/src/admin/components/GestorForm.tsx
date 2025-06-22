import React, { useState } from "react";
import styles from "./GestorForm.module.css";

interface GestorFormProps {
  onSuccess?: () => void;
}

export default function GestorForm({ onSuccess }: GestorFormProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/gestor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
    });
    if (res.ok) {
      setNome("");
      setEmail("");
      setSenha("");
      setMsg("Gestor cadastrado com sucesso!");
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      onSuccess && onSuccess();
    } else {
      const data = await res.json();
      setMsg(data.error || "Erro ao cadastrar gestor.");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Cadastrar Novo Gestor</h2>
      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
        minLength={6}
      />
      <button type="submit">Cadastrar</button>
      {msg && <div className={styles.msg}>{msg}</div>}
    </form>
  );
}
