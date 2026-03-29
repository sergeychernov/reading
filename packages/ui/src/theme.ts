import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0057b8"
    },
    secondary: {
      main: "#ff6f00"
    },
    background: {
      default: "#f7f9fc"
    }
  },
  shape: {
    borderRadius: 1
  }
});
