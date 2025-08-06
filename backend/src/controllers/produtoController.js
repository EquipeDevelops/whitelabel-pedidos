import { PrismaClient } from "../../generated/prisma/index.js";
import { logAction } from "../services/auditLogService.js";

const prisma = new PrismaClient();

export const createProduto = async (req, res) => {
  const { nome, preco, descricao, estoque } = req.body;
  if (!nome || preco === undefined || estoque === undefined) {
    return res.status(400).json({ error: "Nome, preço e estoque são obrigatórios." });
  }
  if (preco <= 0 || estoque < 0) {
    return res.status(400).json({ error: "Preço deve ser positivo e estoque não pode ser negativo." });
  }

  try {
    const novoProduto = await prisma.produto.create({
      data: {
        nome,
        preco: parseFloat(preco),
        descricao,
        estoque: parseInt(estoque),
      },
    });
    await logAction({
      action: "PRODUTO_CREATE",
      targetId: novoProduto.id,
      author: req.usuario,
      details: `Produto "${novoProduto.nome}" criado com estoque inicial de ${novoProduto.estoque}.`,
      targetType: "PRODUTO"
    });
    res.status(201).json(novoProduto);
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    res.status(500).json({ error: "Erro ao criar produto." });
  }
};

export const getProdutos = async (req, res) => {
  const { page = 1, limit = 10, search = "", sortBy = "criadoEm", sortOrder = "desc" } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const where = {};
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { descricao: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy = { [sortBy]: sortOrder };

    const produtos = await prisma.produto.findMany({
      where,
      skip: offset,
      take: parseInt(limit),
      orderBy,
    });

    const totalProdutos = await prisma.produto.count({ where });

    res.json({
      data: produtos,
      totalProdutos,
      totalPages: Math.ceil(totalProdutos / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ error: "Erro ao buscar produtos." });
  }
};

export const getProdutoById = async (req, res) => {
  const { id } = req.params;
  try {
    const produto = await prisma.produto.findUnique({
      where: { id: parseInt(id) },
    });
    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }
    res.json(produto);
  } catch (error) {
    console.error("Erro ao buscar produto por ID:", error);
    res.status(500).json({ error: "Erro ao buscar produto." });
  }
};

export const updateProduto = async (req, res) => {
  const { id } = req.params;
  const { nome, preco, descricao, estoque } = req.body;
  try {
    const produtoExistente = await prisma.produto.findUnique({ where: { id: parseInt(id) } });
    if (!produtoExistente) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    const updatedData = {};
    if (nome !== undefined) updatedData.nome = nome;
    if (preco !== undefined) updatedData.preco = parseFloat(preco);
    if (descricao !== undefined) updatedData.descricao = descricao;
    if (estoque !== undefined) updatedData.estoque = parseInt(estoque);

    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({ error: "Nenhum dado para atualizar foi fornecido." });
    }

    const updatedProduto = await prisma.produto.update({
      where: { id: parseInt(id) },
      data: updatedData,
    });

    await logAction({
      action: "PRODUTO_UPDATE",
      targetId: updatedProduto.id,
      author: req.usuario,
      details: `Produto "${updatedProduto.nome}" atualizado. Estoque: ${updatedProduto.estoque}.`,
      targetType: "PRODUTO"
    });
    res.json(updatedProduto);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res.status(500).json({ error: "Erro ao atualizar produto." });
  }
};

export const deleteProduto = async (req, res) => {
  const { id } = req.params;
  try {
    const produto = await prisma.produto.findUnique({ where: { id: parseInt(id) } });
    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }
    await prisma.produto.delete({ where: { id: parseInt(id) } });
    await logAction({
      action: "PRODUTO_DELETE",
      targetId: produto.id,
      author: req.usuario,
      details: `Produto "${produto.nome}" deletado.`,
      targetType: "PRODUTO"
    });
    res.json({ message: "Produto deletado com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    res.status(500).json({ error: "Erro ao deletar produto." });
  }
};
