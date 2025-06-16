import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const listarGestores = async (req, res) => {
  try {
    const gestores = await prisma.gestor.findMany({
      select: { id: true, nome: true, email: true },
    });
    res.json(gestores);
  } catch (error) {
    console.error("Erro ao buscar gestores", error);
    res.status(500).json({ error: "Erro ao buscar gestores" });
  }
};

export const buscarGestorPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const gestor = await prisma.gestor.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, nome: true, email: true },
    });

    if (!gestor) {
      return res.status(404).json({ error: "Gestor não localizado." });
    }

    res.json(gestor);
  } catch (error) {
    console.error(`Erro ao buscar o gestor com a ID ${id}: `, error);
    res.status(500).json({ error: "Erro ao buscar o gestor" });
  }
};

export const criarGestor = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }

  if (senha.length < 6) {
    return res.status(400).json({ error: "A senha deve ter pelo menos 6" });
  }
  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    const novoGestor = await prisma.gestor.create({
      data: {
        nome,
        email,
        senha: senhaHash,
      },
      select: { id: true, nome: true, email: true },
    });

    return res.status(201).json(novoGestor);
  } catch (error) {
    console.error("Erro ao criar gestor", error);
  }
};

export const atualizarGestor = async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha } = req.body;

  try {
    const atualizarDados = {};
    if (nome) atualizarDados.nome = nome;
    if (email) atualizarDados.email = email;
    if (senha) {
      if (senha.length < 6) {
        return res
          .status(400)
          .json({ error: "Nova senha deve ter no mínimo 6 digitos." });
      }
      atualizarDados.senha = await bcrypt.hash(senha, 10);
    }

    if (Object.keys(atualizarDados).length === 0) {
      return res.status(400).json({ error: "Nenhum campo foi informado." });
    }

    const gestorAtualizado = await prisma.gestor.update({
      where: { id: parseInt(id) },
      data: atualizarDados,
      select: { id: true, nome: true, email: true },
    });
    res.json(gestorAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar o gestor: ", error);
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
    console.error("Erro ao deletar gestor: ", error);
  }
};
