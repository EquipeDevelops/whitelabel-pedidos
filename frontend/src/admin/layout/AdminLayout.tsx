import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  CssBaseline,
} from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Group as GroupIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Badge as BadgeIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";

const drawerWidth = 240;

export default function AdminLayout() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };
  const handleProfile = () => {
    navigate("/admin/profile");
    handleClose();
  };

  const menuItems = [
    { text: "Gestores", icon: <BadgeIcon />, path: "/admin/gestores" },
    { text: "Funcionários", icon: <GroupIcon />, path: "/admin/funcionarios" },
    { text: "Clientes", icon: <PeopleIcon />, path: "/admin/clientes" },
    { text: "Pedidos", icon: <ShoppingCartIcon />, path: "/admin/pedidos" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "background.paper",
          color: "text.primary",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
          borderBottom: "1px solid #e0e0e0",
        }}
        elevation={0}
      >
        <Toolbar>
          <DashboardIcon sx={{ color: "primary.main", mr: 2 }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Painel Administrativo
          </Typography>
          <div>
            <IconButton size="large" onClick={handleMenu} color="inherit">
              <AccountCircleIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>Meu Perfil</MenuItem>
              <MenuItem onClick={handleLogout}>Sair</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#111827",
            color: "#9CA3AF",
            borderRight: "none",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", p: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: "shape.borderRadius",
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.08)" },
                    "&.Mui-selected": {
                      backgroundColor: "primary.main",
                      color: "white",
                      "& .MuiListItemIcon-root": { color: "white" },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "#9CA3AF", minWidth: "40px" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, bgcolor: "background.default" }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
