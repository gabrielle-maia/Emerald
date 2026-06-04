# 🔧 ServiçaJá API

Backend REST para o marketplace de serviços humanos **ServiçaJá**.

**Stack:** TypeScript · Express · SQLite · Drizzle ORM

---

## 🚀 Início rápido

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env e troque JWT_SECRET por uma chave forte

# 3. Criar o banco de dados e tabelas
npm run db:migrate

# 4. Popular com dados iniciais
npm run db:seed

# 5. Rodar o servidor em desenvolvimento
npm run dev
```

O servidor sobe em **http://localhost:3000**

---

## 👤 Credenciais do seed

| Perfil       | E-mail                     | Senha     |
|--------------|----------------------------|-----------|
| Superadmin   | admin@serviceja.com        | admin123  |
| Consumidor   | joao@serviceja.com         | senha123  |
| Prestador    | carlos@serviceja.com       | senha123  |
| Prestador    | maria@serviceja.com        | senha123  |
| Prestador    | roberto@serviceja.com      | senha123  |

---

## 📋 Endpoints

### 🔐 Auth — `/api/auth`
| Método | Rota               | Auth | Descrição                      |
|--------|--------------------|------|--------------------------------|
| POST   | /register          | ❌   | Cadastro de usuário            |
| POST   | /login             | ❌   | Login (retorna tokens JWT)     |
| POST   | /refresh           | ❌   | Renovar access token           |
| POST   | /logout            | ✅   | Logout (invalida refresh)      |
| POST   | /forgot-password   | ❌   | Solicitar redefinição de senha |
| GET    | /me                | ✅   | Dados do usuário logado        |

### 👥 Usuários — `/api/usuarios`
| Método | Rota                        | Auth        | Descrição              |
|--------|-----------------------------|-------------|------------------------|
| GET    | /                           | Superadmin  | Listar todos           |
| GET    | /:id                        | ✅ (próprio) | Ver perfil             |
| PUT    | /:id                        | ✅ (próprio) | Atualizar perfil       |
| PUT    | /:id/senha                  | ✅ (próprio) | Alterar senha          |
| DELETE | /:id                        | Superadmin  | Desativar usuário      |
| GET    | /:id/enderecos              | ✅ (próprio) | Listar endereços       |
| POST   | /:id/enderecos              | ✅ (próprio) | Adicionar endereço     |
| DELETE | /:id/enderecos/:eid         | ✅ (próprio) | Remover endereço       |

### 🗺️ UFs — `/api/ufs`
| Método | Rota           | Auth       | Descrição      |
|--------|----------------|------------|----------------|
| GET    | /              | ❌         | Listar UFs     |
| GET    | /:id           | ❌         | Ver UF         |
| POST   | /              | Superadmin | Criar UF       |
| PUT    | /:id           | Superadmin | Atualizar UF   |
| DELETE | /:id           | Superadmin | Remover UF     |
| GET    | /:id/cidades   | ❌         | Cidades da UF  |

### 🏙️ Cidades — `/api/cidades`
| Método | Rota    | Auth       | Descrição       |
|--------|---------|------------|-----------------|
| GET    | /       | ❌         | Listar (filtro ?ufId=) |
| GET    | /:id    | ❌         | Ver cidade      |
| POST   | /       | Superadmin | Criar cidade    |
| PUT    | /:id    | Superadmin | Atualizar       |
| DELETE | /:id    | Superadmin | Remover         |

### 📂 Categorias — `/api/categorias`
| Método | Rota    | Auth       | Descrição      |
|--------|---------|------------|----------------|
| GET    | /       | ❌         | Listar         |
| GET    | /:id    | ❌         | Ver categoria  |
| POST   | /       | Superadmin | Criar          |
| PUT    | /:id    | Superadmin | Atualizar      |
| DELETE | /:id    | Superadmin | Desativar      |

### 🛠️ Serviços — `/api/servicos`
| Método | Rota              | Auth       | Descrição                     |
|--------|-------------------|------------|-------------------------------|
| GET    | /                 | ❌         | Listar (filtros e paginação)  |
| GET    | /:id              | ❌         | Ver serviço                   |
| POST   | /                 | Prestador  | Criar serviço                 |
| PUT    | /:id              | Prestador  | Editar (só o dono)            |
| DELETE | /:id              | Prestador  | Remover (só o dono)           |
| POST   | /:id/favorito     | ✅         | Toggle favorito               |
| GET    | /favoritos/meus   | ✅         | Meus favoritos                |

**Filtros GET /api/servicos:**
```
?categoriaId=&cidadeId=&ufId=&destaque=true&busca=eletricista
&minPreco=50&maxPreco=500&minAvaliacao=4
&ordem=preco_asc|preco_desc|avaliacao
&page=1&limit=20
```

### 👷 Prestadores — `/api/prestadores`
| Método | Rota                    | Auth      | Descrição             |
|--------|-------------------------|-----------|-----------------------|
| GET    | /                       | ❌        | Listar prestadores    |
| GET    | /:id                    | ❌        | Ver perfil            |
| PUT    | /:id                    | Prestador | Editar (só o dono)    |
| GET    | /me/perfil              | Prestador | Meu perfil            |
| GET    | /:id/agenda             | ❌        | Ver agenda (?data=)   |
| POST   | /:id/agenda             | Prestador | Adicionar slot        |
| DELETE | /:id/agenda/:slotId     | Prestador | Remover slot          |

### 📅 Agendamentos — `/api/agendamentos`
| Método | Rota              | Auth       | Descrição                      |
|--------|-------------------|------------|--------------------------------|
| GET    | /                 | ✅         | Listar (filtro por papel)      |
| GET    | /:id              | ✅         | Ver agendamento                |
| POST   | /                 | Consumidor | Criar agendamento              |
| PATCH  | /:id/status       | ✅         | Atualizar status               |
| POST   | /:id/avaliar      | Consumidor | Avaliar serviço concluído      |

**Status válidos:**
- `aguardando_confirmacao` → `confirmado` (prestador)
- `confirmado` → `em_andamento` (prestador)
- `em_andamento` → `concluido` (prestador)
- qualquer → `cancelado` (consumidor ou prestador)

### 🔔 Notificações — `/api/notificacoes`
| Método | Rota                        | Auth | Descrição               |
|--------|-----------------------------|------|-------------------------|
| GET    | /                           | ✅   | Listar notificações     |
| PATCH  | /:id/lida                   | ✅   | Marcar como lida        |
| PATCH  | /marcar-todas/lidas         | ✅   | Marcar todas como lidas |
| DELETE | /:id                        | ✅   | Remover notificação     |

---

## 🏗️ Estrutura do projeto

```
serviceja-api/
├── src/
│   ├── index.ts              # Entry point Express
│   ├── db/
│   │   ├── schema.ts         # Schema Drizzle (todas as tabelas)
│   │   ├── client.ts         # Conexão SQLite + Drizzle
│   │   ├── migrate.ts        # Criação das tabelas
│   │   └── seed.ts           # Dados iniciais
│   ├── routes/
│   │   ├── auth.ts           # Autenticação e autorização
│   │   ├── usuarios.ts       # CRUD de usuários e endereços
│   │   ├── ufs.ts            # CRUD de UFs
│   │   ├── cidades.ts        # CRUD de cidades
│   │   ├── categorias.ts     # CRUD de categorias
│   │   ├── servicos.ts       # CRUD de serviços + favoritos
│   │   ├── prestadores.ts    # CRUD de prestadores + agenda
│   │   ├── agendamentos.ts   # CRUD de agendamentos + avaliações
│   │   └── notificacoes.ts   # Notificações do usuário
│   ├── middleware/
│   │   ├── auth.ts           # JWT authenticate + requireRole
│   │   ├── validate.ts       # Validação Zod
│   │   └── errorHandler.ts   # Error handler global
│   └── utils/
│       └── id.ts             # Gerador de IDs únicos
├── .env.example
├── drizzle.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🗄️ Entidades do banco

| Tabela        | Descrição                              |
|---------------|----------------------------------------|
| ufs           | Unidades Federativas                   |
| cidades       | Cidades vinculadas a UFs               |
| usuarios      | Usuários (consumidor/prestador/admin)  |
| enderecos     | Endereços dos usuários                 |
| categorias    | Categorias de serviços                 |
| prestadores   | Perfil profissional dos prestadores    |
| servicos      | Serviços cadastrados pelos prestadores |
| agenda        | Slots de disponibilidade dos prestadores|
| agendamentos  | Contratos entre consumidor e prestador |
| avaliacoes    | Avaliações pós-serviço                 |
| favoritos     | Serviços favoritados pelos consumidores|
| notificacoes  | Notificações dos usuários              |

---

## 🔑 Autenticação

A API usa JWT. Adicione o header em rotas protegidas:

```
Authorization: Bearer <access_token>
```

O access token expira em 7 dias. Use `/api/auth/refresh` com o `refreshToken` para obter um novo.
