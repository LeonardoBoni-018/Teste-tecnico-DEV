# NovaGest - Sistema de Gerenciamento

Aplicação full stack para cadastro de produtos e clientes com autenticação JWT, construída com .NET 8, React 19 e MySQL.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + Vite + MUI (Material UI) |
| Backend | C# / .NET 8 Web API (EF Core, JWT, BCrypt) |
| Banco | MySQL 8.0 |
| Validações | CPF/CNPJ (dígitos verificadores), Complexidade de senha, Formatação de documento |
| Testes | xUnit + FluentAssertions (backend) · Vitest + Testing Library (frontend) |
| Infra | Docker Compose (nginx + API + banco) |

## Funcionalidades

- Autenticação JWT com registro e login
- Dashboard com acesso rápido e atividade recente
- CRUD de **Produtos** (código, descrição, código de barras, valor, pesos)
- CRUD de **Clientes** (código, nome/fantasia, documento CPF/CNPJ com máscara, endereço)
- Validação de dígitos verificadores de CPF e CNPJ (backend + frontend)
- Validação de complexidade de senha (maiúscula, minúscula, número, especial, mínimo 8 caracteres)
- Confirmação de senha no registro
- Rate limiting no login (10 requisições/minuto)
- Tema claro/escuro com persistência em localStorage
- Visualização e edição de registros
- Design responsivo com animações CSS

## Como executar

### Com Docker (recomendado)

```bash
# Na raiz do projeto
docker compose up --build
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost |
| API (Swagger) | http://localhost:8080/swagger |

> Caso já tenha executado anteriormente, rode `docker compose down -v` para limpar o volume do banco antes de subir novamente.

### Sem Docker

**Pré-requisitos:** MySQL 8.0 rodando na porta 3306, .NET 8 SDK, Node.js 20+.

```bash
# 1. Banco de dados
# Execute o script database/01_CreateDatabase.sql no MySQL

# 2. Backend
cd backend/SoftLineTeste.Api
dotnet run
# API disponível em http://localhost:5144

# 3. Frontend
cd frontend
npm install
npm run dev
# Frontend disponível em http://localhost:5173
```

### Credenciais padrão

| Campo | Valor |
|-------|-------|
| Usuário | `admin` |
| Senha | `Admin@123` |

O usuário administrador é criado automaticamente na primeira execução.

## Testes

```bash
# Backend (97 testes · xUnit)
cd backend/SoftLineTeste.Tests
dotnet test

# Frontend (48 testes · Vitest)
cd frontend
npm test          # Execução única
npm run test:watch  # Modo watch
```

## Estrutura do projeto

```
/
├── database/                         # Script SQL (schema + seed)
├── backend/
│   ├── SoftLineTeste.Api/            # API REST .NET 8
│   │   ├── Controllers/              # Auth, Produtos, Clientes
│   │   ├── Models/                   # Entidades (Usuario, Produto, Cliente)
│   │   ├── DTOs/                     # Request/Response com Data Annotations
│   │   ├── Services/                 # JWT Token, Rate Limiter, Security Headers
│   │   ├── Data/                     # EF Core DbContext + Configurações
│   │   └── Validators/               # CPF/CNPJ, PasswordComplexity
│   └── SoftLineTeste.Tests/          # Testes de unidade (xUnit)
├── frontend/                         # Aplicação React + Vite
│   └── src/
│       ├── components/               # Navbar, Toast, ConfirmDialog, Logo
│       ├── context/                  # AuthContext, ThemeContext
│       ├── pages/                    # Login, Dashboard, Produtos, Clientes (com MUI)
│       ├── services/                 # Axios client + service wrappers
│       ├── styles/                   # CSS global com variáveis (claro/escuro)
│       └── __tests__/                # Testes (Vitest + Testing Library)
├── docker-compose.yml                # Orquestração (MySQL + API + nginx)
├── .env                              # Variáveis de ambiente (não versionado)
└── .gitignore
```

## Modelagem do banco

Tabelas independentes, sem relacionamentos — o escopo contempla CRUD individual de cada entidade.

| Tabela | Colunas |
|--------|---------|
| `Usuarios` | `Id`, `Username` (unique), `PasswordHash`, `Nome`, `CreatedAt` |
| `Produtos` | `Id`, `Codigo`, `Descricao`, `CodigoBarras`, `ValorVenda`, `PesoBruto`, `PesoLiquido`, `CreatedAt`, `UpdatedAt` |
| `Clientes` | `Id`, `Codigo`, `Nome`, `Fantasia`, `Documento`, `Endereco`, `CreatedAt`, `UpdatedAt` |

## Observações

- O frontend utiliza MUI (Material UI) nos formulários e tabelas de Produtos e Clientes, enquanto a página de Login mantém estilo CSS customizado
- O proxy reverso (nginx) redireciona requisições `/api/` para o backend, eliminando problemas de CORS em produção
- O arquivo `.env` (raiz) contém as credenciais do banco e a chave JWT — não versionado, deve ser criado localmente conforme `.env.example`
