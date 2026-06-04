// src/routes/cidades.ts — /api/cidades (CRUD)
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import db from '../db/client';
import { cidades, ufs } from '../db/schema';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createId } from '../utils/id';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { ufId } = req.query;
  const list = ufId
    ? db.select().from(cidades).where(eq(cidades.ufId, String(ufId))).all()
    : db.select().from(cidades).all();
  return res.json({ data: list, total: list.length });
});

router.get('/:id', (req: Request, res: Response) => {
  const cidade = db.select().from(cidades).where(eq(cidades.id, req.params.id)).get();
  if (!cidade) return res.status(404).json({ error: 'Cidade não encontrada' });
  const uf = db.select().from(ufs).where(eq(ufs.id, cidade.ufId)).get();
  return res.json({ data: { ...cidade, uf } });
});

const cidadeSchema = z.object({ nome: z.string().min(2), ufId: z.string() });

router.post('/', authenticate, requireRole('superadmin'), validate(cidadeSchema), (req: Request, res: Response) => {
  const uf = db.select().from(ufs).where(eq(ufs.id, req.body.ufId)).get();
  if (!uf) return res.status(404).json({ error: 'UF não encontrada' });
  const id = createId();
  db.insert(cidades).values({ id, ...req.body }).run();
  return res.status(201).json({ data: db.select().from(cidades).where(eq(cidades.id, id)).get() });
});

router.put('/:id', authenticate, requireRole('superadmin'), validate(cidadeSchema), (req: Request, res: Response) => {
  const cidade = db.select().from(cidades).where(eq(cidades.id, req.params.id)).get();
  if (!cidade) return res.status(404).json({ error: 'Cidade não encontrada' });
  db.update(cidades).set(req.body).where(eq(cidades.id, req.params.id)).run();
  return res.json({ data: db.select().from(cidades).where(eq(cidades.id, req.params.id)).get() });
});

router.delete('/:id', authenticate, requireRole('superadmin'), (req: Request, res: Response) => {
  const cidade = db.select().from(cidades).where(eq(cidades.id, req.params.id)).get();
  if (!cidade) return res.status(404).json({ error: 'Cidade não encontrada' });
  db.delete(cidades).where(eq(cidades.id, req.params.id)).run();
  return res.json({ message: 'Cidade removida' });
});

export default router;
