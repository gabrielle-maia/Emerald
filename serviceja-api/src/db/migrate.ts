// src/db/migrate.ts — Cria todas as tabelas
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
dotenv.config();

const dbPath = process.env.DATABASE_URL || './serviceja.db';
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

const SQL = `
CREATE TABLE IF NOT EXISTS ufs (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  sigla TEXT NOT NULL UNIQUE,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS cidades (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  uf_id TEXT NOT NULL REFERENCES ufs(id) ON DELETE CASCADE,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  telefone TEXT,
  avatar TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'consumidor' CHECK(role IN ('consumidor','prestador','superadmin')),
  cidade_id TEXT REFERENCES cidades(id),
  uf_id TEXT REFERENCES ufs(id),
  ativo INTEGER NOT NULL DEFAULT 1,
  refresh_token TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS enderecos (
  id TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Casa',
  logradouro TEXT NOT NULL,
  numero TEXT NOT NULL,
  complemento TEXT,
  bairro TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  cep TEXT NOT NULL,
  is_padrao INTEGER NOT NULL DEFAULT 0,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS categorias (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  icone TEXT NOT NULL,
  cor TEXT NOT NULL,
  descricao TEXT,
  ativo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS prestadores (
  id TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  bio TEXT,
  especialidades TEXT NOT NULL DEFAULT '[]',
  cidade_id TEXT REFERENCES cidades(id),
  uf_id TEXT REFERENCES ufs(id),
  verificado INTEGER NOT NULL DEFAULT 0,
  servicos_concluidos INTEGER NOT NULL DEFAULT 0,
  tempo_resposta TEXT DEFAULT '< 1h',
  faixa_preco TEXT,
  media_avaliacoes REAL NOT NULL DEFAULT 0,
  total_avaliacoes INTEGER NOT NULL DEFAULT 0,
  ativo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS servicos (
  id TEXT PRIMARY KEY,
  prestador_id TEXT NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
  categoria_id TEXT NOT NULL REFERENCES categorias(id),
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  preco REAL NOT NULL DEFAULT 0,
  tipo_precificacao TEXT NOT NULL DEFAULT 'fixo' CHECK(tipo_precificacao IN ('hora','diaria','fixo','orcamento')),
  imagens TEXT NOT NULL DEFAULT '[]',
  tags TEXT NOT NULL DEFAULT '[]',
  duracao TEXT,
  cidade_id TEXT REFERENCES cidades(id),
  uf_id TEXT REFERENCES ufs(id),
  destaque INTEGER NOT NULL DEFAULT 0,
  disponivel INTEGER NOT NULL DEFAULT 1,
  media_avaliacoes REAL NOT NULL DEFAULT 0,
  total_avaliacoes INTEGER NOT NULL DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS agenda (
  id TEXT PRIMARY KEY,
  prestador_id TEXT NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  horario TEXT NOT NULL,
  disponivel INTEGER NOT NULL DEFAULT 1,
  agendamento_id TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS agendamentos (
  id TEXT PRIMARY KEY,
  servico_id TEXT NOT NULL REFERENCES servicos(id),
  prestador_id TEXT NOT NULL REFERENCES prestadores(id),
  consumidor_id TEXT NOT NULL REFERENCES usuarios(id),
  status TEXT NOT NULL DEFAULT 'aguardando_confirmacao'
    CHECK(status IN ('aguardando_confirmacao','confirmado','em_andamento','concluido','cancelado')),
  data_agendada TEXT NOT NULL,
  horario_agendado TEXT NOT NULL,
  endereco_id TEXT REFERENCES enderecos(id),
  observacoes TEXT,
  preco REAL NOT NULL,
  metodo_pagamento TEXT CHECK(metodo_pagamento IN ('pix','credit_card','debit_card','dinheiro')),
  status_pagamento TEXT NOT NULL DEFAULT 'pending' CHECK(status_pagamento IN ('pending','paid','refunded')),
  motivo_cancelamento TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS avaliacoes (
  id TEXT PRIMARY KEY,
  agendamento_id TEXT NOT NULL REFERENCES agendamentos(id),
  servico_id TEXT NOT NULL REFERENCES servicos(id),
  prestador_id TEXT NOT NULL REFERENCES prestadores(id),
  avaliador_id TEXT NOT NULL REFERENCES usuarios(id),
  nota INTEGER NOT NULL CHECK(nota BETWEEN 1 AND 5),
  comentario TEXT,
  uteis INTEGER NOT NULL DEFAULT 0,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS favoritos (
  id TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  servico_id TEXT NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  created_at TEXT,
  UNIQUE(usuario_id, servico_id)
);

CREATE TABLE IF NOT EXISTS notificacoes (
  id TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('booking','payment','news','system')),
  lida INTEGER NOT NULL DEFAULT 0,
  dados TEXT,
  created_at TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_servicos_categoria ON servicos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_servicos_prestador ON servicos(prestador_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_consumidor ON agendamentos(consumidor_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_prestador ON agendamentos(prestador_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_servico ON avaliacoes(servico_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id);
`;

sqlite.exec(SQL);
console.log('✅ Tabelas criadas com sucesso!');
sqlite.close();
