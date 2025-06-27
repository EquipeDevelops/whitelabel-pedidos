import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  TablePagination,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
  Checkbox,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
  TimelineDot,
} from "@mui/lab";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LockReset as LockResetIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Person as PersonIcon,
  DeleteSweep as DeleteSweepIcon,
  History as HistoryIcon,
  Summarize as SummarizeIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { alpha } from "@mui/material/styles";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fetchWithAuth } from "../../api/api";

const SERVER_URL = "http://localhost:3001";

export default function GestorList({ refreshKey, onEdit, onActionComplete }) {
  const [gestores, setGestores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalRows, setTotalRows] = useState(0);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("createdAt");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selectedIds, setSelectedIds] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGestor, setSelectedGestor] = useState(null);
  const [dialogState, setDialogState] = useState({
    open: false,
    type: null,
    data: null,
  });
  const [newPasswordInfo, setNewPasswordInfo] = useState({
    open: false,
    nome: "",
    pass: "",
  });
  const [activityLogState, setActivityLogState] = useState({
    open: false,
    loading: false,
    logs: [],
    gestorName: "",
  });

  const fetchGestores = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page + 1),
      limit: String(rowsPerPage),
      search,
      sortBy: orderBy,
      sortOrder: order,
    });
    if (statusFilter !== "todos") {
      params.append("status", statusFilter);
    }
    fetchWithAuth(`/api/gestor?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setGestores(data.data || []);
        setTotalRows(data.totalGestores || 0);
      })
      .catch(() => toast.error("Falha ao carregar gestores."))
      .finally(() => setLoading(false));
  }, [page, rowsPerPage, search, orderBy, order, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGestores();
      setSelectedIds([]);
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchGestores, refreshKey]);

  const handleGenerateReport = async () => {
    if (!selectedGestor) return;
    const gestorId = selectedGestor.id;
    handleMenuClose();
    toast.info("Gerando relatório, por favor aguarde...");

    try {
      const res = await fetchWithAuth(`/api/gestor/${gestorId}/report`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const { gestor, logs } = data;
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text(`Relatório do Gestor: ${gestor.nome}`, 14, 22);
      doc.setFontSize(12);
      doc.text(`ID: ${gestorId}`, 14, 35);
      doc.text(`Email: ${gestor.email}`, 14, 42);
      doc.text(`Status: ${gestor.ativo ? "Ativo" : "Inativo"}`, 14, 49);
      doc.text(
        `Membro desde: ${new Date(gestor.createdAt).toLocaleDateString(
          "pt-BR"
        )}`,
        14,
        56
      );

      autoTable(doc, {
        startY: 70,
        head: [["Data", "Ação", "Autor", "Detalhes"]],
        body: logs.map((log) => [
          new Date(log.createdAt).toLocaleString("pt-BR"),
          log.action.replace(/_/g, " "),
          log.authorName || "N/A",
          log.details || "",
        ]),
        theme: "striped",
        headStyles: { fillColor: [22, 160, 133] },
      });

      doc.save(
        `relatorio_${gestor.nome.replace(/\s/g, "_")}_${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );
    } catch (error) {
      toast.error(error.message || "Não foi possível gerar o relatório.");
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelectedIds = gestores.map((n) => n.id);
      setSelectedIds(newSelectedIds);
      return;
    }
    setSelectedIds([]);
  };
  const handleSelectClick = (event, id) => {
    const selectedIndex = selectedIds.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedIds, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedIds.slice(1));
    } else if (selectedIndex === selectedIds.length - 1) {
      newSelected = newSelected.concat(selectedIds.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedIds.slice(0, selectedIndex),
        selectedIds.slice(selectedIndex + 1)
      );
    }
    setSelectedIds(newSelected);
  };
  const isSelected = (id) => selectedIds.indexOf(id) !== -1;
  const handleMenuClick = (event, gestor) => {
    setAnchorEl(event.currentTarget);
    setSelectedGestor(gestor);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGestor(null);
  };
  const handleActionClick = (type, data) => {
    setDialogState({ open: true, type, data: data || selectedGestor });
    handleMenuClose();
  };
  const closeConfirmationDialog = () => {
    setDialogState({ open: false, type: null, data: null });
  };
  const handleActivityLogOpen = async () => {
    if (!selectedGestor) return;
    setActivityLogState({
      open: true,
      loading: true,
      logs: [],
      gestorName: selectedGestor.nome,
    });
    handleMenuClose();
    try {
      const res = await fetchWithAuth(
        `/api/audit-logs?targetId=${selectedGestor.id}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActivityLogState((prev) => ({ ...prev, logs: data, loading: false }));
    } catch (error) {
      toast.error(error.message || "Erro ao buscar histórico de atividades.");
      setActivityLogState({
        open: false,
        loading: false,
        logs: [],
        gestorName: "",
      });
    }
  };
  const handleActivityLogClose = () =>
    setActivityLogState({
      open: false,
      loading: false,
      logs: [],
      gestorName: "",
    });
  const executeBulkDelete = async () => {
    try {
      const res = await fetchWithAuth("/api/gestor/bulk/delete", {
        method: "POST",
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
      onActionComplete();
    } catch (error) {
      toast.error(error.message || "Erro ao deletar em massa.");
    } finally {
      closeConfirmationDialog();
    }
  };
  const executeBulkUpdateStatus = async (status) => {
    try {
      const res = await fetchWithAuth("/api/gestor/bulk/status", {
        method: "POST",
        body: JSON.stringify({ ids: selectedIds, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
      onActionComplete();
    } catch (error) {
      toast.error(error.message || "Erro ao atualizar status em massa.");
    } finally {
      closeConfirmationDialog();
    }
  };
  const executeDelete = async () => {
    if (!dialogState.data) return;
    try {
      await fetchWithAuth(`/api/gestor/${dialogState.data.id}`, {
        method: "DELETE",
      });
      toast.success("Gestor deletado!");
      onActionComplete();
    } catch {
      toast.error("Erro ao deletar gestor.");
    } finally {
      closeConfirmationDialog();
    }
  };
  const executeToggleStatus = async () => {
    if (!dialogState.data) return;
    try {
      const res = await fetchWithAuth(
        `/api/gestor/${dialogState.data.id}/status`,
        { method: "PATCH" }
      );
      const data = await res.json();
      toast.success(data.message);
      onActionComplete();
    } catch {
      toast.error("Erro ao alterar status.");
    } finally {
      closeConfirmationDialog();
    }
  };
  const executeResetPassword = async () => {
    if (!dialogState.data) return;
    try {
      const res = await fetchWithAuth(
        `/api/gestor/${dialogState.data.id}/reset-senha`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
      setNewPasswordInfo({
        open: true,
        nome: dialogState.data.nome,
        pass: data.newPassword,
      });
    } catch (error) {
      toast.error(error.message || "Erro ao resetar a senha.");
    } finally {
      closeConfirmationDialog();
    }
  };
  const dialogActions = {
    delete: executeDelete,
    status: executeToggleStatus,
    reset: executeResetPassword,
    "bulk-delete": executeBulkDelete,
    "bulk-activate": () => executeBulkUpdateStatus(true),
    "bulk-deactivate": () => executeBulkUpdateStatus(false),
  };
  const headCells = [
    { id: "nome", label: "Gestor" },
    { id: "email", label: "Email" },
    { id: "ativo", label: "Status" },
    { id: "createdAt", label: "Criado em" },
  ];

  return (
    <>
      <Paper sx={{ width: "100%", mb: 2 }}>
        {selectedIds.length > 0 ? (
          <Toolbar
            sx={{
              pl: { sm: 2 },
              pr: { xs: 1, sm: 1 },
              bgcolor: (theme) =>
                alpha(
                  theme.palette.primary.main,
                  theme.palette.action.activatedOpacity
                ),
            }}
          >
            <Typography
              sx={{ flex: "1 1 100%" }}
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              {selectedIds.length} selecionado(s)
            </Typography>
            <Tooltip title="Ativar">
              <IconButton onClick={() => handleActionClick("bulk-activate")}>
                <ToggleOnIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Desativar">
              <IconButton onClick={() => handleActionClick("bulk-deactivate")}>
                <ToggleOffIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Deletar">
              <IconButton onClick={() => handleActionClick("bulk-delete")}>
                <DeleteSweepIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        ) : (
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Buscar..."
              sx={{ flexGrow: 1, minWidth: "300px" }}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <ToggleButtonGroup
              color="primary"
              value={statusFilter}
              exclusive
              onChange={(e, val) => val && setStatusFilter(val)}
            >
              <ToggleButton value="todos">Todos</ToggleButton>
              <ToggleButton value="ativo">Ativos</ToggleButton>
              <ToggleButton value="inativo">Inativos</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={
                      selectedIds.length > 0 &&
                      selectedIds.length < gestores.length
                    }
                    checked={
                      gestores.length > 0 &&
                      selectedIds.length === gestores.length
                    }
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    sortDirection={orderBy === headCell.id ? order : false}
                  >
                    {" "}
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : "asc"}
                      onClick={() => setOrderBy(headCell.id)}
                    >
                      {" "}
                      {headCell.label}{" "}
                    </TableSortLabel>{" "}
                  </TableCell>
                ))}
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                gestores.map((gestor) => {
                  const isItemSelected = isSelected(gestor.id);
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={gestor.id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          onClick={(event) =>
                            handleSelectClick(event, gestor.id)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {" "}
                          <Avatar
                            variant="square"
                            src={
                              gestor.avatarUrl
                                ? `${SERVER_URL}/${gestor.avatarUrl}`
                                : undefined
                            }
                            sx={{ width: 56, height: 56, mr: 2 }}
                          >
                            {" "}
                            {!gestor.avatarUrl && <PersonIcon />}{" "}
                          </Avatar>{" "}
                          <Typography variant="body2" fontWeight="bold">
                            {gestor.nome}
                          </Typography>{" "}
                        </Box>
                      </TableCell>
                      <TableCell>{gestor.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={gestor.ativo ? "Ativo" : "Inativo"}
                          color={gestor.ativo ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(gestor.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => handleMenuClick(e, gestor)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalRows}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Itens por página:"
        />

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              onEdit(selectedGestor);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Editar</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleActivityLogOpen}>
            <ListItemIcon>
              <HistoryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Ver Atividade</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleActionClick("status")}>
            <ListItemIcon>
              {selectedGestor?.ativo ? (
                <ToggleOffIcon fontSize="small" />
              ) : (
                <ToggleOnIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>
              {selectedGestor?.ativo ? "Desativar" : "Ativar"}
            </ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleActionClick("reset")}>
            <ListItemIcon>
              <LockResetIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Resetar Senha</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleGenerateReport}>
            <ListItemIcon>
              <SummarizeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Gerar Relatório</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => handleActionClick("delete")}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Deletar</ListItemText>
          </MenuItem>
        </Menu>
      </Paper>

      <Dialog open={dialogState.open} onClose={closeConfirmationDialog}>
        <DialogTitle>Confirmar Ação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogState.type === "delete" &&
              `Tem certeza que deseja deletar o gestor "${dialogState.data?.nome}"?`}
            {dialogState.type === "status" &&
              `Tem certeza que deseja ${
                dialogState.data?.ativo ? "desativar" : "ativar"
              } o gestor "${dialogState.data?.nome}"?`}
            {dialogState.type === "reset" &&
              `Tem certeza que deseja gerar uma nova senha para o gestor "${dialogState.data?.nome}"?`}
            {dialogState.type === "bulk-delete" &&
              `Tem certeza que deseja deletar os ${selectedIds.length} gestores selecionados?`}
            {dialogState.type === "bulk-activate" &&
              `Tem certeza que deseja ativar os ${selectedIds.length} gestores selecionados?`}
            {dialogState.type === "bulk-deactivate" &&
              `Tem certeza que deseja desativar os ${selectedIds.length} gestores selecionados?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmationDialog}>Cancelar</Button>
          <Button
            onClick={
              dialogState.type ? dialogActions[dialogState.type] : undefined
            }
            color="primary"
            autoFocus
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={newPasswordInfo.open}
        onClose={() => setNewPasswordInfo({ ...newPasswordInfo, open: false })}
      >
        <DialogTitle>Nova Senha Gerada</DialogTitle>
        <DialogContent>
          <DialogContentText mb={2}>
            A nova senha para <strong>{newPasswordInfo.nome}</strong> é:
          </DialogContentText>
          <Typography
            variant="h6"
            component="div"
            sx={{
              p: 2,
              backgroundColor: "grey.200",
              borderRadius: 1,
              textAlign: "center",
              fontFamily: "monospace",
              wordBreak: "break-all",
            }}
          >
            {" "}
            {newPasswordInfo.pass}{" "}
          </Typography>
          <DialogContentText mt={2} color="error" variant="body2">
            Anote esta senha em um local seguro. Ela não será exibida novamente.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setNewPasswordInfo({ ...newPasswordInfo, open: false })
            }
            autoFocus
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={activityLogState.open}
        onClose={handleActivityLogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Histórico de Atividade: {activityLogState.gestorName}
        </DialogTitle>
        <DialogContent dividers>
          {activityLogState.loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Timeline position="alternate">
              {activityLogState.logs.length === 0 ? (
                <Typography sx={{ p: 2, textAlign: "center" }}>
                  Nenhuma atividade registrada para este usuário.
                </Typography>
              ) : (
                activityLogState.logs.map((log) => (
                  <TimelineItem key={log.id}>
                    <TimelineOppositeContent
                      color="text.secondary"
                      sx={{ m: "auto 0" }}
                      align="right"
                      variant="body2"
                    >
                      {" "}
                      {new Date(log.createdAt).toLocaleString("pt-BR")}{" "}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      {" "}
                      <TimelineConnector />{" "}
                      <TimelineDot color="primary">
                        <HistoryIcon />
                      </TimelineDot>{" "}
                      <TimelineConnector />{" "}
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: "12px", px: 2 }}>
                      <Typography variant="h6" component="span">
                        {log.action.replace(/_/g, " ")}
                      </Typography>
                      <Typography>
                        por: <strong>{log.authorName}</strong>
                      </Typography>
                      {log.details && (
                        <Typography variant="body2" color="text.secondary">
                          Detalhes: {log.details}
                        </Typography>
                      )}
                    </TimelineContent>
                  </TimelineItem>
                ))
              )}
            </Timeline>
          )}
        </DialogContent>
        <DialogActions>
          {" "}
          <Button onClick={handleActivityLogClose}>Fechar</Button>{" "}
        </DialogActions>
      </Dialog>
    </>
  );
}
