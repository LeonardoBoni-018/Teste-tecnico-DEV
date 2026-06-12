# NovaGest - Sistema de Gerenciamento

Teste técnico para vaga DEV na Soft-line Soluções em Sistemas.

Aplicação full stack para cadastro de produtos e clientes com autenticação JWT.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + Vite + MUI |
| Backend | C# / .NET 8 Web API (EF Core, JWT) |
| Banco | MySQL 8.0 |
| Autenticação | JWT Bearer + BCrypt |
| Validações | CPF/CNPJ, complexidade de senha (maiúscula, minúscula, número, especial) |
| Testes | xUnit (backend) + Vitest (frontend) |
| Docker | docker compose (banco + backend + frontend) |

## Funcionalidades

- Login com usuário e senha + opção de registro
- Dashboard com acesso rápido e atividade recente
- CRUD de Produtos (código, descrição, código de barras, valor venda, peso bruto/líquido)
- CRUD de Clientes (código, nome, fantasia, documento CPF/CNPJ com máscara, endereço)
- Validação de CPF/CNPJ (dígitos verificadores)
- Tema claro/escuro com persistência em localStorage
- Rate limiting no login (10 req/min)
- Design responsivo com animações

## Modelagem do Banco

Três tabelas independentes (sem relacionamentos):

| Tabela | Finalidade |
|--------|-----------|
| `Usuarios` | Autenticação (username, password hash, nome) |
| `Produtos` | Cadastro de produtos (código, descrição, código barras, valor, pesos) |
| `Clientes` | Cadastro de clientes (código, nome, fantasia, documento, endereço) |

Não há relacionamentos porque o escopo do teste não exige pedidos/vendas, categorias ou auditoria — cada entidade é independente.

## Como executar

### Com Docker (recomendado)

```bash
# Na raiz do projeto
docker compose up --build
# Frontend: http://localhost
# Swagger:  http://localhost:8080/swagger
```

### Sem Docker

```bash
# 1. Banco: execute database/01_CreateDatabase.sql no MySQL (porta 3306)

# 2. Backend
cd backend/SoftLineTeste.Api
dotnet run
# API em http://localhost:5144

# 3. Frontend
cd frontend
npm install
npm run dev
# Acessar http://localhost:5173
```

### Login padrão

**admin@email.com** / **Admin@123** (criado automaticamente na primeira execução)

## Testes

```bash
# Backend (89 testes xUnit)
cd backend/SoftLineTeste.Tests
dotnet test

# Frontend (46 testes Vitest)
cd frontend
npm test
```

## Estrutura

```
/
├── database/                   # Script SQL
├── backend/
│   ├── SoftLineTeste.Api/      # API .NET
│   │   ├── Controllers/        # Auth, Produtos, Clientes
│   │   ├── Models/             # Entidades (Usuario, Produto, Cliente)
│   │   ├── DTOs/               # Requests com validação
│   │   ├── Services/           # Token JWT, Rate limiter
│   │   ├── Data/               # EF Core DbContext
│   │   └── Validators/         # CPF/CNPJ validation
│   └── SoftLineTeste.Tests/    # Testes xUnit
├── frontend/                   # React + Vite
│   └── src/
│       ├── components/         # Navbar, Toast, ConfirmDialog
│       ├── context/            # AuthContext, ThemeContext
│       ├── pages/              # Login, Dashboard, Produtos, Clientes
│       ├── services/           # Axios API
│       ├── styles/             # CSS global com variables
│       └── __tests__/          # Testes Vitest
└── docker-compose.yml          # Orquestração Docker
```
