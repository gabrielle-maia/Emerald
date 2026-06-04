// src/routes/ufs.ts — /api/ufs e /api/cidades (CRUD)
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import db from '../db/client';
import { ufs, cidades } from '../db/schema';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createId } from '../utils/id';

const router = Router();

// ─── UFs ──────────────────────────────────────────────────────────────────────
router.get('/', (_req, res: Response) => {
  const all = db.select().from(ufs).all();
  return res.json({ data: all });
});

router.get('/:id', (req: Request, res: Response) => {
  const uf = db.select().from(ufs).where(eq(ufs.id, req.params.id)).get();
  if (!uf) return res.status(404).json({ error: 'UF não encontrada' });
  const cidadesDaUF = db.select().from(cidades).where(eq(cidades.ufId, uf.id)).all();
  return res.json({ data: { ...uf, cidades: cidadesDaUF } });
});

const ufSchema = z.object({ nome: z.string().min(2), sigla: z.string().length(2).toUpperCase() });

router.post('/', authenticate, requireRole('superadmin'), validate(ufSchema), (req: Request, res: Response) => {
  const id = createId();
  db.insert(ufs).values({ id, ...req.body }).run();
  return res.status(201).json({ data: db.select().from(ufs).where(eq(ufs.id, id)).get() });
});

router.put('/:id', authenticate, requireRole('superadmin'), validate(ufSchema), (req: Request, res: Response) => {
  const uf = db.select().from(ufs).where(eq(ufs.id, req.params.id)).get();
  if (!uf) return res.status(404).json({ error: 'UF não encontrada' });
  db.update(ufs).set(req.body).where(eq(ufs.id, req.params.id)).run();
  return res.json({ data: db.select().from(ufs).where(eq(ufs.id, req.params.id)).get() });
});

router.delete('/:id', authenticate, requireRole('superadmin'), (req: Request, res: Response) => {
  const uf = db.select().from(ufs).where(eq(ufs.id, req.params.id)).get();
  if (!uf) return res.status(404).json({ error: 'UF não encontrada' });
  db.delete(ufs).where(eq(ufs.id, req.params.id)).run();
  return res.json({ message: 'UF removida' });
});

// ─── Cidades (sub-recurso de UF) ──────────────────────────────────────────────
router.get('/:id/cidades', (req: Request, res: Response) => {
  const cidadesUF = db.select().from(cidades).where(eq(cidades.ufId, req.params.id)).all();
  return res.json({ data: cidadesUF });
});

export default router;
