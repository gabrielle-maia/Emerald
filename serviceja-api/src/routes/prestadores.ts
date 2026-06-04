// src/routes/prestadores.ts — /api/prestadores (CRUD + Agenda)
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import db from '../db/client';
import { prestadores, usuarios, servicos, avaliacoes, agenda } from '../db/schema';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createId } from '../utils/id';

const router = Router();

function parseJSON(val: string | null, fb: any = []) {
  try { return val ? JSON.parse(val) : fb; } catch { return fb; }
}

function enrichPrestador(p: any) {
  const user = db.select({ nome: usuarios.nome, avatar: usuarios.avatar, email: usuarios.email, telefone: usuarios.telefone })
    .from(usuarios).where(eq(usuarios.id, p.usuarioId)).get();
  return { ...p, especialidades: parseJSON(p.especialidades), ...user };
}

// ─── GET /api/prestadores ──────────────────────────────────────────────────────
router.get('/', (_req: Request, res: Response) => {
  const all = db.select().from(prestadores).where(eq(prestadores.ativo, true)).all();
  return res.json({ data: all.map(enrichPrestador), total: all.length });
});

// ─── GET /api/prestadores/:id ──────────────────────────────────────────────────
router.get('/:id', (req: Request, res: Response) => {
  const p = db.select().from(prestadores).where(eq(prestadores.id, req.params.id)).get();
  if (!p) return res.status(404).json({ error: 'Prestador não encontrado' });

  const servicosDoPrestador = db.select().from(servicos).where(eq(servicos.prestadorId, p.id)).all();
  const avalis = db.select().from(avaliacoes).where(eq(avaliacoes.prestadorId, p.id)).all();

  return res.json({
    data: {
      ...enrichPrestador(p),
      servicos: servicosDoPrestador,
      avaliacoes: avalis,
    }
  });
});

// ─── PUT /api/prestadores/:id — prestador atualiza próprio perfil ──────────────
const prestSchema = z.object({
  bio:           z.string().max(1000).optional(),
  especialidades: z.array(z.string()).optional(),
  cidadeId:      z.string().optional().nullable(),
  ufId:          z.string().optional().nullable(),
  tempoResposta: z.string().optional(),
  faixaPreco:    z.string().optional(),
});

router.put('/:id', authenticate, requireRole('prestador', 'superadmin'), validate(prestSchema), (req: AuthRequest, res: Response) => {
  const p = db.select().from(prestadores).where(eq(prestadores.id, req.params.id)).get();
  if (!p) return res.status(404).json({ error: 'Prestador não encontrado' });

  if (req.user!.role !== 'superadmin' && p.usuarioId !== req.user!.id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  const { especialidades, ...rest } = req.body;
  const updates: any = { ...rest, updatedAt: new Date().toISOString() };
  if (especialidades) updates.especialidades = JSON.stringify(especialidades);
  db.update(prestadores).set(updates).where(eq(prestadores.id, req.params.id)).run();
  return res.json({ data: enrichPrestador(db.select().from(prestadores).where(eq(prestadores.id, req.params.id)).get()!) });
});

// ─── AGENDA ───────────────────────────────────────────────────────────────────
// GET /api/prestadores/:id/agenda?data=YYYY-MM-DD
router.get('/:id/agenda', (req: Request, res: Response) => {
  const { data } = req.query;
  let slots = db.select().from(agenda).where(eq(agenda.prestadorId, req.params.id)).all();
  if (data) slots = slots.filter(s => s.data === String(data));
  return res.json({ data: slots });
});

// POST /api/prestadores/:id/agenda — adicionar slots
const agendaSchema = z.object({
  data:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve ser YYYY-MM-DD'),
  horario: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve ser HH:MM'),
  disponivel: z.boolean().default(true),
});

router.post('/:id/agenda', authenticate, requireRole('prestador', 'superadmin'), validate(agendaSchema), (req: AuthRequest, res: Response) => {
  const p = db.select().from(prestadores).where(eq(prestadores.id, req.params.id)).get();
  if (!p) return res.status(404).json({ error: 'Prestador não encontrado' });
  if (req.user!.role !== 'superadmin' && p.usuarioId !== req.user!.id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  const id = createId();
  db.insert(agenda).values({ id, prestadorId: req.params.id, ...req.body }).run();
  return res.status(201).json({ data: db.select().from(agenda).where(eq(agenda.id, id)).get() });
});

// DELETE /api/prestadores/:id/agenda/:slotId
router.delete('/:id/agenda/:slotId', authenticate, requireRole('prestador', 'superadmin'), (req: AuthRequest, res: Response) => {
  const p = db.select().from(prestadores).where(eq(prestadores.id, req.params.id)).get();
  if (!p) return res.status(404).json({ error: 'Prestador não encontrado' });
  if (req.user!.role !== 'superadmin' && p.usuarioId !== req.user!.id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  db.delete(agenda).where(and(eq(agenda.id, req.params.slotId), eq(agenda.prestadorId, req.params.id))).run();
  return res.json({ message: 'Slot removido' });
});

// ─── GET /api/prestadores/me — prestador logado ────────────────────────────────
router.get('/me/perfil', authenticate, requireRole('prestador'), (req: AuthRequest, res: Response) => {
  const p = db.select().from(prestadores).where(eq(prestadores.usuarioId, req.user!.id)).get();
  if (!p) return res.status(404).json({ error: 'Perfil de prestador não encontrado' });
  return res.json({ data: enrichPrestador(p) });
});

export default router;
