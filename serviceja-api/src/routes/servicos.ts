// src/routes/servicos.ts — /api/servicos (CRUD)
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { eq, and, gte, lte, like, or } from 'drizzle-orm';
import db from '../db/client';
import { servicos, prestadores, categorias, avaliacoes, favoritos, usuarios } from '../db/schema';
import { authenticate, requireRole, optionalAuth, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createId } from '../utils/id';

const router = Router();

function parseJSON(val: string | null, fallback: any = []) {
  try { return val ? JSON.parse(val) : fallback; } catch { return fallback; }
}

function enrichServico(s: any, userId?: string) {
  return {
    ...s,
    imagens: parseJSON(s.imagens),
    tags: parseJSON(s.tags),
    isFavorito: false, // será sobrescrito se userId fornecido
  };
}

// ─── GET /api/servicos ─────────────────────────────────────────────────────────
router.get('/', optionalAuth, (req: AuthRequest, res: Response) => {
  const { categoriaId, cidadeId, ufId, destaque, busca, minPreco, maxPreco, minAvaliacao, ordem, page = '1', limit = '20' } = req.query;

  let all = db.select().from(servicos).where(eq(servicos.disponivel, true)).all();

  // Filtros
  if (categoriaId) all = all.filter(s => s.categoriaId === categoriaId);
  if (cidadeId) all = all.filter(s => s.cidadeId === cidadeId);
  if (ufId) all = all.filter(s => s.ufId === ufId);
  if (destaque === 'true') all = all.filter(s => s.destaque);
  if (minPreco) all = all.filter(s => s.preco >= Number(minPreco));
  if (maxPreco) all = all.filter(s => s.preco <= Number(maxPreco));
  if (minAvaliacao) all = all.filter(s => s.mediaAvaliacoes >= Number(minAvaliacao));
  if (busca) {
    const q = String(busca).toLowerCase();
    all = all.filter(s =>
      s.nome.toLowerCase().includes(q) ||
      s.descricao.toLowerCase().includes(q) ||
      s.tags.toLowerCase().includes(q)
    );
  }

  // Ordenação
  if (ordem === 'preco_asc') all.sort((a, b) => a.preco - b.preco);
  else if (ordem === 'preco_desc') all.sort((a, b) => b.preco - a.preco);
  else if (ordem === 'avaliacao') all.sort((a, b) => b.mediaAvaliacoes - a.mediaAvaliacoes);
  else all.sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));

  // Paginação
  const pageN = Math.max(1, Number(page));
  const limitN = Math.min(50, Math.max(1, Number(limit)));
  const total = all.length;
  const paginated = all.slice((pageN - 1) * limitN, pageN * limitN);

  // Enriquecer com prestador e categoria
  const favoritosUser = req.user
    ? db.select().from(favoritos).where(eq(favoritos.usuarioId, req.user.id)).all().map(f => f.servicoId)
    : [];

  const result = paginated.map(s => {
    const prestador = db.select().from(prestadores).where(eq(prestadores.id, s.prestadorId)).get();
    const prestadorUser = prestador ? db.select({ nome: usuarios.nome, avatar: usuarios.avatar }).from(usuarios).where(eq(usuarios.id, prestador.usuarioId)).get() : null;
    const categoria = db.select().from(categorias).where(eq(categorias.id, s.categoriaId)).get();
    return {
      ...enrichServico(s),
      isFavorito: favoritosUser.includes(s.id),
      prestador: prestador ? { ...prestador, especialidades: parseJSON(prestador.especialidades), nome: prestadorUser?.nome, avatar: prestadorUser?.avatar } : null,
      categoria,
    };
  });

  return res.json({ data: result, total, page: pageN, limit: limitN, totalPages: Math.ceil(total / limitN) });
});

// ─── GET /api/servicos/:id ─────────────────────────────────────────────────────
router.get('/:id', optionalAuth, (req: AuthRequest, res: Response) => {
  const servico = db.select().from(servicos).where(eq(servicos.id, req.params.id)).get();
  if (!servico) return res.status(404).json({ error: 'Serviço não encontrado' });

  const prestador = db.select().from(prestadores).where(eq(prestadores.id, servico.prestadorId)).get();
  const prestadorUser = prestador ? db.select({ nome: usuarios.nome, avatar: usuarios.avatar, email: usuarios.email, telefone: usuarios.telefone }).from(usuarios).where(eq(usuarios.id, prestador.usuarioId)).get() : null;
  const categoria = db.select().from(categorias).where(eq(categorias.id, servico.categoriaId)).get();
  const avalis = db.select().from(avaliacoes).where(eq(avaliacoes.servicoId, servico.id)).all();
  const isFav = req.user
    ? db.select().from(favoritos).where(and(eq(favoritos.usuarioId, req.user.id), eq(favoritos.servicoId, servico.id))).get() !== undefined
    : false;

  return res.json({
    data: {
      ...enrichServico(servico),
      isFavorito: isFav,
      prestador: prestador ? { ...prestador, especialidades: parseJSON(prestador.especialidades), ...prestadorUser } : null,
      categoria,
      avaliacoes: avalis,
    }
  });
});

// ─── POST /api/servicos — prestador cria serviço ───────────────────────────────
const servicoSchema = z.object({
  categoriaId:     z.string(),
  nome:            z.string().min(3).max(100),
  descricao:       z.string().min(10).max(2000),
  preco:           z.number().min(0),
  tipoPrecificacao: z.enum(['hora', 'diaria', 'fixo', 'orcamento']),
  imagens:         z.array(z.string().url()).default([]),
  tags:            z.array(z.string()).default([]),
  duracao:         z.string().optional(),
  cidadeId:        z.string().optional(),
  ufId:            z.string().optional(),
  destaque:        z.boolean().default(false),
});

router.post('/', authenticate, requireRole('prestador', 'superadmin'), validate(servicoSchema), (req: AuthRequest, res: Response) => {
  const prestador = db.select().from(prestadores).where(eq(prestadores.usuarioId, req.user!.id)).get();
  if (!prestador) return res.status(403).json({ error: 'Perfil de prestador não encontrado' });

  const id = createId();
  const { imagens, tags, ...rest } = req.body;
  db.insert(servicos).values({
    id,
    prestadorId: prestador.id,
    ...rest,
    imagens: JSON.stringify(imagens),
    tags: JSON.stringify(tags),
  }).run();
  const novo = db.select().from(servicos).where(eq(servicos.id, id)).get()!;
  return res.status(201).json({ data: enrichServico(novo) });
});

// ─── PUT /api/servicos/:id ─────────────────────────────────────────────────────
router.put('/:id', authenticate, requireRole('prestador', 'superadmin'), validate(servicoSchema.partial()), (req: AuthRequest, res: Response) => {
  const servico = db.select().from(servicos).where(eq(servicos.id, req.params.id)).get();
  if (!servico) return res.status(404).json({ error: 'Serviço não encontrado' });

  // Verificar dono
  if (req.user!.role !== 'superadmin') {
    const prestador = db.select().from(prestadores).where(eq(prestadores.usuarioId, req.user!.id)).get();
    if (!prestador || servico.prestadorId !== prestador.id) {
      return res.status(403).json({ error: 'Sem permissão para editar este serviço' });
    }
  }

  const { imagens, tags, ...rest } = req.body;
  const updates: any = { ...rest, updatedAt: new Date().toISOString() };
  if (imagens) updates.imagens = JSON.stringify(imagens);
  if (tags) updates.tags = JSON.stringify(tags);

  db.update(servicos).set(updates).where(eq(servicos.id, req.params.id)).run();
  return res.json({ data: enrichServico(db.select().from(servicos).where(eq(servicos.id, req.params.id)).get()!) });
});

// ─── DELETE /api/servicos/:id ─────────────────────────────────────────────────
router.delete('/:id', authenticate, requireRole('prestador', 'superadmin'), (req: AuthRequest, res: Response) => {
  const servico = db.select().from(servicos).where(eq(servicos.id, req.params.id)).get();
  if (!servico) return res.status(404).json({ error: 'Serviço não encontrado' });

  if (req.user!.role !== 'superadmin') {
    const prestador = db.select().from(prestadores).where(eq(prestadores.usuarioId, req.user!.id)).get();
    if (!prestador || servico.prestadorId !== prestador.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }
  }
  db.delete(servicos).where(eq(servicos.id, req.params.id)).run();
  return res.json({ message: 'Serviço removido' });
});

// ─── POST /api/servicos/:id/favorito ──────────────────────────────────────────
router.post('/:id/favorito', authenticate, (req: AuthRequest, res: Response) => {
  const servico = db.select().from(servicos).where(eq(servicos.id, req.params.id)).get();
  if (!servico) return res.status(404).json({ error: 'Serviço não encontrado' });

  const existing = db.select().from(favoritos).where(
    and(eq(favoritos.usuarioId, req.user!.id), eq(favoritos.servicoId, req.params.id))
  ).get();

  if (existing) {
    db.delete(favoritos).where(eq(favoritos.id, existing.id)).run();
    return res.json({ message: 'Removido dos favoritos', favorito: false });
  } else {
    db.insert(favoritos).values({ id: createId(), usuarioId: req.user!.id, servicoId: req.params.id }).run();
    return res.json({ message: 'Adicionado aos favoritos', favorito: true });
  }
});

// ─── GET /api/servicos/favoritos/meus ─────────────────────────────────────────
router.get('/favoritos/meus', authenticate, (req: AuthRequest, res: Response) => {
  const favs = db.select().from(favoritos).where(eq(favoritos.usuarioId, req.user!.id)).all();
  const servicosFavs = favs.map(f => {
    const s = db.select().from(servicos).where(eq(servicos.id, f.servicoId)).get();
    return s ? { ...enrichServico(s), isFavorito: true } : null;
  }).filter(Boolean);
  return res.json({ data: servicosFavs });
});

export default router;
