// src/db/schema.ts — Drizzle ORM Schema
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { createId } from '../utils/id';

// ─── UF ───────────────────────────────────────────────────────────────────────
export const ufs = sqliteTable('ufs', {
  id:        text('id').primaryKey().$defaultFn(() => createId()),
  nome:      text('nome').notNull(),
  sigla:     text('sigla').notNull().unique(),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

// ─── CIDADE ───────────────────────────────────────────────────────────────────
export const cidades = sqliteTable('cidades', {
  id:        text('id').primaryKey().$defaultFn(() => createId()),
  nome:      text('nome').notNull(),
  ufId:      text('uf_id').notNull().references(() => ufs.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

// ─── USUARIO ──────────────────────────────────────────────────────────────────
export const usuarios = sqliteTable('usuarios', {
  id:           text('id').primaryKey().$defaultFn(() => createId()),
  nome:         text('nome').notNull(),
  email:        text('email').notNull().unique(),
  senhaHash:    text('senha_hash').notNull(),
  telefone:     text('telefone'),
  avatar:       text('avatar'),
  bio:          text('bio'),
  role:         text('role', { enum: ['consumidor', 'prestador', 'superadmin'] }).notNull().default('consumidor'),
  cidadeId:     text('cidade_id').references(() => cidades.id),
  ufId:         text('uf_id').references(() => ufs.id),
  ativo:        integer('ativo', { mode: 'boolean' }).notNull().default(true),
  refreshToken: text('refresh_token'),
  createdAt:    text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt:    text('updated_at').$defaultFn(() => new Date().toISOString()),
});

// ─── ENDEREÇO ─────────────────────────────────────────────────────────────────
export const enderecos = sqliteTable('enderecos', {
  id:           text('id').primaryKey().$defaultFn(() => createId()),
  usuarioId:    text('usuario_id').notNull().references(() => usuarios.id, { onDelete: 'cascade' }),
  label:        text('label').notNull().default('Casa'),
  logradouro:   text('logradouro').notNull(),
  numero:       text('numero').notNull(),
  complemento:  text('complemento'),
  bairro:       text('bairro').notNull(),
  cidade:       text('cidade').notNull(),
  estado:       text('estado').notNull(),
  cep:          text('cep').notNull(),
  isPadrao:     integer('is_padrao', { mode: 'boolean' }).notNull().default(false),
  createdAt:    text('created_at').$defaultFn(() => new Date().toISOString()),
});

// ─── CATEGORIA ────────────────────────────────────────────────────────────────
export const categorias = sqliteTable('categorias', {
  id:          text('id').primaryKey().$defaultFn(() => createId()),
  nome:        text('nome').notNull(),
  icone:       text('icone').notNull(),
  cor:         text('cor').notNull(),
  descricao:   text('descricao'),
  ativo:       integer('ativo', { mode: 'boolean' }).notNull().default(true),
  createdAt:   text('created_at').$defaultFn(() => new Date().toISOString()),
});

// ─── PRESTADOR ────────────────────────────────────────────────────────────────
export const prestadores = sqliteTable('prestadores', {
  id:              text('id').primaryKey().$defaultFn(() => createId()),
  usuarioId:       text('usuario_id').notNull().unique().references(() => usuarios.id, { onDelete: 'cascade' }),
  bio:             text('bio'),
  especialidades:  text('especialidades').notNull().default('[]'), // JSON array
  cidadeId:        text('cidade_id').references(() => cidades.id),
  ufId:            text('uf_id').references(() => ufs.id),
  verificado:      integer('verificado', { mode: 'boolean' }).notNull().default(false),
  servicosConcluidos: integer('servicos_concluidos').notNull().default(0),
  tempoResposta:   text('tempo_resposta').default('< 1h'),
  faixaPreco:      text('faixa_preco'),
  mediaAvaliacoes: real('media_avaliacoes').notNull().default(0),
  totalAvaliacoes: integer('total_avaliacoes').notNull().default(0),
  ativo:           integer('ativo', { mode: 'boolean' }).notNull().default(true),
  createdAt:       text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt:       text('updated_at').$defaultFn(() => new Date().toISOString()),
});

// ─── SERVIÇO ──────────────────────────────────────────────────────────────────
export const servicos = sqliteTable('servicos', {
  id:            text('id').primaryKey().$defaultFn(() => createId()),
  prestadorId:   text('prestador_id').notNull().references(() => prestadores.id, { onDelete: 'cascade' }),
  categoriaId:   text('categoria_id').notNull().references(() => categorias.id),
  nome:          text('nome').notNull(),
  descricao:     text('descricao').notNull(),
  preco:         real('preco').notNull().default(0),
  tipoPrecificacao: text('tipo_precificacao', { enum: ['hora', 'diaria', 'fixo', 'orcamento'] }).notNull().default('fixo'),
  imagens:       text('imagens').notNull().default('[]'), // JSON array
  tags:          text('tags').notNull().default('[]'),   // JSON array
  duracao:       text('duracao'),
  cidadeId:      text('cidade_id').references(() => cidades.id),
  ufId:          text('uf_id').references(() => ufs.id),
  destaque:      integer('destaque', { mode: 'boolean' }).notNull().default(false),
  disponivel:    integer('disponivel', { mode: 'boolean' }).notNull().default(true),
  mediaAvaliacoes: real('media_avaliacoes').notNull().default(0),
  totalAvaliacoes: integer('total_avaliacoes').notNull().default(0),
  createdAt:     text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt:     text('updated_at').$defaultFn(() => new Date().toISOString()),
});

// ─── AGENDA ───────────────────────────────────────────────────────────────────
export const agenda = sqliteTable('agenda', {
  id:          text('id').primaryKey().$defaultFn(() => createId()),
  prestadorId: text('prestador_id').notNull().references(() => prestadores.id, { onDelete: 'cascade' }),
  data:        text('data').notNull(),       // YYYY-MM-DD
  horario:     text('horario').notNull(),    // HH:MM
  disponivel:  integer('disponivel', { mode: 'boolean' }).notNull().default(true),
  agendamentoId: text('agendamento_id'),
  createdAt:   text('created_at').$defaultFn(() => new Date().toISOString()),
});

// ─── AGENDAMENTO ──────────────────────────────────────────────────────────────
export const agendamentos = sqliteTable('agendamentos', {
  id:               text('id').primaryKey().$defaultFn(() => createId()),
  servicoId:        text('servico_id').notNull().references(() => servicos.id),
  prestadorId:      text('prestador_id').notNull().references(() => prestadores.id),
  consumidorId:     text('consumidor_id').notNull().references(() => usuarios.id),
  status:           text('status', {
    enum: ['aguardando_confirmacao', 'confirmado', 'em_andamento', 'concluido', 'cancelado']
  }).notNull().default('aguardando_confirmacao'),
  dataAgendada:     text('data_agendada').notNull(),
  horarioAgendado:  text('horario_agendado').notNull(),
  enderecoId:       text('endereco_id').references(() => enderecos.id),
  observacoes:      text('observacoes'),
  preco:            real('preco').notNull(),
  metodoPagamento:  text('metodo_pagamento', { enum: ['pix', 'credit_card', 'debit_card', 'dinheiro'] }),
  statusPagamento:  text('status_pagamento', { enum: ['pending', 'paid', 'refunded'] }).notNull().default('pending'),
  motivoCancelamento: text('motivo_cancelamento'),
  createdAt:        text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt:        text('updated_at').$defaultFn(() => new Date().toISOString()),
});

// ─── AVALIAÇÃO ────────────────────────────────────────────────────────────────
export const avaliacoes = sqliteTable('avaliacoes', {
  id:             text('id').primaryKey().$defaultFn(() => createId()),
  agendamentoId:  text('agendamento_id').notNull().references(() => agendamentos.id),
  servicoId:      text('servico_id').notNull().references(() => servicos.id),
  prestadorId:    text('prestador_id').notNull().references(() => prestadores.id),
  avaliadorId:    text('avaliador_id').notNull().references(() => usuarios.id),
  nota:           integer('nota').notNull(),   // 1-5
  comentario:     text('comentario'),
  uteis:          integer('uteis').notNull().default(0),
  createdAt:      text('created_at').$defaultFn(() => new Date().toISOString()),
});

// ─── FAVORITO ─────────────────────────────────────────────────────────────────
export const favoritos = sqliteTable('favoritos', {
  id:          text('id').primaryKey().$defaultFn(() => createId()),
  usuarioId:   text('usuario_id').notNull().references(() => usuarios.id, { onDelete: 'cascade' }),
  servicoId:   text('servico_id').notNull().references(() => servicos.id, { onDelete: 'cascade' }),
  createdAt:   text('created_at').$defaultFn(() => new Date().toISOString()),
});

// ─── NOTIFICAÇÃO ──────────────────────────────────────────────────────────────
export const notificacoes = sqliteTable('notificacoes', {
  id:          text('id').primaryKey().$defaultFn(() => createId()),
  usuarioId:   text('usuario_id').notNull().references(() => usuarios.id, { onDelete: 'cascade' }),
  titulo:      text('titulo').notNull(),
  mensagem:    text('mensagem').notNull(),
  tipo:        text('tipo', { enum: ['booking', 'payment', 'news', 'system'] }).notNull(),
  lida:        integer('lida', { mode: 'boolean' }).notNull().default(false),
  dados:       text('dados'),  // JSON extra data
  createdAt:   text('created_at').$defaultFn(() => new Date().toISOString()),
});

// ─── RELATIONS ────────────────────────────────────────────────────────────────
export const ufsRelations = relations(ufs, ({ many }) => ({
  cidades: many(cidades),
  usuarios: many(usuarios),
  prestadores: many(prestadores),
  servicos: many(servicos),
}));

export const cidadesRelations = relations(cidades, ({ one, many }) => ({
  uf: one(ufs, { fields: [cidades.ufId], references: [ufs.id] }),
  usuarios: many(usuarios),
  prestadores: many(prestadores),
  servicos: many(servicos),
}));

export const usuariosRelations = relations(usuarios, ({ one, many }) => ({
  cidade: one(cidades, { fields: [usuarios.cidadeId], references: [cidades.id] }),
  uf: one(ufs, { fields: [usuarios.ufId], references: [ufs.id] }),
  enderecos: many(enderecos),
  prestador: one(prestadores),
  agendamentos: many(agendamentos),
  avaliacoes: many(avaliacoes),
  favoritos: many(favoritos),
  notificacoes: many(notificacoes),
}));

export const prestadoresRelations = relations(prestadores, ({ one, many }) => ({
  usuario: one(usuarios, { fields: [prestadores.usuarioId], references: [usuarios.id] }),
  cidade: one(cidades, { fields: [prestadores.cidadeId], references: [cidades.id] }),
  uf: one(ufs, { fields: [prestadores.ufId], references: [ufs.id] }),
  servicos: many(servicos),
  agendamentos: many(agendamentos),
  agenda: many(agenda),
  avaliacoes: many(avaliacoes),
}));

export const servicosRelations = relations(servicos, ({ one, many }) => ({
  prestador: one(prestadores, { fields: [servicos.prestadorId], references: [prestadores.id] }),
  categoria: one(categorias, { fields: [servicos.categoriaId], references: [categorias.id] }),
  cidade: one(cidades, { fields: [servicos.cidadeId], references: [cidades.id] }),
  uf: one(ufs, { fields: [servicos.ufId], references: [ufs.id] }),
  agendamentos: many(agendamentos),
  avaliacoes: many(avaliacoes),
  favoritos: many(favoritos),
}));

export const agendamentosRelations = relations(agendamentos, ({ one }) => ({
  servico: one(servicos, { fields: [agendamentos.servicoId], references: [servicos.id] }),
  prestador: one(prestadores, { fields: [agendamentos.prestadorId], references: [prestadores.id] }),
  consumidor: one(usuarios, { fields: [agendamentos.consumidorId], references: [usuarios.id] }),
  endereco: one(enderecos, { fields: [agendamentos.enderecoId], references: [enderecos.id] }),
  avaliacao: one(avaliacoes),
}));

export const avaliacoesRelations = relations(avaliacoes, ({ one }) => ({
  agendamento: one(agendamentos, { fields: [avaliacoes.agendamentoId], references: [agendamentos.id] }),
  servico: one(servicos, { fields: [avaliacoes.servicoId], references: [servicos.id] }),
  prestador: one(prestadores, { fields: [avaliacoes.prestadorId], references: [prestadores.id] }),
  avaliador: one(usuarios, { fields: [avaliacoes.avaliadorId], references: [usuarios.id] }),
}));
