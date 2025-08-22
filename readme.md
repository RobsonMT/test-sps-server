# SPS Test Server

Backend feito com **Node.js + TypeScript + Express** e banco
em memória.

## 🚀 Funcionalidades

-   Login (`POST /auth/login`) com JWT
-   CRUD de usuários (`/users`)
-   Usuário admin pré-cadastrado:
    -   **Email:** `admin@sps.com`
    -   **Senha:** `admin123`

------------------------------------------------------------------------

## 📦 Pré-requisitos

-   [Node.js 18+](https://nodejs.org/)
-   [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

------------------------------------------------------------------------

## ⚙️ Instalação

Clone o repositório e instale as dependências:

``` bash
git clone git@github.com:RobsonMT/test-sps-server.git
cd test-sps-server
npm install
```

ou

``` bash
yarn install
```

------------------------------------------------------------------------

## ⚙️ Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=8000
JWT_SECRET="dev-secret-change-me"
```
------------------------------------------------------------------------

## ▶️ Rodando a aplicação

### Desenvolvimento (hot reload com ts-node-dev)

``` bash
npm run dev
```

Servidor rodará em:\
👉 <http://localhost:8000>

------------------------------------------------------------------------

## 🔑 Testando rotas principais

### Login

``` bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sps.com","password":"admin123"}'
```

Isso retornará um token JWT.\
Use-o no header `Authorization: Bearer <token>` para acessar rotas
protegidas.

### Listar usuários

``` bash
curl -H "Authorization: Bearer <token>" http://localhost:8000/users
```

------------------------------------------------------------------------

## 🧪 Rodando os testes

Rodar todos os testes:

``` bash
npm test
```

------------------------------------------------------------------------

## 📂 Estrutura do projeto

    test-sps-server/
    ├── src/
    │   ├── index.ts         # App Express
    │   └── ...              # Rotas, middlewares, utils
    ├── tests/               # Testes unitários
    ├── jest.config.ts       # Configuração do Jest
    └── README.md            # Este guia

------------------------------------------------------------------------

## 💡 Observações

-   O banco é **em memória**: todos os dados são perdidos ao reiniciar o
    servidor.
-   Usuário `admin` é recriado automaticamente a cada inicialização.
