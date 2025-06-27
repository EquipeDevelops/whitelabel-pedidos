import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Button,
  TextField,
  Box,
  Avatar,
  CircularProgress,
  Typography,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Person as PersonIcon,
  Upload as UploadIcon,
  Lock as LockIcon,
  VpnKey as VpnKeyIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../api/api";

const SERVER_URL = "http://localhost:3001";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function ProfileDetailsForm() {
  const [user, setUser] = useState({ nome: "", email: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/api/profile/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
          return;
        }
        setUser({ nome: data.nome, email: data.email });
        if (data.avatarUrl) setPreview(`${SERVER_URL}/${data.avatarUrl}`);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("nome", user.nome);
    formData.append("email", user.email);
    if (avatarFile) formData.append("avatar", avatarFile);
    try {
      const res = await fetchWithAuth("/api/profile/me", {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar
            src={preview || undefined}
            sx={{ width: 150, height: 150, mb: 2 }}
          >
            <PersonIcon sx={{ width: 75, height: 75 }} />
          </Avatar>
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadIcon />}
          >
            Mudar Foto
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>
        </Grid>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="Nome Completo"
            margin="normal"
            value={user.nome}
            onChange={(e) => setUser({ ...user, nome: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            required
          />
        </Grid>
      </Grid>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Salvar Detalhes"}
        </Button>
      </Box>
    </Box>
  );
}

function UpdatePasswordForm() {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("As novas senhas não coincidem.");
    }
    setLoading(true);
    try {
      const res = await fetchWithAuth("/api/profile/me/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: "600px" }}>
      <Typography variant="body1" color="text.secondary" mb={2}>
        Para sua segurança, recomendamos que utilize uma senha forte que você
        não usa em outros lugares.
      </Typography>
      <TextField
        fullWidth
        label="Senha Atual"
        type="password"
        margin="normal"
        value={passwords.currentPassword}
        onChange={(e) =>
          setPasswords({ ...passwords, currentPassword: e.target.value })
        }
        required
      />
      <TextField
        fullWidth
        label="Nova Senha"
        type="password"
        margin="normal"
        value={passwords.newPassword}
        onChange={(e) =>
          setPasswords({ ...passwords, newPassword: e.target.value })
        }
        required
      />
      <TextField
        fullWidth
        label="Confirmar Nova Senha"
        type="password"
        margin="normal"
        value={passwords.confirmPassword}
        onChange={(e) =>
          setPasswords({ ...passwords, confirmPassword: e.target.value })
        }
        required
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Alterar Senha"}
        </Button>
      </Box>
    </Box>
  );
}

export default function ProfilePage() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Meu Perfil
      </Typography>
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            aria-label="abas do perfil"
          >
            <Tab
              label="Detalhes do Perfil"
              icon={<PersonIcon />}
              iconPosition="start"
              id="profile-tab-0"
            />
            <Tab
              label="Alterar Senha"
              icon={<LockIcon />}
              iconPosition="start"
              id="profile-tab-1"
            />
          </Tabs>
        </Box>
        <TabPanel value={tabIndex} index={0}>
          <ProfileDetailsForm />
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <UpdatePasswordForm />
        </TabPanel>
      </Card>
    </Container>
  );
}
