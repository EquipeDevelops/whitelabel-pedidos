import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.warn("Token não fornecido.");
    return res.status(401).json({ error: "Token não fornecido." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      console.error("Erro ao verificar o token:", err);
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({ error: "Token expirado ou malformado." });
      }
      return res.status(403).json({ error: "Token inválido." });
    }
    req.usuario = usuario;
    console.log("Token verificado com sucesso:", usuario);
    next();
  });
}

export function verificarPermissao(...Permissoes) {
  return (req, res, next) => {
    if (!req.usuario || typeof req.usuario.tipo === "undefined") {
      return res
        .status(403)
        .json({ error: "Você não tem permissão para acessar este recurso." });
    }

    if (!Permissoes.includes(req.usuario.tipo)) {
      return res.status(403).json({
        error: "Você não tem permissão para acessar este recurso.",
      });
    }
    next();
  };
}
