// src/routes/agendamentos.ts — /api/agendamentos (CRUD completo)
import { Router, Response } from 'express';
import { z } from 'zod';
import { eq, and, or } from 'drizzle-orm';
import db from '../db/client';
import { agendamentos, servicos, prestadores, usuarios, enderecos, notificacoes, avaliacoes } from '../db/schema';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createId } from '../utils/id';

const router = Router();

function addNotificacao(usuarioId: string, titulo: string, mensagem: string, tipo: 'booking' | 'payment' | 'news' | 'system') {
  try {
    db.insert(notificacoes).values({ id: createId(), usuarioId, titulo, mensagem, tipo }).run();
  } catch {}
}

// ─── GET /api/agendamentos — listar (consumidor vê os seus; prestador vê os dele; admin vê todos) ──
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query;
  const { id, role } = req.user!;

  let all = db.select().from(agendamentos).all();

  if (role === 'consumidor') all = all.filter(a => a.consumidorId === id);
  else if (role === 'prestador') {
    const p = db.select().from(prestadores).where(eq(prestadores.usuarioId, id)).get();
    if (p) all = all.filter(a => a.prestadorId === p.id);
    else all = [];
  }
  if (status) all = all.filter(a => a.status === String(status));

  all.sort((a, b) => b.createdAt!.localeCompare(a.createdAt!));

  const pageN = Math.max(1, Number(page));
  const limitN = Math.min(50, Math.max(1, Number(limit)));
  const total = all.length;
  const paginated = all.slice((pageN - 1) * limitN, pageN * limitN);

  const enriched = paginated.map(a => {
    const servico = db.select().from(servicos).where(eq(servicos.id, a.servicoId)).get();
    const consumidor = db.select({ id: usuarios.id, nome: usuarios.nome, email: usuarios.email, telefone: usuarios.telefone, avatar: usuarios.avatar }).from(usuarios).where(eq(usuarios.id, a.consumidorId)).get();
    const prestadorRec = db.select().from(prestadores).where(eq(prestadores.id, a.prestadorId)).get();
    const prestadorUser = prestadorRec ? db.select({ nome: usuarios.nome, avatar: usuarios.avatar, telefone: usuarios.telefone }).from(usuarios).where(eq(usuarios.id, prestadorRec.usuarioId)).get() : null;
    return { ...a, servico, consumidor, prestador: prestadorRec ? { ...prestadorRec, ...prestadorUser } : null };
  });

  return res.json({ data: enriched, total, page: pageN, limit: limitN, totalPages: Math.ceil(total / limitN) });
});

// ─── GET /api/agendamentos/:id ─────────────────────────────────────────────────
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const ag = db.select().from(agendamentos).where(eq(agendamentos.id, req.params.id)).get();
  if (!ag) return res.status(404).json({ error: 'Agendamento não encontrado' });

  const { id, role } = req.user!;
  const p = role === 'prestador' ? db.select().from(prestadores).where(eq(prestadores.usuarioId, id)).get() : null;
  if (role === 'consumidor' && ag.consumidorId !== id) return res.status(403).json({ error: 'Acesso negado' });
  if (role === 'prestador' && (!p || ag.prestadorId !== p.id)) return res.status(403).json({ error: 'Acesso negado' });

  const servico = db.select().from(servicos).where(eq(servicos.id, ag.servicoId)).get();
  const consumidor = db.select({ id: usuarios.id, nome: usuarios.nome, email: usuarios.email, telefone: usuarios.telefone, avatar: usuarios.avatar }).from(usuarios).where(eq(usuarios.id, ag.consumidorId)).get();
  const prestadorRec = db.select().from(prestadores).where(eq(prestadores.id, ag.prestadorId)).get();
  const prestadorUser = prestadorRec ? db.select({ nome: usuarios.nome, avatar: usuarios.avatar, telefone: usuarios.telefone }).from(usuarios).where(eq(usuarios.id, prestadorRec.usuarioId)).get() : null;
  const endereco = ag.enderecoId ? db.select().from(enderecos).where(eq(enderecos.id, ag.enderecoId)).get() : null;
  const avaliacao = db.select().from(avaliacoes).where(eq(avaliacoes.agendamentoId, ag.id)).get();

  return res.json({ data: { ...ag, servico, consumidor, prestador: prestadorRec ? { ...prestadorRec, ...prestadorUser } : null, endereco, avaliacao } });
});

// ─── POST /api/agendamentos — consumidor cria agendamento ─────────────────────
const criarSchema = z.object({
  servicoId:       z.string(),
  dataAgendada:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve ser YYYY-MM-DD'),
  horarioAgendado: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve ser HH:MM'),
  enderecoId:      z.string().optional(),
  observacoes:     z.string().max(500).optional(),
  metodoPagamento: z.enum(['pix', 'credit_card', 'debit_card', 'dinheiro']),
});

router.post('/', authenticate, requireRole('consumidor', 'superadmin'), validate(criarSchema), (req: AuthRequest, res: Response) => {
  const { servicoId, dataAgendada, horarioAgendado, enderecoId, observacoes, metodoPagamento } = req.body;

  const servico = db.select().from(servicos).where(and(eq(servicos.id, servicoId), eq(servicos.disponivel, true))).get();
  if (!servico) return res.status(404).json({ error: 'Serviço não encontrado ou indisponível' });

  const id = createId();
  db.insert(agendamentos).values({
    id,
    servicoId,
    prestadorId: servico.prestadorId,
    consumidorId: req.user!.id,
    status: 'aguardando_confirmacao',
    dataAgendada,
    horarioAgendado,
    enderecoId: enderecoId || null,
    observacoes: observacoes || null,
    preco: servico.preco,
    metodoPagamento,
    statusPagamento: 'paid',
  }).run();

  // Notificar prestador
  const prestador = db.select().from(prestadores).where(eq(prestadores.id, servico.prestadorId)).get();
  if (prestador) {
    addNotificacao(prestador.usuarioId, 'Novo agendamento!', `Você recebeu um novo pedido para "${servico.nome}".`, 'booking');
  }
  // Notificar consumidor
  addNotificacao(req.user!.id, 'Pedido enviado!', `Seu agendamento para "${servico.nome}" foi enviado. Aguarde confirmação.`, 'booking');

  const novo = db.select().from(agendamentos).where(eq(agendamentos.id, id)).get();
  return res.status(201).json({ data: novo, message: 'Agendamento criado. Aguardando confirmação do profissional.' });
});

// ─── PATCH /api/agendamentos/:id/status — atualizar status ────────────────────
const statusSchema = z.object({
  status: z.enum(['confirmado', 'em_andamento', 'concluido', 'cancelado']),
  motivoCancelamento: z.string().optional(),
});

router.patch('/:id/status', authenticate, validate(statusSchema), (req: AuthRequest, res: Response) => {
  const ag = db.select().from(agendamentos).where(eq(agendamentos.id, req.params.id)).get();
  if (!ag) return res.status(404).json({ error: 'Agendamento não encontrado' });

  const { id, role } = req.user!;
  const { status, motivoCancelamento } = req.body;

  // Regras de transição por papel
  const p = role === 'prestador' ? db.select().from(prestadores).where(eq(prestadores.usuarioId, id)).get() : null;
  if (role === 'consumidor') {
    if (ag.consumidorId !== id) return res.status(403).json({ error: 'Acesso negado' });
    if (!['cancelado'].includes(status)) return res.status(403).json({ error: 'Consumidor só pode cancelar' });
  }
  if (role === 'prestador') {
    if (!p || ag.prestadorId !== p.id) return res.status(403).json({ error: 'Acesso negado' });
  }

  const updates: any = { status, updatedAt: new Date().toISOString() };
  if (motivoCancelamento) updates.motivoCancelamento = motivoCancelamento;

  db.update(agendamentos).set(updates).where(eq(agendamentos.id, req.params.id)).run();

  // Notificações de status
  const statusLabels: Record<string, string> = {
    confirmado: 'confirmado pelo profissional',
    em_andamento: 'em andamento',
    concluido: 'concluído',
    cancelado: 'cancelado',
  };
  const servico = db.select().from(servicos).where(eq(servicos.id, ag.servicoId)).get();
  addNotificacao(ag.consumidorId, `Agendamento ${statusLabels[status]}`, `Seu agendamento "${servico?.nome}" foi ${statusLabels[status]}.`, 'booking');

  return res.json({ data: db.select().from(agendamentos).where(eq(agendamentos.id, req.params.id)).get(), message: `Status atualizado para ${status}` });
});

// ─── POST /api/agendamentos/:id/avaliar ───────────────────────────────────────
const avaliarSchema = z.object({
  nota:       z.number().int().min(1).max(5),
  comentario: z.string().max(1000).optional(),
});

router.post('/:id/avaliar', authenticate, requireRole('consumidor'), validate(avaliarSchema), (req: AuthRequest, res: Response) => {
  const ag = db.select().from(agendamentos).where(eq(agendamentos.id, req.params.id)).get();
  if (!ag) return res.status(404).json({ error: 'Agendamento não encontrado' });
  if (ag.consumidorId !== req.user!.id) return res.status(403).json({ error: 'Acesso negado' });
  if (ag.status !== 'concluido') return res.status(400).json({ error: 'Só é possível avaliar agendamentos concluídos' });

  const existente = db.select().from(avaliacoes).where(eq(avaliacoes.agendamentoId, ag.id)).get();
  if (existente) return res.status(409).json({ error: 'Este agendamento já foi avaliado' });

  const { nota, comentario } = req.body;
  const aid = createId();
  db.insert(avaliacoes).values({
    id: aid,
    agendamentoId: ag.id,
    servicoId: ag.servicoId,
    prestadorId: ag.prestadorId,
    avaliadorId: req.user!.id,
    nota,
    comentario: comentario || null,
  }).run();

  // Recalcular média do serviço e do prestador
  const todasAvalis = db.select().from(avaliacoes).where(eq(avaliacoes.servicoId, ag.servicoId)).all();
  const media = todasAvalis.reduce((sum, a) => sum + a.nota, 0) / todasAvalis.length;
  db.update(servicos).set({ mediaAvaliacoes: Math.round(media * 10) / 10, totalAvaliacoes: todasAvalis.length }).where(eq(servicos.id, ag.servicoId)).run();

  const todasPrest = db.select().from(avaliacoes).where(eq(avaliacoes.prestadorId, ag.prestadorId)).all();
  const mediaPrest = todasPrest.reduce((sum, a) => sum + a.nota, 0) / todasPrest.length;
  db.update(prestadores).set({ mediaAvaliacoes: Math.round(mediaPrest * 10) / 10, totalAvaliacoes: todasPrest.length }).where(eq(prestadores.id, ag.prestadorId)).run();

  return res.status(201).json({ data: db.select().from(avaliacoes).where(eq(avaliacoes.id, aid)).get(), message: 'Avaliação registrada!' });
});

export default router;
