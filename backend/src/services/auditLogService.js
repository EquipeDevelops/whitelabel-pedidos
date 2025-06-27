import { PrismaClient } from "../../generated/prisma/index.js";
const prisma = new PrismaClient();

/**
 * Cria um registro de log de auditoria.
 * @param {object} logData - Os dados do log.
 * @param {string} logData.action - A ação realizada (ex: GESTOR_CREATE).
 * @param {number} logData.targetId - O ID do recurso afetado.
 * @param {object} [logData.author] - O usuário que realizou a ação (de req.usuario).
 * @param {string} [logData.details] - Detalhes adicionais sobre a ação.
 */
export async function logAction({ action, targetId, author, details }) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        targetId,
        targetType: "GESTOR",
        authorId: author?.id || null,
        authorName: author?.nome || "Sistema",
        details,
      },
    });
  } catch (error) {
    console.error("Falha ao criar registro de auditoria:", error);
  }
}
