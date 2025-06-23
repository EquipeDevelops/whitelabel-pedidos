import React, { useState, useRef, useEffect } from "react";
import styles from "./GestorForm.module.css";
import { toast } from "react-toastify";

interface GestorFormProps {
  onSuccess?: () => void;
}

export default function GestorForm({ onSuccess }: GestorFormProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("email", email);
    formData.append("senha", senha);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const res = await fetch("/api/gestor", {
      method: "POST",
      body: formData,
    });

    setLoading(false);
    const data = await res.json();

    if (res.ok) {
      setNome("");
      setEmail("");
      setSenha("");
      setAvatarFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success("Gestor cadastrado com sucesso!");
      onSuccess?.();
    } else {
      toast.error(data.error || "Erro ao cadastrar gestor.");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Cadastrar Novo Gestor</h2>

      <div className={styles.avatarUpload}>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <div
          className={styles.avatarPreview}
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="Pré-visualização do Avatar" />
          ) : (
            <span>
              +<br />
              Adicionar Foto
            </span>
          )}
        </div>
      </div>

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
        placeholder="Senha (mínimo 6 caracteres)"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
        minLength={6}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Cadastrando..." : "Cadastrar"}
      </button>
    </form>
  );
}
