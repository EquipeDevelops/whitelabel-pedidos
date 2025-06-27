import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logAction } from "../services/auditLogService.js";

const prisma = new PrismaClient();

export const getGestorStats = async (req, res) => {
  try {
    const totalGestores = await prisma.gestor.count();
    const gestoresAtivos = await prisma.gestor.count({
      where: { ativo: true },
    });
    const gestoresInativos = await prisma.gestor.count({
      where: { ativo: false },
    });
    res.json({
      total: totalGestores,
      ativos: gestoresAtivos,
      inativos: gestoresInativos,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar estatísticas dos gestores" });
  }
};
export const listarGestores = async (req, res) => {
  const {
    page = 1,
    limit = 5,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
    status,
  } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    const where = {};
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status === "ativo") {
      where.ativo = true;
    } else if (status === "inativo") {
      where.ativo = false;
    }
    const orderBy = { [sortBy]: sortOrder };
    const gestores = await prisma.gestor.findMany({
      where,
      select: {
        id: true,
        nome: true,
        email: true,
        createdAt: true,
        ativo: true,
        avatarUrl: true,
      },
      skip: offset,
      take: parseInt(limit),
      orderBy,
    });
    const totalGestores = await prisma.gestor.count({ where });
    res.json({
      data: gestores,
      totalGestores,
      totalPages: Math.ceil(totalGestores / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar gestores" });
  }
};
export const buscarGestorPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const gestor = await prisma.gestor.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nome: true,
        email: true,
        createdAt: true,
        ativo: true,
        avatarUrl: true,
      },
    });
    if (!gestor) {
      return res.status(404).json({ error: "Gestor não localizado." });
    }
    res.json(gestor);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar o gestor" });
  }
};
export const criarGestor = async (req, res) => {
  const { nome, email, senha } = req.body;
  const avatarPath = req.file
    ? req.file.path.replace(/\\/g, "/").replace("public/", "")
    : null;
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Formato de e-mail inválido." });
  }
  if (senha.length < 6) {
    return res
      .status(400)
      .json({ error: "A senha deve ter pelo menos 6 caracteres." });
  }
  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const novoGestor = await prisma.gestor.create({
      data: { nome, email, senha: senhaHash, avatarUrl: avatarPath },
      select: { id: true, nome: true, email: true, avatarUrl: true },
    });
    await logAction({
      action: "GESTOR_CREATE",
      targetId: novoGestor.id,
      author: req.usuario,
    });
    return res.status(201).json(novoGestor);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Este e-mail já está em uso." });
    }
    console.error("Erro ao criar gestor:", error);
    res.status(500).json({ error: "Erro interno ao criar gestor." });
  }
};
export const atualizarGestor = async (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;
  const avatarPath = req.file
    ? req.file.path.replace(/\\/g, "/").replace("public/", "")
    : null;
  try {
    const atualizarDados = {};
    if (nome) atualizarDados.nome = nome;
    if (email) atualizarDados.email = email;
    if (avatarPath) atualizarDados.avatarUrl = avatarPath;
    if (Object.keys(atualizarDados).length === 0) {
      return res
        .status(400)
        .json({ error: "Nenhum dado para atualizar foi fornecido." });
    }
    const gestorAtualizado = await prisma.gestor.update({
      where: { id: parseInt(id) },
      data: atualizarDados,
      select: { id: true, nome: true, email: true, avatarUrl: true },
    });
    await logAction({
      action: "GESTOR_UPDATE",
      targetId: gestorAtualizado.id,
      author: req.usuario,
      details: "Dados cadastrais atualizados.",
    });
    res.json(gestorAtualizado);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Este e-mail já está em uso." });
    }
    res.status(500).json({ error: "Erro ao atualizar o gestor." });
  }
};
export const deletarGestor = async (req, res) => {
  const { id } = req.params;
  try {
    const gestor = await prisma.gestor.findUnique({
      where: { id: parseInt(id) },
    });
    if (!gestor)
      return res.status(404).json({ error: "Gestor não encontrado." });
    await prisma.gestor.delete({ where: { id: parseInt(id) } });
    await logAction({
      action: "GESTOR_DELETE",
      targetId: gestor.id,
      author: req.usuario,
      details: `Gestor "${gestor.nome}" deletado.`,
    });
    res.json({ message: "Gestor deletado." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar gestor." });
  }
};
export const loginGestor = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }
  try {
    const gestor = await prisma.gestor.findUnique({ where: { email } });
    if (!gestor) {
      return res.status(404).json({ error: "Gestor não encontrado." });
    }
    if (!gestor.ativo) {
      return res.status(403).json({ error: "Este usuário está inativo." });
    }
    const senhaValida = await bcrypt.compare(senha, gestor.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Senha incorreta." });
    }
    const token = jwt.sign(
      { id: gestor.id, tipo: "gestor", nome: gestor.nome },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );
    res.json({
      token,
      gestor: {
        id: gestor.id,
        nome: gestor.nome,
        email: gestor.email,
        tipo: "gestor",
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao fazer login do gestor" });
  }
};
export const alternarStatusGestor = async (req, res) => {
  const { id } = req.params;
  try {
    const gestorAtual = await prisma.gestor.findUnique({
      where: { id: parseInt(id) },
    });
    if (!gestorAtual) {
      return res.status(404).json({ error: "Gestor não encontrado." });
    }
    const gestorAtualizado = await prisma.gestor.update({
      where: { id: parseInt(id) },
      data: { ativo: !gestorAtual.ativo },
      select: { id: true, nome: true, ativo: true },
    });
    const acao = gestorAtualizado.ativo ? "ativado" : "desativado";
    await logAction({
      action: "GESTOR_STATUS_CHANGE",
      targetId: gestorAtualizado.id,
      author: req.usuario,
      details: `Status alterado para ${acao.toUpperCase()}.`,
    });
    res.json({
      message: `Gestor ${gestorAtualizado.nome} ${acao} com sucesso.`,
      gestor: gestorAtualizado,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao alterar status do gestor." });
  }
};
export const resetarSenhaGestor = async (req, res) => {
  const { id } = req.params;
  try {
    const newPassword = Math.random().toString(36).slice(-8);
    const senhaHash = await bcrypt.hash(newPassword, 10);
    await prisma.gestor.update({
      where: { id: parseInt(id) },
      data: { senha: senhaHash },
    });
    await logAction({
      action: "GESTOR_PASSWORD_RESET",
      targetId: parseInt(id),
      author: req.usuario,
    });
    res.json({
      message: "Senha resetada com sucesso.",
      newPassword: newPassword,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao resetar a senha." });
  }
};
export const bulkUpdateStatus = async (req, res) => {
  const { ids, status } = req.body;
  if (
    !ids ||
    !Array.isArray(ids) ||
    ids.length === 0 ||
    typeof status !== "boolean"
  ) {
    return res
      .status(400)
      .json({ error: "Dados inválidos para atualização em massa." });
  }
  try {
    const result = await prisma.gestor.updateMany({
      where: { id: { in: ids } },
      data: { ativo: status },
    });
    const acao = status ? "ativados" : "desativados";
    await logAction({
      action: "GESTOR_BULK_STATUS_CHANGE",
      targetId: 0,
      author: req.usuario,
      details: `${result.count} gestores ${acao} em massa. IDs: ${ids.join(
        ", "
      )}`,
    });
    res.json({ message: `${result.count} gestores atualizados com sucesso.` });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao atualizar status dos gestores em massa." });
  }
};
export const bulkDelete = async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ error: "Nenhum ID fornecido para deleção em massa." });
  }
  try {
    const result = await prisma.gestor.deleteMany({
      where: { id: { in: ids } },
    });
    await logAction({
      action: "GESTOR_BULK_DELETE",
      targetId: 0,
      author: req.usuario,
      details: `${result.count} gestores deletados em massa. IDs: ${ids.join(
        ", "
      )}`,
    });
    res.json({ message: `${result.count} gestores deletados com sucesso.` });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar gestores em massa." });
  }
};

export const getGestorReportData = async (req, res) => {
  const { id } = req.params;
  try {
    const gestorPromise = prisma.gestor.findUnique({
      where: { id: parseInt(id) },
      select: { nome: true, email: true, ativo: true, createdAt: true },
    });

    const logsPromise = prisma.auditLog.findMany({
      where: { targetId: parseInt(id), targetType: "GESTOR" },
      orderBy: { createdAt: "desc" },
    });

    const [gestor, logs] = await Promise.all([gestorPromise, logsPromise]);

    if (!gestor) {
      return res.status(404).json({ error: "Gestor não encontrado." });
    }

    res.json({ gestor, logs });
  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar dados para o relatório." });
  }
};
