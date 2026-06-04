// src/index.ts — Entry point ServiçaJá API
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth';
import usuariosRoutes from './routes/usuarios';
import ufsRoutes from './routes/ufs';
import cidadesRoutes from './routes/cidades';
import categoriasRoutes from './routes/categorias';
import servicosRoutes from './routes/servicos';
import prestadoresRoutes from './routes/prestadores';
import agendamentosRoutes from './routes/agendamentos';
import notificacoesRoutes from './routes/notificacoes';

// Middleware
import { errorHandler, notFound } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security & Parsing ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' } });
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/usuarios',      usuariosRoutes);
app.use('/api/ufs',           ufsRoutes);
app.use('/api/cidades',       cidadesRoutes);
app.use('/api/categorias',    categoriasRoutes);
app.use('/api/servicos',      servicosRoutes);
app.use('/api/prestadores',   prestadoresRoutes);
app.use('/api/agendamentos',  agendamentosRoutes);
app.use('/api/notificacoes',  notificacoesRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: process.env.APP_NAME || 'ServiçaJá API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// ─── Documentação resumida ────────────────────────────────────────────────────
app.get('/api', (_req, res) => {
  res.json({
    name: 'ServiçaJá API',
    version: '1.0.0',
    description: 'API REST para marketplace de serviços humanos',
    endpoints: {
      auth:          { base: '/api/auth',         routes: ['POST /register', 'POST /login', 'POST /refresh', 'POST /logout', 'POST /forgot-password', 'GET /me'] },
      usuarios:      { base: '/api/usuarios',      routes: ['GET /', 'GET /:id', 'PUT /:id', 'PUT /:id/senha', 'DELETE /:id', 'GET /:id/enderecos', 'POST /:id/enderecos', 'DELETE /:id/enderecos/:eid'] },
      ufs:           { base: '/api/ufs',           routes: ['GET /', 'GET /:id', 'POST /', 'PUT /:id', 'DELETE /:id', 'GET /:id/cidades'] },
      cidades:       { base: '/api/cidades',       routes: ['GET /', 'GET /:id', 'POST /', 'PUT /:id', 'DELETE /:id'] },
      categorias:    { base: '/api/categorias',    routes: ['GET /', 'GET /:id', 'POST /', 'PUT /:id', 'DELETE /:id'] },
      servicos:      { base: '/api/servicos',      routes: ['GET /', 'GET /:id', 'POST /', 'PUT /:id', 'DELETE /:id', 'POST /:id/favorito', 'GET /favoritos/meus'] },
      prestadores:   { base: '/api/prestadores',   routes: ['GET /', 'GET /:id', 'PUT /:id', 'GET /me/perfil', 'GET /:id/agenda', 'POST /:id/agenda', 'DELETE /:id/agenda/:slotId'] },
      agendamentos:  { base: '/api/agendamentos',  routes: ['GET /', 'GET /:id', 'POST /', 'PATCH /:id/status', 'POST /:id/avaliar'] },
      notificacoes:  { base: '/api/notificacoes',  routes: ['GET /', 'PATCH /:id/lida', 'PATCH /marcar-todas/lidas', 'DELETE /:id'] },
    },
  });
});

// ─── Error handlers ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log(`║   🔧 ServiçaJá API                      ║`);
  console.log(`║   Rodando em http://localhost:${PORT}      ║`);
  console.log(`║   Ambiente: ${(process.env.NODE_ENV || 'development').padEnd(28)}║`);
  console.log('╚════════════════════════════════════════╝\n');
  console.log('📋 Endpoints disponíveis em: http://localhost:' + PORT + '/api');
  console.log('❤️  Health check em:         http://localhost:' + PORT + '/health\n');
});

export default app;
