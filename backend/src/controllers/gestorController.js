import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const listarGestores = async (req, res) => {
  const {
    page = 1,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;
  const limit = 10;
  const offset = (parseInt(page) - 1) * limit;

  try {
    const where = search
      ? {
          OR: [
            { nome: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const orderBy = {
      [sortBy]: sortOrder,
    };

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
      take: limit,
      orderBy,
    });

    const totalGestores = await prisma.gestor.count({ where });

    res.json({
      data: gestores,
      totalPages: Math.ceil(totalGestores / limit),
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
      data: {
        nome,
        email,
        senha: senhaHash,
        avatarUrl: avatarPath,
      },
      select: { id: true, nome: true, email: true, avatarUrl: true },
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
  const { nome, email, senha } = req.body;
  const avatarPath = req.file
    ? req.file.path.replace(/\\/g, "/").replace("public/", "")
    : null;

  try {
    const atualizarDados = {};

    if (nome) atualizarDados.nome = nome;
    if (email) atualizarDados.email = email;
    if (avatarPath) atualizarDados.avatarUrl = avatarPath;

    if (senha) {
      if (senha.length < 6) {
        return res
          .status(400)
          .json({ error: "Nova senha deve ter no mínimo 6 digitos." });
      }
      atualizarDados.senha = await bcrypt.hash(senha, 10);
    }

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
    await prisma.gestor.delete({
      where: { id: parseInt(id) },
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
      data: {
        ativo: !gestorAtual.ativo,
      },
      select: { id: true, nome: true, ativo: true },
    });

    const acao = gestorAtualizado.ativo ? "ativado" : "desativado";
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
      data: {
        senha: senhaHash,
      },
    });

    res.json({
      message: "Senha resetada com sucesso.",
      newPassword: newPassword,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao resetar a senha." });
  }
};
