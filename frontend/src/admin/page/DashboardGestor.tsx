import React, { useState } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import GestorList from "../components/GestorList";
import GestorForm from "../components/GestorForm";
import GestorStats from "../components/GestorStats";

type Gestor = {
  id: number;
  nome: string;
  email: string;
  avatarUrl?: string;
  ativo: boolean;
  createdAt: string;
};

export default function DashboardGestor() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [gestorToEdit, setGestorToEdit] = useState<Gestor | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenForm = (gestor: Gestor | null = null) => {
    setGestorToEdit(gestor);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setGestorToEdit(null);
  };

  const handleSuccess = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        theme="colored"
      />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h1">
            Gerenciamento de Gestores
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Cadastrar Gestor
          </Button>
        </Box>

        <GestorStats />

        <GestorList
          refreshKey={refreshKey}
          onEdit={handleOpenForm}
          onActionComplete={handleSuccess}
        />

        <GestorForm
          open={isFormOpen}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
          gestorToEdit={gestorToEdit}
        />
      </Container>
    </>
  );
}
