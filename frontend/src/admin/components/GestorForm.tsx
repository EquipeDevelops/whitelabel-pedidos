import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../../api/api";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  Upload as UploadIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";

type Gestor = { id: number; nome: string; email: string; avatarUrl?: string };
interface GestorFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gestorToEdit?: Gestor | null;
}

const SERVER_URL = "http://localhost:3001";

export default function GestorForm({
  open,
  onClose,
  onSuccess,
  gestorToEdit,
}: GestorFormProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditMode = !!gestorToEdit;

  useEffect(() => {
    if (isEditMode && gestorToEdit) {
      setNome(gestorToEdit.nome);
      setEmail(gestorToEdit.email);
      setPreview(
        gestorToEdit.avatarUrl
          ? `${SERVER_URL}/${gestorToEdit.avatarUrl}`
          : null
      );
    } else {
      setNome("");
      setEmail("");
      setSenha("");
      setAvatarFile(null);
      setPreview(null);
    }
    setSenha("");
  }, [gestorToEdit, open]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("email", email);

    if (!isEditMode) {
      formData.append("senha", senha);
    }

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const url = isEditMode ? `/api/gestor/${gestorToEdit?.id}` : "/api/gestor";
    const method = isEditMode ? "PUT" : "POST";

    try {
      const res = await fetchWithAuth(url, { method, body: formData });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          `Gestor ${isEditMode ? "atualizado" : "criado"} com sucesso!`
        );
        onSuccess();
        onClose();
      } else {
        throw new Error(data.error || "Ocorreu um erro.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ component: "form", onSubmit: handleSubmit }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {isEditMode ? "Editar Gestor" : "Cadastrar Novo Gestor"}
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Avatar
            variant="square"
            src={preview || undefined}
            sx={{ width: 150, height: 150, mb: 2 }}
          >
            {!preview && <PersonIcon sx={{ width: 75, height: 75 }} />}
          </Avatar>
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadIcon />}
          >
            Carregar Foto{" "}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>
        </Box>
        <TextField
          autoFocus
          margin="dense"
          label="Nome Completo"
          type="text"
          fullWidth
          variant="outlined"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <TextField
          margin="dense"
          label="Endereço de Email"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {!isEditMode && (
          <TextField
            margin="dense"
            label="Senha"
            type="password"
            fullWidth
            variant="outlined"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            helperText="Mínimo de 6 caracteres"
            inputProps={{ minLength: 6 }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? (
            <CircularProgress size={24} />
          ) : isEditMode ? (
            "Salvar"
          ) : (
            "Criar"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
