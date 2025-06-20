
import prisma from '../app.js';

export const getOrders = async (req, res) => {
  try {
    const orders = await prisma.pedido.findMany({
      include: {
        cliente: true,
        funcionario: true,
        entrega: true,
        avaliacoes: true,
        comentarios: true,
      },
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos.' });
  }
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.pedido.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true,
        funcionario: true,
        entrega: true,
        avaliacoes: true,
        comentarios: true,
      },
    });
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedido.' });
  }
};

export const createOrderDelivery = async (req, res) => {
  const { id } = req.params;
  const { funcionarioId, enderecoEntrega, dataPrevista, statusEntrega } = req.body;

  if (!enderecoEntrega) {
    return res.status(400).json({ error: 'O endereço de entrega é obrigatório.' });
  }

  try {
    const newDelivery = await prisma.entrega.create({
      data: {
        pedido: { connect: { id: parseInt(id) } },
        funcionario: funcionarioId ? { connect: { id: parseInt(funcionarioId) } } : undefined,
        enderecoEntrega,
        dataPrevista: dataPrevista ? new Date(dataPrevista) : undefined,
        statusEntrega: statusEntrega || 'PREPARANDO',
      },
    });
    res.status(201).json(newDelivery);
  } catch (error) {
    console.error('Erro ao criar entrega para o pedido:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('pedidoId')) {
      return res.status(409).json({ error: 'Já existe uma entrega registrada para este pedido.' });
    }
    res.status(500).json({ error: 'Erro ao criar entrega para o pedido.' });
  }
};

export const getOrderDelivery = async (req, res) => {
  const { id } = req.params;
  try {
    const delivery = await prisma.entrega.findUnique({
      where: { pedidoId: parseInt(id) },
      include: { funcionario: { select: { id: true, nome: true } } },
    });
    if (!delivery) {
      return res.status(404).json({ error: 'Entrega não encontrada para este pedido.' });
    }
    res.status(200).json(delivery);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar entrega do pedido.' });
  }
};

export const updateOrderDeliveryStatus = async (req, res) => {
  const { id } = req.params;
  const { statusEntrega, dataEntrega } = req.body;

  if (!statusEntrega) {
    return res.status(400).json({ error: 'O status da entrega é obrigatório.' });
  }

  try {
    const updatedDelivery = await prisma.entrega.update({
      where: { pedidoId: parseInt(id) },
      data: {
        statusEntrega,
        dataEntrega: dataEntrega ? new Date(dataEntrega) : undefined,
      },
    });
    res.status(200).json(updatedDelivery);
  } catch (error) {
    console.error('Erro ao atualizar status da entrega:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Entrega não encontrada para este pedido.' });
    }
    res.status(500).json({ error: 'Erro ao atualizar status da entrega.' });
  }
};

export const addOrderReview = async (req, res) => {
  const { id } = req.params;
  const { nota, comentario, clienteId } = req.body;

  if (!clienteId || !nota) {
    return res.status(400).json({ error: 'clienteId e nota são obrigatórios para a avaliação.' });
  }
  if (nota < 1 || nota > 5) {
      return res.status(400).json({ error: 'A nota deve estar entre 1 e 5.' });
  }

  try {
    const newReview = await prisma.avaliacao.create({
      data: {
        nota: parseInt(nota),
        comentario,
        cliente: { connect: { id: parseInt(clienteId) } },
        pedido: { connect: { id: parseInt(id) } },
      },
    });
    res.status(201).json(newReview);
  } catch (error) {
    console.error('Erro ao adicionar avaliação ao pedido:', error);
    res.status(500).json({ error: 'Erro ao adicionar avaliação ao pedido.' });
  }
};

export const getOrderReviews = async (req, res) => {
  const { id } = req.params;
  try {
    const reviews = await prisma.avaliacao.findMany({
      where: { pedidoId: parseInt(id) },
      include: { cliente: { select: { id: true, nome: true, email: true } } },
    });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar avaliações do pedido.' });
  }
};

export const addOrderComment = async (req, res) => {
  const { id } = req.params;
  const { texto, clienteId } = req.body;

  if (!clienteId || !texto) {
    return res.status(400).json({ error: 'clienteId e texto são obrigatórios para o comentário.' });
  }

  try {
    const newComment = await prisma.comentario.create({
      data: {
        texto,
        cliente: { connect: { id: parseInt(clienteId) } },
        pedido: { connect: { id: parseInt(id) } },
      },
    });
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Erro ao adicionar comentário ao pedido:', error);
    res.status(500).json({ error: 'Erro ao adicionar comentário ao pedido.' });
  }
};

export const getOrderComments = async (req, res) => {
  const { id } = req.params;
  try {
    const comments = await prisma.comentario.findMany({
      where: { pedidoId: parseInt(id) },
      include: { cliente: { select: { id: true, nome: true, email: true } } },
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar comentários do pedido.' });
  }
};