// src/routes/categorias.ts — /api/categorias (CRUD)
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import db from '../db/client';
import { categorias, servicos } from '../db/schema';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createId } from '../utils/id';

const router = Router();

router.get('/', (_req, res: Response) => {
  const all = db.select().from(categorias).all();
  // Contar serviços por categoria
  const enriched = all.map(c => {
    const count = db.select().from(servicos).where(eq(servicos.categoriaId, c.id)).all().length;
    return { ...c, totalServicos: count };
  });
  return res.json({ data: enriched });
});

router.get('/:id', (req: Request, res: Response) => {
  const cat = db.select().from(categorias).where(eq(categorias.id, req.params.id)).get();
  if (!cat) return res.status(404).json({ error: 'Categoria não encontrada' });
  return res.json({ data: cat });
});

const catSchema = z.object({
  nome:      z.string().min(2),
  icone:     z.string().min(1),
  cor:       z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor deve ser hex válido'),
  descricao: z.string().optional(),
  ativo:     z.boolean().default(true),
});

router.post('/', authenticate, requireRole('superadmin'), validate(catSchema), (req: Request, res: Response) => {
  const id = createId();
  db.insert(categorias).values({ id, ...req.body }).run();
  return res.status(201).json({ data: db.select().from(categorias).where(eq(categorias.id, id)).get() });
});

router.put('/:id', authenticate, requireRole('superadmin'), validate(catSchema.partial()), (req: Request, res: Response) => {
  const cat = db.select().from(categorias).where(eq(categorias.id, req.params.id)).get();
  if (!cat) return res.status(404).json({ error: 'Categoria não encontrada' });
  db.update(categorias).set(req.body).where(eq(categorias.id, req.params.id)).run();
  return res.json({ data: db.select().from(categorias).where(eq(categorias.id, req.params.id)).get() });
});

router.delete('/:id', authenticate, requireRole('superadmin'), (req: Request, res: Response) => {
  const cat = db.select().from(categorias).where(eq(categorias.id, req.params.id)).get();
  if (!cat) return res.status(404).json({ error: 'Categoria não encontrada' });
  // Soft delete
  db.update(categorias).set({ ativo: false }).where(eq(categorias.id, req.params.id)).run();
  return res.json({ message: 'Categoria desativada' });
});

export default router;
