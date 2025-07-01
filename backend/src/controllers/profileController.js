import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import { logAction } from "../services/auditLogService.js";

const prisma = new PrismaClient();

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.usuario.id;
    const gestor = await prisma.gestor.findUnique({
      where: { id: userId },
      select: { nome: true, email: true, avatarUrl: true },
    });
    if (!gestor)
      return res.status(404).json({ error: "Usuário não encontrado." });
    res.json(gestor);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar perfil." });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.usuario.id;
    const { nome, email } = req.body;
    const avatarPath = req.file
      ? req.file.path.replace(/\\/g, "/").replace("public/", "")
      : undefined;

    const updatedData = {};
    if (nome) updatedData.nome = nome;
    if (email) updatedData.email = email;
    if (avatarPath) updatedData.avatarUrl = avatarPath;

    const updatedGestor = await prisma.gestor.update({
      where: { id: userId },
      data: updatedData,
      select: { nome: true, email: true, avatarUrl: true },
    });

    await logAction({
      action: "SELF_PROFILE_UPDATE",
      targetId: userId,
      author: req.usuario,
    });
    res.json(updatedGestor);
  } catch (error) {
    if (error.code === "P2002")
      return res
        .status(409)
        .json({ error: "Este e-mail já está em uso por outro usuário." });
    res.status(500).json({ error: "Erro ao atualizar perfil." });
  }
};

export const updateMyPassword = async (req, res) => {
  try {
    const userId = req.usuario.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        error:
          "Forneça a senha atual e uma nova senha com no mínimo 6 caracteres.",
      });
    }

    const gestor = await prisma.gestor.findUnique({ where: { id: userId } });
    const isMatch = await bcrypt.compare(currentPassword, gestor.senha);
    if (!isMatch) {
      return res.status(401).json({ error: "A senha atual está incorreta." });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.gestor.update({
      where: { id: userId },
      data: { senha: newPasswordHash },
    });

    await logAction({
      action: "SELF_PASSWORD_UPDATE",
      targetId: userId,
      author: req.usuario,
    });
    res.json({ message: "Senha alterada com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao alterar a senha." });
  }
};
