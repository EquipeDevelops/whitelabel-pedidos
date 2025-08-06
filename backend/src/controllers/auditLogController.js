import { PrismaClient } from "../../generated/prisma/index.js";

const prisma = new PrismaClient();

export const logAction = async ({ action, targetId, author, details = "", targetType = "GESTOR" }) => {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        targetId,
        targetType,
        authorId: author ? author.id : null,
        authorName: author ? author.nome : "Sistema",
        details,
      },
    });
  } catch (error) {
    console.error("Erro ao registrar log de auditoria:", error);
   
  }
};

export const getAuditLogs = async (req, res) => {
  const { targetId, targetType, page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const where = {};
    if (targetId) {
      where.targetId = parseInt(targetId);
    }
    if (targetType) {
      where.targetType = targetType.toUpperCase();
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: parseInt(limit),
    });

    const totalLogs = await prisma.auditLog.count({ where });

    res.json({
      data: logs,
      totalLogs,
      totalPages: Math.ceil(totalLogs / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Erro ao buscar logs de auditoria:", error);
    res.status(500).json({ error: "Erro ao buscar logs de auditoria." });
  }
};
