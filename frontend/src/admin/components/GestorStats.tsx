import React, { useState, useEffect } from "react";

import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Avatar,
} from "@mui/material";
import {
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../../api/api";

interface StatsData {
  total: number;
  ativos: number;
  inativos: number;
}

export default function GestorStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/api/gestor/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStats(data);
      })
      .catch(() => toast.error("Erro ao carregar estatísticas."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: "Total de Gestores",
      value: stats.total,
      icon: <PeopleIcon />,
      color: "primary.main",
    },
    {
      title: "Gestores Ativos",
      value: stats.ativos,
      icon: <CheckCircleIcon />,
      color: "success.main",
    },
    {
      title: "Gestores Inativos",
      value: stats.inativos,
      icon: <CancelIcon />,
      color: "error.main",
    },
  ];

  return (
    <Grid container spacing={3} mb={4}>
      {statCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card elevation={2}>
            <CardContent sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{ bgcolor: card.color, width: 56, height: 56, mr: 2 }}
              >
                {card.icon}
              </Avatar>
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  {card.title}
                </Typography>
                <Typography variant="h4" component="div">
                  {card.value}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
