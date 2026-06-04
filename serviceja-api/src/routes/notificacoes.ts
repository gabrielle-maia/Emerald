// src/routes/notificacoes.ts — /api/notificacoes
import { Router, Response } from 'express';
import { eq, and } from 'drizzle-orm';
import db from '../db/client';
import { notificacoes } from '../db/schema';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const all = db.select().from(notificacoes).where(eq(notificacoes.usuarioId, req.user!.id)).all();
  all.sort((a, b) => b.createdAt!.localeCompare(a.createdAt!));
  const naoLidas = all.filter(n => !n.lida).length;
  return res.json({ data: all, total: all.length, naoLidas });
});

router.patch('/:id/lida', authenticate, (req: AuthRequest, res: Response) => {
  const n = db.select().from(notificacoes).where(and(eq(notificacoes.id, req.params.id), eq(notificacoes.usuarioId, req.user!.id))).get();
  if (!n) return res.status(404).json({ error: 'Notificação não encontrada' });
  db.update(notificacoes).set({ lida: true }).where(eq(notificacoes.id, req.params.id)).run();
  return res.json({ message: 'Marcada como lida' });
});

router.patch('/marcar-todas/lidas', authenticate, (req: AuthRequest, res: Response) => {
  db.update(notificacoes).set({ lida: true }).where(eq(notificacoes.usuarioId, req.user!.id)).run();
  return res.json({ message: 'Todas marcadas como lidas' });
});

router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  db.delete(notificacoes).where(and(eq(notificacoes.id, req.params.id), eq(notificacoes.usuarioId, req.user!.id))).run();
  return res.json({ message: 'Notificação removida' });
});

export default router;
