
import prisma from '../app.js';

export const getProducts = async (req, res) => {
  try {
    const products = await prisma.produto.findMany();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos.' });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.produto.findUnique({
      where: { id: parseInt(id) },
      include: {
        avaliacoes: true,
        comentarios: true,
      },
    });
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produto.' });
  }
};

export const addProductReview = async (req, res) => {
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
        produto: { connect: { id: parseInt(id) } },
      },
    });
    res.status(201).json(newReview);
  } catch (error) {
    console.error('Erro ao adicionar avaliação ao produto:', error);
    res.status(500).json({ error: 'Erro ao adicionar avaliação ao produto.' });
  }
};

export const getProductReviews = async (req, res) => {
  const { id } = req.params;
  try {
    const reviews = await prisma.avaliacao.findMany({
      where: { produtoId: parseInt(id) },
      include: { cliente: { select: { id: true, nome: true, email: true } } },
    });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar avaliações do produto.' });
  }
};

export const addProductComment = async (req, res) => {
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
        produto: { connect: { id: parseInt(id) } },
      },
    });
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Erro ao adicionar comentário ao produto:', error);
    res.status(500).json({ error: 'Erro ao adicionar comentário ao produto.' });
  }
};

export const getProductComments = async (req, res) => {
  const { id } = req.params;
  try {
    const comments = await prisma.comentario.findMany({
      where: { produtoId: parseInt(id) },
      include: { cliente: { select: { id: true, nome: true, email: true } } },
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar comentários do produto.' });
  }
};