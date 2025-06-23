import React, { useEffect, useState, useRef } from "react";
import styles from "./GestorList.module.css";
import { toast } from "react-toastify";

type Gestor = {
  id: number;
  nome: string;
  email: string;
  createdAt: string;
  ativo: boolean;
  avatarUrl?: string;
};

interface GestorListProps {
  refresh: boolean;
  onAction: () => void;
}

export default function GestorList({ refresh, onAction }: GestorListProps) {
  const [gestores, setGestores] = useState<Gestor[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const [newPasswordInfo, setNewPasswordInfo] = useState<{
    gestorNome: string;
    pass: string;
  } | null>(null);

  const [editGestor, setEditGestor] = useState<Gestor | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editSenha, setEditSenha] = useState("");
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const serverUrl = "http://localhost:3001";

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(currentPage),
      search: search,
      sortBy: sortConfig.key,
      sortOrder: sortConfig.direction,
    });

    fetch(`/api/gestor?${params.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Falha na resposta da rede");
        }
        return res.json();
      })
      .then((data) => {
        setGestores(data.data || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
      })
      .catch(() => {
        toast.error("Falha ao carregar gestores.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [refresh, currentPage, search, sortConfig]);

  const openEdit = (gestor: Gestor) => {
    setEditGestor(gestor);
    setEditNome(gestor.nome);
    setEditEmail(gestor.email);
    setEditSenha("");
    setEditAvatarFile(null);
    setEditPreview(
      gestor.avatarUrl
        ? `${serverUrl}/${gestor.avatarUrl.replace(/\\/g, "/")}`
        : null
    );
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setEditAvatarFile(file);
      if (editPreview && editPreview.startsWith("blob:")) {
        URL.revokeObjectURL(editPreview);
      }
      setEditPreview(URL.createObjectURL(file));
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGestor) return;

    const formData = new FormData();
    formData.append("nome", editNome);
    formData.append("email", editEmail);
    if (editSenha) {
      formData.append("senha", editSenha);
    }
    if (editAvatarFile) {
      formData.append("avatar", editAvatarFile);
    }

    const res = await fetch(`/api/gestor/${editGestor.id}`, {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Gestor atualizado com sucesso!");
      setEditGestor(null);
      setEditPreview(null);
      onAction();
    } else {
      toast.error(data.error || "Erro ao atualizar gestor.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja deletar este gestor?")) return;
    const res = await fetch(`/api/gestor/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Gestor deletado com sucesso!");
      onAction();
    } else {
      toast.error("Erro ao deletar gestor.");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleToggleStatus = async (id: number) => {
    if (
      !window.confirm("Tem certeza que deseja alterar o status deste gestor?")
    )
      return;
    const res = await fetch(`/api/gestor/${id}/status`, { method: "PATCH" });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      onAction();
    } else {
      toast.error(data.error || "Erro ao alterar o status.");
    }
  };

  const handleResetPassword = async (gestor: Gestor) => {
    if (
      !window.confirm(
        `Tem certeza que deseja resetar a senha do gestor ${gestor.nome}? Uma nova senha será gerada.`
      )
    )
      return;
    const res = await fetch(`/api/gestor/${gestor.id}/reset-senha`, {
      method: "POST",
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      setNewPasswordInfo({ gestorNome: gestor.nome, pass: data.newPassword });
    } else {
      toast.error(data.error || "Erro ao resetar a senha.");
    }
  };

  const requestSort = (key: string) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className={styles.listContainer}>
      <div className={styles.header}>
        <h2>Gestores Cadastrados</h2>
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.avatarColumn}>Avatar</th>
                <th onClick={() => requestSort("id")}>
                  ID{getSortIndicator("id")}
                </th>
                <th onClick={() => requestSort("nome")}>
                  Nome{getSortIndicator("nome")}
                </th>
                <th onClick={() => requestSort("email")}>
                  Email{getSortIndicator("email")}
                </th>
                <th onClick={() => requestSort("ativo")}>
                  Status{getSortIndicator("ativo")}
                </th>
                <th onClick={() => requestSort("createdAt")}>
                  Criado em{getSortIndicator("createdAt")}
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {gestores.map((g) => (
                <tr key={g.id}>
                  <td>
                    <img
                      src={
                        g.avatarUrl
                          ? `${serverUrl}/${g.avatarUrl.replace(/\\/g, "/")}`
                          : "/default-avatar.png"
                      }
                      alt={`Avatar de ${g.nome}`}
                      className={styles.avatarImage}
                    />
                  </td>
                  <td>{g.id}</td>
                  <td>{g.nome}</td>
                  <td>{g.email}</td>
                  <td>
                    <span
                      className={
                        g.ativo ? styles.statusAtivo : styles.statusInativo
                      }
                    >
                      {g.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td>{new Date(g.createdAt).toLocaleDateString()}</td>
                  <td className={styles.actionsCell}>
                    <button
                      className={styles.editBtn}
                      onClick={() => openEdit(g)}
                    >
                      Editar
                    </button>
                    <button
                      className={
                        g.ativo ? styles.deactivateBtn : styles.activateBtn
                      }
                      onClick={() => handleToggleStatus(g.id)}
                    >
                      {g.ativo ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      className={styles.resetBtn}
                      onClick={() => handleResetPassword(g)}
                    >
                      Resetar Senha
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(g.id)}
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </button>
          </div>
        </>
      )}

      {editGestor && (
        <div className={styles.modal}>
          <form className={styles.editForm} onSubmit={handleEdit}>
            <h3>Editar Gestor</h3>
            <div className={styles.avatarUpload}>
              <input
                type="file"
                accept="image/*"
                ref={editFileInputRef}
                onChange={handleEditFileChange}
                style={{ display: "none" }}
              />
              <div
                className={styles.avatarPreview}
                onClick={() => editFileInputRef.current?.click()}
              >
                {editPreview ? (
                  <img src={editPreview} alt="Pré-visualização do Avatar" />
                ) : (
                  <span>
                    +<br />
                    Alterar Foto
                  </span>
                )}
              </div>
            </div>
            <input
              type="text"
              value={editNome}
              onChange={(e) => setEditNome(e.target.value)}
              placeholder="Nome"
              required
            />
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={editSenha}
              onChange={(e) => setEditSenha(e.target.value)}
              placeholder="Nova senha (deixe em branco para não alterar)"
            />
            <div className={styles.modalActions}>
              <button type="submit">Salvar Alterações</button>
              <button type="button" onClick={() => setEditGestor(null)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {newPasswordInfo && (
        <div className={styles.modal}>
          <div className={styles.passwordModal}>
            <h3>Senha Resetada</h3>
            <p>
              A nova senha para <strong>{newPasswordInfo.gestorNome}</strong> é:
            </p>
            <div className={styles.newPasswordBox}>{newPasswordInfo.pass}</div>
            <p className={styles.passwordWarning}>
              Anote a senha. Ela não será exibida novamente.
            </p>
            <button onClick={() => setNewPasswordInfo(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
