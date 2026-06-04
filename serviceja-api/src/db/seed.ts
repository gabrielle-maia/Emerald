// src/db/seed.ts — Popula o banco com dados iniciais
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const db = new Database(process.env.DATABASE_URL || './serviceja.db');
db.pragma('foreign_keys = ON');

function id() { return randomBytes(12).toString('hex'); }
const now = () => new Date().toISOString();

console.log('🌱 Iniciando seed...');

// UFs
const ufs = [
  { id: id(), nome: 'Distrito Federal', sigla: 'DF' },
  { id: id(), nome: 'São Paulo',        sigla: 'SP' },
  { id: id(), nome: 'Rio de Janeiro',   sigla: 'RJ' },
  { id: id(), nome: 'Minas Gerais',     sigla: 'MG' },
  { id: id(), nome: 'Bahia',            sigla: 'BA' },
];
const insertUF = db.prepare('INSERT OR IGNORE INTO ufs(id,nome,sigla,created_at) VALUES(?,?,?,?)');
ufs.forEach(u => insertUF.run(u.id, u.nome, u.sigla, now()));
console.log(`✅ ${ufs.length} UFs inseridas`);

// Cidades
const ufDF = ufs[0]; const ufSP = ufs[1]; const ufRJ = ufs[2];
const cidades = [
  { id: id(), nome: 'Brasília',        uf_id: ufDF.id },
  { id: id(), nome: 'Taguatinga',      uf_id: ufDF.id },
  { id: id(), nome: 'Ceilândia',       uf_id: ufDF.id },
  { id: id(), nome: 'Gama',            uf_id: ufDF.id },
  { id: id(), nome: 'São Paulo',       uf_id: ufSP.id },
  { id: id(), nome: 'Campinas',        uf_id: ufSP.id },
  { id: id(), nome: 'Rio de Janeiro',  uf_id: ufRJ.id },
];
const insertCidade = db.prepare('INSERT OR IGNORE INTO cidades(id,nome,uf_id,created_at) VALUES(?,?,?,?)');
cidades.forEach(c => insertCidade.run(c.id, c.nome, c.uf_id, now()));
console.log(`✅ ${cidades.length} Cidades inseridas`);

const cidBSB = cidades[0]; const cidTAG = cidades[1]; const cidCEI = cidades[2];

// Categorias
const categorias = [
  { id: id(), nome: 'Elétrica',    icone: '⚡', cor: '#f39c12', descricao: 'Instalações e reparos elétricos' },
  { id: id(), nome: 'Hidráulica',  icone: '🔧', cor: '#3498db', descricao: 'Encanamento e instalações hidráulicas' },
  { id: id(), nome: 'Limpeza',     icone: '🧹', cor: '#2ecc71', descricao: 'Diaristas e limpeza geral' },
  { id: id(), nome: 'Pintura',     icone: '🎨', cor: '#9b59b6', descricao: 'Pintura residencial e comercial' },
  { id: id(), nome: 'Marcenaria',  icone: '🪚', cor: '#e67e22', descricao: 'Móveis e reparos em madeira' },
  { id: id(), nome: 'Jardinagem',  icone: '🌱', cor: '#27ae60', descricao: 'Manutenção de jardins' },
  { id: id(), nome: 'Reformas',    icone: '🏗️', cor: '#e74c3c', descricao: 'Reformas e construção' },
  { id: id(), nome: 'TI & Redes',  icone: '💻', cor: '#1abc9c', descricao: 'Suporte técnico e redes' },
];
const insertCat = db.prepare('INSERT OR IGNORE INTO categorias(id,nome,icone,cor,descricao,ativo,created_at) VALUES(?,?,?,?,?,1,?)');
categorias.forEach(c => insertCat.run(c.id, c.nome, c.icone, c.cor, c.descricao, now()));
console.log(`✅ ${categorias.length} Categorias inseridas`);

const catElet = categorias[0]; const catHid = categorias[1]; const catLim = categorias[2];
const catPin = categorias[3]; const catMar = categorias[4]; const catJar = categorias[5];

// Superadmin
const adminId = id();
const adminHash = bcrypt.hashSync('admin123', 10);
db.prepare('INSERT OR IGNORE INTO usuarios(id,nome,email,senha_hash,role,ativo,created_at,updated_at) VALUES(?,?,?,?,?,1,?,?)')
  .run(adminId, 'Admin ServiçaJá', 'admin@serviceja.com', adminHash, 'superadmin', now(), now());
console.log('✅ Superadmin criado: admin@serviceja.com / admin123');

// Prestadores
const prestUsers = [
  { nome: 'Carlos Eletricista',  email: 'carlos@serviceja.com',  tel: '61999990001', cidadeId: cidBSB.id, ufId: ufDF.id },
  { nome: 'Maria Faxineira',     email: 'maria@serviceja.com',   tel: '61999990002', cidadeId: cidBSB.id, ufId: ufDF.id },
  { nome: 'Roberto Encanador',   email: 'roberto@serviceja.com', tel: '61999990003', cidadeId: cidTAG.id, ufId: ufDF.id },
  { nome: 'Ana Pintora',         email: 'ana@serviceja.com',     tel: '61999990004', cidadeId: cidBSB.id, ufId: ufDF.id },
  { nome: 'Pedro Marceneiro',    email: 'pedro@serviceja.com',   tel: '61999990005', cidadeId: cidCEI.id, ufId: ufDF.id },
  { nome: 'Lucas Jardineiro',    email: 'lucas@serviceja.com',   tel: '61999990006', cidadeId: cidBSB.id, ufId: ufDF.id },
];
const hash = bcrypt.hashSync('senha123', 10);
const insertUser = db.prepare('INSERT OR IGNORE INTO usuarios(id,nome,email,senha_hash,telefone,role,cidade_id,uf_id,ativo,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,1,?,?)');
const insertPrestador = db.prepare('INSERT OR IGNORE INTO prestadores(id,usuario_id,bio,especialidades,cidade_id,uf_id,verificado,servicos_concluidos,tempo_resposta,faixa_preco,media_avaliacoes,total_avaliacoes,ativo,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1,?,?)');

const prestInfo = [
  { bio: 'Eletricista com 15 anos de experiência, especialista em instalações residenciais e comerciais.', esp: ['Instalação elétrica','Quadro de distribuição','CFTV'], ver: 1, jobs: 342, resp: '< 1h', faixa: 'R$ 80-200/h', media: 4.9, total: 127 },
  { bio: 'Diarista profissional há 10 anos. Pontual, organizada e com ótimas referências.', esp: ['Limpeza geral','Limpeza pós-obra','Organização'], ver: 1, jobs: 489, resp: '< 2h', faixa: 'R$ 150-250/dia', media: 4.8, total: 203 },
  { bio: 'Encanador certificado com experiência em instalações de água quente e fria.', esp: ['Conserto de vazamentos','Instalação de chuveiro','Desentupimento'], ver: 1, jobs: 215, resp: '< 3h', faixa: 'R$ 100-180/h', media: 4.7, total: 89 },
  { bio: 'Pintora residencial com técnicas modernas e acabamento impecável.', esp: ['Pintura interna','Pintura externa','Textura'], ver: 0, jobs: 98, resp: '< 4h', faixa: 'R$ 15-25/m²', media: 4.6, total: 54 },
  { bio: 'Marceneiro artesanal, criação de móveis planejados e restauração.', esp: ['Móveis planejados','Restauração','Armários'], ver: 1, jobs: 156, resp: '< 1h', faixa: 'R$ 120-300/h', media: 4.9, total: 71 },
  { bio: 'Paisagista e jardineiro com foco em jardins sustentáveis.', esp: ['Paisagismo','Poda','Irrigação'], ver: 0, jobs: 74, resp: '< 2h', faixa: 'R$ 80-150/visita', media: 4.5, total: 38 },
];

const userIds: string[] = [];
const prestIds: string[] = [];
prestUsers.forEach((u, i) => {
  const uid = id(); const pid = id();
  userIds.push(uid); prestIds.push(pid);
  insertUser.run(uid, u.nome, u.email, hash, u.tel, 'prestador', u.cidadeId, u.ufId, now(), now());
  const p = prestInfo[i];
  insertPrestador.run(pid, uid, p.bio, JSON.stringify(p.esp), u.cidadeId, u.ufId, p.ver, p.jobs, p.resp, p.faixa, p.media, p.total, now(), now());
});
console.log(`✅ ${prestUsers.length} Prestadores criados`);

// Consumidor de teste
const consId = id();
const consHash = bcrypt.hashSync('senha123', 10);
db.prepare('INSERT OR IGNORE INTO usuarios(id,nome,email,senha_hash,telefone,role,cidade_id,uf_id,ativo,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,1,?,?)')
  .run(consId, 'João Consumidor', 'joao@serviceja.com', consHash, '61988880001', 'consumidor', cidBSB.id, ufDF.id, now(), now());
db.prepare('INSERT OR IGNORE INTO enderecos(id,usuario_id,label,logradouro,numero,bairro,cidade,estado,cep,is_padrao,created_at) VALUES(?,?,?,?,?,?,?,?,?,1,?)')
  .run(id(), consId, 'Casa', 'SQN 315 Bloco A', 'Apt 302', 'Asa Norte', 'Brasília', 'DF', '70770-015', now());
console.log('✅ Consumidor criado: joao@serviceja.com / senha123');

// Serviços
const servicos = [
  { prestIdx: 0, catIdx: 0, nome: 'Instalação Elétrica Residencial', desc: 'Instalação completa de tomadas, interruptores, luminárias e quadro de distribuição. Garantia de 1 ano.', preco: 150, tipo: 'hora', dur: '2-4h', dest: 1, cidadeIdx: 0 },
  { prestIdx: 0, catIdx: 0, nome: 'Quadro de Distribuição', desc: 'Instalação e manutenção de quadro de distribuição elétrica com disjuntores e aterramento.', preco: 0, tipo: 'orcamento', dur: '3-5h', dest: 0, cidadeIdx: 0 },
  { prestIdx: 1, catIdx: 2, nome: 'Diária Completa de Limpeza', desc: 'Limpeza completa da casa incluindo cozinha, banheiros, quartos e áreas comuns. Material incluso.', preco: 200, tipo: 'diaria', dur: '6-8h', dest: 1, cidadeIdx: 0 },
  { prestIdx: 1, catIdx: 2, nome: 'Limpeza Pós-Obra', desc: 'Limpeza especializada após reformas e construção. Remoção de resíduos e polimento de pisos.', preco: 350, tipo: 'fixo', dur: '1-2 dias', dest: 0, cidadeIdx: 0 },
  { prestIdx: 2, catIdx: 1, nome: 'Conserto de Vazamento', desc: 'Identificação e reparo de vazamentos em tubulações, torneiras e chuveiros. Atendimento emergencial.', preco: 120, tipo: 'hora', dur: '1-3h', dest: 0, cidadeIdx: 1 },
  { prestIdx: 2, catIdx: 1, nome: 'Desentupimento de Esgoto', desc: 'Serviço de desentupimento de pias, ralos, vasos sanitários e colunas de esgoto.', preco: 180, tipo: 'fixo', dur: '1-2h', dest: 0, cidadeIdx: 1 },
  { prestIdx: 3, catIdx: 3, nome: 'Pintura de Quarto', desc: 'Pintura completa com preparo da superfície, massa corrida e 2 demãos. Cores à sua escolha.', preco: 20, tipo: 'fixo', dur: '1-2 dias', dest: 0, cidadeIdx: 0 },
  { prestIdx: 4, catIdx: 4, nome: 'Móvel Planejado sob Medida', desc: 'Criação de móveis planejados personalizados. Armários, estantes, mesas e muito mais.', preco: 0, tipo: 'orcamento', dur: undefined, dest: 1, cidadeIdx: 2 },
  { prestIdx: 5, catIdx: 5, nome: 'Manutenção de Jardim', desc: 'Poda, capina, adubação e cuidados gerais do jardim. Visitas semanais ou mensais disponíveis.', preco: 120, tipo: 'fixo', dur: undefined, dest: 0, cidadeIdx: 0 },
];

const cidadeIds = [cidBSB.id, cidTAG.id, cidCEI.id];
const insertServico = db.prepare(`INSERT OR IGNORE INTO servicos(id,prestador_id,categoria_id,nome,descricao,preco,tipo_precificacao,imagens,tags,duracao,cidade_id,uf_id,destaque,disponivel,media_avaliacoes,total_avaliacoes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,1,0,0,?,?)`);

const servicoIds: string[] = [];
servicos.forEach(s => {
  const sid = id(); servicoIds.push(sid);
  const imagens = JSON.stringify([`https://picsum.photos/seed/${sid}/400/300`]);
  const tags = JSON.stringify([categorias[s.catIdx].nome.toLowerCase(), s.nome.split(' ')[0].toLowerCase()]);
  insertServico.run(sid, prestIds[s.prestIdx], categorias[s.catIdx].id, s.nome, s.desc, s.preco, s.tipo, imagens, tags, s.dur ?? null, cidadeIds[s.cidadeIdx], ufDF.id, s.dest, now(), now());
});
console.log(`✅ ${servicos.length} Serviços criados`);

// Agendamentos de exemplo
const agendamentos = [
  { sid: servicoIds[0], pid: prestIds[0], data: '2026-06-10', hora: '09:00', status: 'aguardando_confirmacao', preco: 300, pag: 'pix',         spag: 'paid' },
  { sid: servicoIds[2], pid: prestIds[1], data: '2026-06-08', hora: '08:00', status: 'confirmado',             preco: 200, pag: 'credit_card',  spag: 'paid' },
  { sid: servicoIds[4], pid: prestIds[2], data: '2026-05-20', hora: '14:00', status: 'concluido',              preco: 240, pag: 'pix',         spag: 'paid' },
];
const insertAg = db.prepare(`INSERT OR IGNORE INTO agendamentos(id,servico_id,prestador_id,consumidor_id,status,data_agendada,horario_agendado,preco,metodo_pagamento,status_pagamento,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`);
const agIds: string[] = [];
agendamentos.forEach(a => {
  const aid = id(); agIds.push(aid);
  insertAg.run(aid, a.sid, a.pid, consId, a.status, a.data, a.hora, a.preco, a.pag, a.spag, now(), now());
});
console.log(`✅ ${agendamentos.length} Agendamentos criados`);

// Avaliação para agendamento concluído
db.prepare(`INSERT OR IGNORE INTO avaliacoes(id,agendamento_id,servico_id,prestador_id,avaliador_id,nota,comentario,created_at) VALUES(?,?,?,?,?,?,?,?)`)
  .run(id(), agIds[2], servicoIds[4], prestIds[2], consId, 5, 'Excelente serviço! Muito pontual e profissional.', now());
console.log('✅ Avaliação de exemplo criada');

// Notificações
const notifs = [
  { titulo: 'Agendamento confirmado!', msg: 'Carlos confirmou seu agendamento para 10/06 às 09h.', tipo: 'booking' },
  { titulo: 'Pagamento aprovado',      msg: 'Pagamento de R$ 200,00 via PIX aprovado com sucesso.',  tipo: 'payment' },
  { titulo: 'Serviço concluído',       msg: 'Roberto finalizou o serviço. Avalie o atendimento!',   tipo: 'booking' },
];
const insertNotif = db.prepare(`INSERT INTO notificacoes(id,usuario_id,titulo,mensagem,tipo,lida,created_at) VALUES(?,?,?,?,?,0,?)`);
notifs.forEach(n => insertNotif.run(id(), consId, n.titulo, n.msg, n.tipo, now()));
console.log('✅ Notificações criadas');

console.log('\n🚀 Seed concluído! Credenciais:');
console.log('   Admin:      admin@serviceja.com   / admin123');
console.log('   Consumidor: joao@serviceja.com    / senha123');
console.log('   Prestador:  carlos@serviceja.com  / senha123');
db.close();
