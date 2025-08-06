import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logAction } from "../services/auditLogService.js";

const prisma = new PrismaClient();

export const createCliente = async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Formato de e-mail inválido." });
  }

  if (senha.length < 6) {
    return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres." });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const novoCliente = await prisma.cliente.create({
      data: { nome, email, senha: senhaHash },
      select: { id: true, nome: true, email: true, criadoEm: true },
    });

    await logAction({
      action: "CLIENTE_CREATE",
      targetId: novoCliente.id,
      author: req.usuario || { id: 0, nome: "Sistema" }, // Se a criação for por um gestor, use req.usuario; caso contrário, "Sistema"
      details: `Novo cliente "${novoCliente.nome}" registrado.`,
      targetType: "CLIENTE"
    });
    return res.status(201).json(novoCliente);
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Este e-mail já está em uso." });
    }
    res.status(500).json({ error: "Erro interno ao registrar cliente." });
  }
};

export const loginCliente = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }
  try {
    const cliente = await prisma.cliente.findUnique({ where: { email } });
    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

    const senhaValida = await bcrypt.compare(senha, cliente.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    const token = jwt.sign(
      { id: cliente.id, tipo: "cliente", nome: cliente.nome },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );
    res.json({
      token,
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        tipo: "cliente",
      },
    });
  } catch (error) {
    console.error("Erro ao fazer login do cliente:", error);
    res.status(500).json({ error: "Erro ao fazer login do cliente" });
  }
};

export const getClienteProfile = async (req, res) => {
  try {
    const clienteId = req.usuario.id; // Supondo que o ID do cliente esteja no token JWT
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      select: { id: true, nome: true, email: true, criadoEm: true },
    });
    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }
    res.json(cliente);
  } catch (error) {
    console.error("Erro ao buscar perfil do cliente:", error);
    res.status(500).json({ error: "Erro ao buscar perfil do cliente." });
  }
};

export const updateClienteProfile = async (req, res) => {
  try {
    const clienteId = req.usuario.id;
    const { nome, email } = req.body;

    const updatedData = {};
    if (nome) updatedData.nome = nome;
    if (email) updatedData.email = email;

    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({ error: "Nenhum dado para atualizar foi fornecido." });
    }

    const updatedCliente = await prisma.cliente.update({
      where: { id: clienteId },
      data: updatedData,
      select: { id: true, nome: true, email: true, criadoEm: true },
    });

    await logAction({
      action: "CLIENTE_PROFILE_UPDATE",
      targetId: clienteId,
      author: req.usuario,
      details: "Perfil do cliente atualizado.",
      targetType: "CLIENTE"
    });
    res.json(updatedCliente);
  } catch (error) {
    console.error("Erro ao atualizar perfil do cliente:", error);
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Este e-mail já está em uso por outro cliente." });
    }
    res.status(500).json({ error: "Erro ao atualizar perfil do cliente." });
  }
};

export const updateClientePassword = async (req, res) => {
  try {
    const clienteId = req.usuario.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        error: "Forneça a senha atual e uma nova senha com no mínimo 6 caracteres.",
      });
    }

    const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

    const isMatch = await bcrypt.compare(currentPassword, cliente.senha);
    if (!isMatch) {
      return res.status(401).json({ error: "A senha atual está incorreta." });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.cliente.update({
      where: { id: clienteId },
      data: { senha: newPasswordHash },
    });

    await logAction({
      action: "CLIENTE_PASSWORD_UPDATE",
      targetId: clienteId,
      author: req.usuario,
      details: "Senha do cliente alterada.",
      targetType: "CLIENTE"
    });
    res.json({ message: "Senha alterada com sucesso." });
  } catch (error) {
    console.error("Erro ao alterar senha do cliente:", error);
    res.status(500).json({ error: "Erro ao alterar a senha do cliente." });
  }
};

// Funções para Gestores gerenciarem clientes (opcional, se necessário)
export const listarClientes = async (req, res) => {
  const { page = 1, limit = 10, search = "", sortBy = "criadoEm", sortOrder = "desc" } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const where = {};
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy = { [sortBy]: sortOrder };

    const clientes = await prisma.cliente.findMany({
      where,
      select: {
        id: true,
        nome: true,
        email: true,
        criadoEm: true,
      },
      skip: offset,
      take: parseInt(limit),
      orderBy,
    });

    const totalClientes = await prisma.cliente.count({ where });

    res.json({
      data: clientes,
      totalClientes,
      totalPages: Math.ceil(totalClientes / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    res.status(500).json({ error: "Erro ao buscar clientes." });
  }
};

export const buscarClientePorId = async (req, res) => {
  const { id } = req.params;
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nome: true,
        email: true,
        criadoEm: true,
      },
    });
    if (!cliente) {
      return res.status(404).json({ error: "Cliente não localizado." });
    }
    res.json(cliente);
  } catch (error) {
    console.error("Erro ao buscar cliente por ID:", error);
    res.status(500).json({ error: "Erro ao buscar o cliente." });
  }
};

export const deletarCliente = async (req, res) => {
  const { id } = req.params;
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: parseInt(id) },
    });
    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }
    await prisma.cliente.delete({ where: { id: parseInt(id) } });

    await logAction({
      action: "CLIENTE_DELETE",
      targetId: cliente.id,
      author: req.usuario,
      details: `Cliente "${cliente.nome}" deletado.`,
      targetType: "CLIENTE"
    });
    res.json({ message: "Cliente deletado com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    res.status(500).json({ error: "Erro ao deletar cliente." });
  }
};
