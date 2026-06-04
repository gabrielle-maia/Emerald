// src/routes/auth.ts — /api/auth
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import db from '../db/client';
import { usuarios, prestadores, enderecos } from '../db/schema';
import { eq } from 'drizzle-orm';
import { validate } from '../middleware/validate';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createId } from '../utils/id';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

function makeTokens(user: { id: string; email: string; role: string; nome: string }) {
  const access = jwt.sign({ id: user.id, email: user.email, role: user.role, nome: user.nome }, JWT_SECRET, { expiresIn: JWT_EXPIRES } as any);
  const refresh = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES } as any);
  return { access, refresh };
}

function sanitizeUser(u: any) {
  const { senhaHash, refreshToken, ...safe } = u;
  return safe;
}

// ─── POST /api/auth/register ───────────────────────────────────────────────────
const registerSchema = z.object({
  nome:     z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email:    z.string().email('E-mail inválido'),
  senha:    z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  telefone: z.string().optional(),
  role:     z.enum(['consumidor', 'prestador']).default('consumidor'),
  cidadeId: z.string().optional(),
  ufId:     z.string().optional(),
});

router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, telefone, role, cidadeId, ufId } = req.body;

    const existing = db.query.usuarios.findFirst({ where: eq(usuarios.email, email) });
    // Using raw SQL for simplicity with better-sqlite3
    const existingRaw = (db as any)._client ? null : null;

    // Check existing via direct query
    const check = db.select().from(usuarios).where(eq(usuarios.email, email)).all();
    if (check.length > 0) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const uid = createId();

    db.insert(usuarios).values({
      id: uid, nome, email, senhaHash, telefone, role,
      cidadeId: cidadeId || null,
      ufId: ufId || null,
      ativo: true,
    }).run();

    // Se for prestador, criar perfil de prestador
    if (role === 'prestador') {
      db.insert(prestadores).values({
        id: createId(),
        usuarioId: uid,
        cidadeId: cidadeId || null,
        ufId: ufId || null,
      }).run();
    }

    const user = db.select().from(usuarios).where(eq(usuarios.id, uid)).get()!;
    const { access, refresh } = makeTokens({ id: user.id, email: user.email, role: user.role, nome: user.nome });

    // Salvar refresh token
    db.update(usuarios).set({ refreshToken: refresh }).where(eq(usuarios.id, uid)).run();

    return res.status(201).json({
      message: 'Conta criada com sucesso',
      user: sanitizeUser(user),
      tokens: { access, refresh },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;
    const user = db.select().from(usuarios).where(eq(usuarios.email, email)).get();
    if (!user || !user.ativo) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }
    const valid = await bcrypt.compare(senha, user.senhaHash);
    if (!valid) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }
    const { access, refresh } = makeTokens({ id: user.id, email: user.email, role: user.role, nome: user.nome });
    db.update(usuarios).set({ refreshToken: refresh, updatedAt: new Date().toISOString() }).where(eq(usuarios.id, user.id)).run();

    // Buscar dados do prestador se aplicável
    let prestador = null;
    if (user.role === 'prestador') {
      prestador = db.select().from(prestadores).where(eq(prestadores.usuarioId, user.id)).get();
    }

    return res.json({
      message: 'Login realizado com sucesso',
      user: sanitizeUser(user),
      prestador,
      tokens: { access, refresh },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/auth/refresh ────────────────────────────────────────────────────
router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token não fornecido' });
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET) as any;
    const user = db.select().from(usuarios).where(eq(usuarios.id, payload.id)).get();
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Refresh token inválido' });
    }
    const { access, refresh } = makeTokens({ id: user.id, email: user.email, role: user.role, nome: user.nome });
    db.update(usuarios).set({ refreshToken: refresh }).where(eq(usuarios.id, user.id)).run();
    return res.json({ tokens: { access, refresh } });
  } catch {
    return res.status(401).json({ error: 'Refresh token inválido ou expirado' });
  }
});

// ─── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post('/logout', authenticate, (req: AuthRequest, res: Response) => {
  db.update(usuarios).set({ refreshToken: null }).where(eq(usuarios.id, req.user!.id)).run();
  return res.json({ message: 'Logout realizado com sucesso' });
});

// ─── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'E-mail é obrigatório' });
  const user = db.select().from(usuarios).where(eq(usuarios.email, email)).get();
  // Sempre retornar 200 por segurança (não revelar se e-mail existe)
  return res.json({ message: 'Se o e-mail estiver cadastrado, você receberá as instruções em breve.' });
});

// ─── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  const user = db.select().from(usuarios).where(eq(usuarios.id, req.user!.id)).get();
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  let prestador = null;
  if (user.role === 'prestador') {
    prestador = db.select().from(prestadores).where(eq(prestadores.usuarioId, user.id)).get();
  }
  const enderecosUser = db.select().from(enderecos).where(eq(enderecos.usuarioId, user.id)).all();

  return res.json({ user: sanitizeUser(user), prestador, enderecos: enderecosUser });
});

export default router;
