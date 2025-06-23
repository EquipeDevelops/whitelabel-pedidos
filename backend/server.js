import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import gestorRoutes from "./src/routes/gestorRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("public/uploads"));

app.use("/api", gestorRoutes);

app.get("/", (req, res) => {
  res.send("hello world");
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor iniciou na porta ${PORT}`);
});
