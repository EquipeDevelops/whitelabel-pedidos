
import prisma from '../app.js';

export const createClient = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    const existingClient = await prisma.cliente.findUnique({ where: { email } });
    if (existingClient) {
      return res.status(409).json({ error: 'Email já cadastrado.' });
    }

    const newClient = await prisma.cliente.create({
      data: {
        nome,
        email,
        senha,
      },
    });
    res.status(201).json(newClient);
  } catch (error) {
    console.error('Erro ao cadastrar cliente:', error);
    res.status(500).json({ error: 'Erro ao cadastrar cliente.' });
  }
};

export const getClients = async (req, res) => {
  try {
    const clients = await prisma.cliente.findMany({
      include: {
        pedidos: true,
        avaliacoes: true,
        comentarios: true,
      },
    });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes.' });
  }
};

export const getClientById = async (req, res) => {
  const { id } = req.params;
  try {
    const client = await prisma.cliente.findUnique({
      where: { id: parseInt(id) },
      include: {
        pedidos: true,
        avaliacoes: true,
        comentarios: true,
      },
    });
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cliente.' });
  }
};

export const updateClient = async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha } = req.body;

  try {
    const updatedClient = await prisma.cliente.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        email,
        senha,
      },
    });
    res.status(200).json(updatedClient);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }
    res.status(500).json({ error: 'Erro ao atualizar cliente.' });
  }
};

export const deleteClient = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.cliente.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }
    res.status(500).json({ error: 'Erro ao deletar cliente.' });
  }
};