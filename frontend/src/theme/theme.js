import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#5E35B1",
      light: "#9575CD",
      dark: "#4527A0",
    },
    secondary: {
      main: "#E91E63",
    },
    background: {
      default: "#f4f5f7",
      paper: "#ffffff",
    },
    text: {
      primary: "#212121",
      secondary: "#616161",
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h4: {
      fontWeight: 700,
      fontSize: "2rem",
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e0e0e0",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e0e0e0",
        },
      },
    },
  },
});

export default theme;
