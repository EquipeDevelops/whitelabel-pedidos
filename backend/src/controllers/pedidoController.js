import { PrismaClient } from "../../generated/prisma/index.js";
import { logAction } from "../services/auditLogService.js";

const prisma = new PrismaClient();

export const createPedido = async (req, res) => {
  const { clienteId, produtos } = req.body;

  if (!clienteId || !produtos || !Array.isArray(produtos) || produtos.length === 0) {
    return res.status(400).json({ error: "Dados do pedido inválidos. Cliente e produtos são obrigatórios." });
  }

  try {
    const newPedido = await prisma.$transaction(async (prisma) => {
      for (const item of produtos) {
        const produto = await prisma.produto.findUnique({
          where: { id: item.produtoId },
        });

        if (!produto || produto.estoque < item.quantidade) {
          throw new Error(`Estoque insuficiente para o produto: ${produto ? produto.nome : 'ID ' + item.produtoId}`);
        }

        await prisma.produto.update({
          where: { id: item.produtoId },
          data: { estoque: { decrement: item.quantidade } },
        });
      }

      const pedido = await prisma.pedido.create({
        data: {
          cliente: { connect: { id: clienteId } },
          status: "PENDENTE",
        },
      });

      const itensPedidoData = produtos.map(item => ({
        pedidoId: pedido.id,
        produtoId: item.produtoId,
        quantidade: item.quantidade,
      }));

      await prisma.itemPedido.createMany({
        data: itensPedidoData,
      });

      return pedido;
    });

    await logAction({
      action: "PEDIDO_CREATE",
      targetId: newPedido.id,
      author: req.usuario || { id: clienteId, nome: "Cliente" },
      details: `Novo pedido #${newPedido.id} criado pelo cliente ID ${clienteId}.`,
      targetType: "PEDIDO"
    });

    res.status(201).json(newPedido);
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ error: error.message || "Erro ao criar pedido." });
  }
};

export const getPedidosByCliente = async (req, res) => {
  const { clienteId } = req.params;
  const { page = 1, limit = 10, status } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const where = { clienteId: parseInt(clienteId) };
    if (status) {
      where.status = status.toUpperCase();
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
        avaliacao: true,
        cliente: {
          select: { nome: true, email: true }
        },
        funcionario: {
          select: { nome: true, email: true }
        }
      },
      skip: offset,
      take: parseInt(limit),
      orderBy: { criadoEm: "desc" },
    });

    const totalPedidos = await prisma.pedido.count({ where });

    res.json({
      data: pedidos,
      totalPedidos,
      totalPages: Math.ceil(totalPedidos / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Erro ao buscar pedidos do cliente:", error);
    res.status(500).json({ error: "Erro ao buscar pedidos do cliente." });
  }
};

export const getPedidoById = async (req, res) => {
  const { id } = req.params;
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(id) },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
        avaliacao: true,
        cliente: {
          select: { nome: true, email: true }
        },
        funcionario: {
          select: { nome: true, email: true }
        }
      },
    });
    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }
    res.json(pedido);
  } catch (error) {
    console.error("Erro ao buscar pedido por ID:", error);
    res.status(500).json({ error: "Erro ao buscar pedido." });
  }
};

export const updatePedidoStatus = async (req, res) => {
  const { id } = req.params;
  const { status, funcionarioId } = req.body;

  const validStatuses = ["PENDENTE", "ACEITO", "RECUSADO", "ENTREGUE"];
  if (!status || !validStatuses.includes(status.toUpperCase())) {
    return res.status(400).json({ error: `Status inválido. Use um dos seguintes: ${validStatuses.join(", ")}` });
  }

  try {
    const pedidoExistente = await prisma.pedido.findUnique({ where: { id: parseInt(id) } });
    if (!pedidoExistente) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    const updateData = { status: status.toUpperCase() };
    if (funcionarioId) {
      updateData.funcionario = { connect: { id: parseInt(funcionarioId) } };
    }

    const updatedPedido = await prisma.pedido.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        cliente: { select: { nome: true } },
        funcionario: { select: { nome: true } }
      }
    });

    await logAction({
      action: "PEDIDO_STATUS_UPDATE",
      targetId: updatedPedido.id,
      author: req.usuario,
      details: `Status do pedido #${updatedPedido.id} alterado para ${updatedPedido.status}.`,
      targetType: "PEDIDO"
    });

    res.json(updatedPedido);
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    res.status(500).json({ error: "Erro ao atualizar status do pedido." });
  }
};

export const cancelPedido = async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(id) },
      include: { itens: true },
    });

    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    if (pedido.status !== "PENDENTE") {
      return res.status(400).json({ error: "Apenas pedidos com status PENDENTE podem ser cancelados." });
    }

    await prisma.$transaction(async (prisma) => {
      for (const item of pedido.itens) {
        await prisma.produto.update({
          where: { id: item.produtoId },
          data: { estoque: { increment: item.quantidade } },
        });
      }

      await prisma.itemPedido.deleteMany({
        where: { pedidoId: pedido.id },
      });

      await prisma.pedido.delete({
        where: { id: pedido.id },
      });
    });

    await logAction({
      action: "PEDIDO_CANCEL",
      targetId: pedido.id,
      author: req.usuario,
      details: `Pedido #${pedido.id} cancelado. Estoque restaurado.`,
      targetType: "PEDIDO"
    });

    res.json({ message: "Pedido cancelado com sucesso e estoque restaurado." });
  } catch (error) {
    console.error("Erro ao cancelar pedido:", error);
    res.status(500).json({ error: "Erro ao cancelar pedido." });
  }
};

export const listarTodosPedidos = async (req, res) => {
  const { page = 1, limit = 10, status, clienteId, funcionarioId } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const where = {};
    if (status) {
      where.status = status.toUpperCase();
    }
    if (clienteId) {
      where.clienteId = parseInt(clienteId);
    }
    if (funcionarioId) {
      where.funcionarioId = parseInt(funcionarioId);
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
        avaliacao: true,
        cliente: {
          select: { nome: true, email: true }
        },
        funcionario: {
          select: { nome: true, email: true }
        }
      },
      skip: offset,
      take: parseInt(limit),
      orderBy: { criadoEm: "desc" },
    });

    const totalPedidos = await prisma.pedido.count({ where });

    res.json({
      data: pedidos,
      totalPedidos,
      totalPages: Math.ceil(totalPedidos / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Erro ao listar todos os pedidos:", error);
    res.status(500).json({ error: "Erro ao buscar pedidos." });
  }
};
