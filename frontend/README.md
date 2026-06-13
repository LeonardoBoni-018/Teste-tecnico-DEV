# Frontend - NovaGest

Aplicação React 19 + Vite com MUI (Material UI), React Router e Axios.

## Scripts

```bash
npm run dev        # Servidor de desenvolvimento (http://localhost:5173)
npm run build      # Build de produção
npm run preview    # Preview da build
npm test           # Executa testes (Vitest + Testing Library)
npm run lint       # ESLint (0 erros esperado)
```

## Stack

- **React 19** com Strict Mode
- **Vite 8** como bundler
- **MUI 9** (Material UI) para formulários e tabelas
- **React Router 7** para navegação
- **Axios** para requisições HTTP
- **Vitest + Testing Library** para testes
- Tema claro/escuro com CSS custom properties

## Estrutura

```
src/
├── components/       # Navbar, Toast, ConfirmDialog, Logo, PrivateRoute
├── context/          # AuthContext, ThemeContext
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Produtos/     # ProdutoList, ProdutoForm
│   └── Clientes/     # ClienteList, ClienteForm
├── services/         # api.js (Axios + interceptors)
├── styles/           # global.css (variáveis, temas, animações)
└── __tests__/        # Testes (48 testes)
```
