# Sistema de Gerenciamento

Aplicação full stack para cadastro de produtos e clientes, desenvolvida como teste técnico.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite |
| Backend | C# / .NET 8 Web API |
| Banco | MySQL |
| Autenticação | JWT Bearer |

## Funcionalidades

- Login com usuário e senha (JWT)
- Dashboard com cards de navegação
- CRUD de Produtos (código, descrição, código de barras, valor de venda, pesos)
- CRUD de Clientes (código, nome, fantasia, documento com máscara CPF/CNPJ, endereço)
- Interface com glassmorphism, animações e design responsivo

## Como executar

### 1. Banco de Dados

Execute o script `database/01_CreateDatabase.sql` no MySQL.

### 2. Backend

```bash
cd backend/SoftLineTeste.Api
dotnet restore
dotnet run
```

A API sobe em `http://localhost:5144`.  
Usuário padrão criado automaticamente na primeira execução: **admin** / **admin123**

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Acessar em `http://localhost:5173`.

## Estrutura

```
/
├── database/          # Script SQL
├── backend/           # API .NET
│   └── SoftLineTeste.Api/
│       ├── Controllers/   # Auth, Produtos, Clientes
│       ├── Models/        # Entidades
│       ├── DTOs/          # Requests/Responses
│       ├── Services/      # Token JWT
│       └── Data/          # EF Core Context
└── frontend/          # React + Vite
    └── src/
        ├── components/    # Navbar, Toast, Dialog
        ├── context/       # AuthContext
        ├── pages/         # Login, Dashboard, CRUD
        ├── services/      # Axios API
        └── styles/        # Global CSS
```
