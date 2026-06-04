// src/routes/usuarios.ts — /api/usuarios (CRUD)
import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import db from '../db/client';
import { usuarios, enderecos, cidades, ufs } from '../db/schema';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createId } from '../utils/id';

const router = Router();

function sanitize(u: any) {
  const { senhaHash, refreshToken, ...safe } = u;
  return safe;
}

// ─── GET /api/usuarios — superadmin lista todos ────────────────────────────────
router.get('/', authenticate, requireRole('superadmin'), (_req, res: Response) => {
  const all = db.select().from(usuarios).all();
  return res.json({ data: all.map(sanitize), total: all.length });
});

// ─── GET /api/usuarios/:id ─────────────────────────────────────────────────────
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  // Só pode ver o próprio perfil (ou admin)
  if (req.user!.id !== id && req.user!.role !== 'superadmin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  const user = db.select().from(usuarios).where(eq(usuarios.id, id)).get();
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  const enderecosUser = db.select().from(enderecos).where(eq(enderecos.usuarioId, id)).all();
  return res.json({ data: { ...sanitize(user), enderecos: enderecosUser } });
});

// ─── PUT /api/usuarios/:id — atualizar perfil ──────────────────────────────────
const updateSchema = z.object({
  nome:      z.string().min(2).optional(),
  telefone:  z.string().optional(),
  avatar:    z.string().url().optional().nullable(),
  bio:       z.string().max(500).optional(),
  cidadeId:  z.string().optional().nullable(),
  ufId:      z.string().optional().nullable(),
}).strict();

router.put('/:id', authenticate, validate(updateSchema), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (req.user!.id !== id && req.user!.role !== 'superadmin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  const user = db.select().from(usuarios).where(eq(usuarios.id, id)).get();
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  db.update(usuarios).set({ ...req.body, updatedAt: new Date().toISOString() }).where(eq(usuarios.id, id)).run();
  const updated = db.select().from(usuarios).where(eq(usuarios.id, id)).get()!;
  return res.json({ message: 'Perfil atualizado', data: sanitize(updated) });
});

// ─── PUT /api/usuarios/:id/senha ───────────────────────────────────────────────
router.put('/:id/senha', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (req.user!.id !== id) return res.status(403).json({ error: 'Acesso negado' });

  const { senhaAtual, novaSenha } = req.body;
  if (!senhaAtual || !novaSenha || novaSenha.length < 6) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }
  const user = db.select().from(usuarios).where(eq(usuarios.id, id)).get();
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  const valid = await bcrypt.compare(senhaAtual, user.senhaHash);
  if (!valid) return res.status(401).json({ error: 'Senha atual incorreta' });

  const hash = await bcrypt.hash(novaSenha, 10);
  db.update(usuarios).set({ senhaHash: hash, updatedAt: new Date().toISOString() }).where(eq(usuarios.id, id)).run();
  return res.json({ message: 'Senha alterada com sucesso' });
});

// ─── DELETE /api/usuarios/:id — soft delete ────────────────────────────────────
router.delete('/:id', authenticate, requireRole('superadmin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = db.select().from(usuarios).where(eq(usuarios.id, id)).get();
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  db.update(usuarios).set({ ativo: false, updatedAt: new Date().toISOString() }).where(eq(usuarios.id, id)).run();
  return res.json({ message: 'Usuário desativado com sucesso' });
});

// ─── GET /api/usuarios/:id/enderecos ──────────────────────────────────────────
router.get('/:id/enderecos', authenticate, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (req.user!.id !== id && req.user!.role !== 'superadmin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  const list = db.select().from(enderecos).where(eq(enderecos.usuarioId, id)).all();
  return res.json({ data: list });
});

// ─── POST /api/usuarios/:id/enderecos ─────────────────────────────────────────
const enderecoSchema = z.object({
  label:       z.string().default('Casa'),
  logradouro:  z.string().min(3),
  numero:      z.string().min(1),
  complemento: z.string().optional(),
  bairro:      z.string().min(2),
  cidade:      z.string().min(2),
  estado:      z.string().length(2),
  cep:         z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  isPadrao:    z.boolean().default(false),
});

router.post('/:id/enderecos', authenticate, validate(enderecoSchema), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (req.user!.id !== id) return res.status(403).json({ error: 'Acesso negado' });

  if (req.body.isPadrao) {
    db.update(enderecos).set({ isPadrao: false }).where(eq(enderecos.usuarioId, id)).run();
  }
  const eid = createId();
  db.insert(enderecos).values({ id: eid, usuarioId: id, ...req.body }).run();
  const endereco = db.select().from(enderecos).where(eq(enderecos.id, eid)).get();
  return res.status(201).json({ message: 'Endereço adicionado', data: endereco });
});

// ─── DELETE /api/usuarios/:id/enderecos/:eid ──────────────────────────────────
router.delete('/:id/enderecos/:eid', authenticate, (req: AuthRequest, res: Response) => {
  const { id, eid } = req.params;
  if (req.user!.id !== id) return res.status(403).json({ error: 'Acesso negado' });
  const end = db.select().from(enderecos).where(eq(enderecos.id, eid)).get();
  if (!end || end.usuarioId !== id) return res.status(404).json({ error: 'Endereço não encontrado' });
  db.delete(enderecos).where(eq(enderecos.id, eid)).run();
  return res.json({ message: 'Endereço removido' });
});

export default router;
