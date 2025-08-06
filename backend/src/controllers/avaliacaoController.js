import { PrismaClient } from "../../generated/prisma/index.js";
import { logAction } from "../services/auditLogService.js";

const prisma = new PrismaClient();

export const createAvaliacao = async (req, res) => {
  const { pedidoId, nota, comentario } = req.body;
  const clienteId = req.usuario.id; 

  if (!pedidoId || nota === undefined || nota < 1 || nota > 5) {
    return res.status(400).json({ error: "ID do pedido e nota (entre 1 e 5) são obrigatórios." });
  }

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(pedidoId) },
      select: { clienteId: true, status: true, avaliacao: true },
    });

    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    if (pedido.clienteId !== clienteId) {
      return res.status(403).json({ error: "Você não tem permissão para avaliar este pedido." });
    }

    if (pedido.status !== "ENTREGUE") {
      return res.status(400).json({ error: "Apenas pedidos com status 'ENTREGUE' podem ser avaliados." });
    }

    if (pedido.avaliacao) {
      return res.status(409).json({ error: "Este pedido já foi avaliado." });
    }

    const novaAvaliacao = await prisma.avaliacao.create({
      data: {
        pedidoId: parseInt(pedidoId),
        nota: parseInt(nota),
        comentario,
      },
    });

    await logAction({
      action: "AVALIACAO_CREATE",
      targetId: novaAvaliacao.id,
      author: req.usuario,
      details: `Pedido #${pedidoId} avaliado com nota ${nota}.`,
      targetType: "AVALIACAO"
    });

    res.status(201).json(novaAvaliacao);
  } catch (error) {
    console.error("Erro ao criar avaliação:", error);
    res.status(500).json({ error: "Erro ao criar avaliação." });
  }
};

export const getAvaliacaoByPedido = async (req, res) => {
  const { pedidoId } = req.params;
  try {
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { pedidoId: parseInt(pedidoId) },
    });
    if (!avaliacao) {
      return res.status(404).json({ error: "Avaliação não encontrada para este pedido." });
    }
    res.json(avaliacao);
  } catch (error) {
    console.error("Erro ao buscar avaliação por pedido:", error);
    res.status(500).json({ error: "Erro ao buscar avaliação." });
  }
};

export const getAvaliacoesByProduto = async (req, res) => {
  const { produtoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
   
    const itensPedido = await prisma.itemPedido.findMany({
      where: { produtoId: parseInt(produtoId) },
      select: { pedidoId: true },
    });

    const pedidoIds = itensPedido.map(item => item.pedidoId);


    const avaliacoes = await prisma.avaliacao.findMany({
      where: {
        pedidoId: { in: pedidoIds },
      },
      include: {
        pedido: {
          select: {
            id: true,
            cliente: { select: { nome: true } },
            criadoEm: true
          }
        }
      },
      skip: offset,
      take: parseInt(limit),
      orderBy: { criadoEm: "desc" },
    });

    const totalAvaliacoes = await prisma.avaliacao.count({
      where: { pedidoId: { in: pedidoIds } },
    });

    res.json({
      data: avaliacoes,
      totalAvaliacoes,
      totalPages: Math.ceil(totalAvaliacoes / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Erro ao buscar avaliações por produto:", error);
    res.status(500).json({ error: "Erro ao buscar avaliações por produto." });
  }
};


export const updateAvaliacao = async (req, res) => {
  const { id } = req.params;
  const { nota, comentario } = req.body;
  const clienteId = req.usuario.id;

  if (nota === undefined || nota < 1 || nota > 5) {
    return res.status(400).json({ error: "Nota (entre 1 e 5) é obrigatória." });
  }

  try {
    const avaliacaoExistente = await prisma.avaliacao.findUnique({
      where: { id: parseInt(id) },
      include: { pedido: { select: { clienteId: true } } }
    });

    if (!avaliacaoExistente) {
      return res.status(404).json({ error: "Avaliação não encontrada." });
    }

    if (avaliacaoExistente.pedido.clienteId !== clienteId) {
      return res.status(403).json({ error: "Você não tem permissão para atualizar esta avaliação." });
    }

    const updatedAvaliacao = await prisma.avaliacao.update({
      where: { id: parseInt(id) },
      data: {
        nota: parseInt(nota),
        comentario,
      },
    });

    await logAction({
      action: "AVALIACAO_UPDATE",
      targetId: updatedAvaliacao.id,
      author: req.usuario,
      details: `Avaliação #${updatedAvaliacao.id} atualizada para nota ${nota}.`,
      targetType: "AVALIACAO"
    });

    res.json(updatedAvaliacao);
  } catch (error) {
    console.error("Erro ao atualizar avaliação:", error);
    res.status(500).json({ error: "Erro ao atualizar avaliação." });
  }
};

export const deleteAvaliacao = async (req, res) => {
  const { id } = req.params;
  const clienteId = req.usuario.id; 

  try {
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: parseInt(id) },
      include: { pedido: { select: { clienteId: true } } }
    });

    if (!avaliacao) {
      return res.status(404).json({ error: "Avaliação não encontrada." });
    }


    if (req.usuario.tipo === 'cliente' && avaliacao.pedido.clienteId !== clienteId) {
      return res.status(403).json({ error: "Você não tem permissão para deletar esta avaliação." });
    }

    await prisma.avaliacao.delete({ where: { id: parseInt(id) } });

    await logAction({
      action: "AVALIACAO_DELETE",
      targetId: avaliacao.id,
      author: req.usuario,
      details: `Avaliação #${avaliacao.id} deletada.`,
      targetType: "AVALIACAO"
    });

    res.json({ message: "Avaliação deletada com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar avaliação:", error);
    res.status(500).json({ error: "Erro ao deletar avaliação." });
  }
};
