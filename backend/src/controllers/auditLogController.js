import { PrismaClient } from "../../generated/prisma/index.js";
const prisma = new PrismaClient();

export const getAuditLogs = async (req, res) => {
  const { targetId } = req.query;

  if (!targetId) {
    return res.status(400).json({ error: "O ID do alvo é obrigatório." });
  }

  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        targetId: parseInt(targetId),
        targetType: "GESTOR",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar logs de auditoria." });
  }
};
