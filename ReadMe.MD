# 🍔 Lanchonete Sabor & Código

API REST para gerenciamento de clientes, produtos e pedidos de uma lanchonete. Arquitetura MVC •
Prisma ORM • PostgreSQL • Express

## Estrutura de Pastas

```
src/
 ├── controllers/   # Validações HTTP e respostas
 ├── models/        # Regras de negócio e acesso ao banco
 ├── routes/        # Definição dos endpoints
 ├── utils/         # Funções auxiliares (apiKey, prismaClient)
 └── server.js      # Ponto de entrada
prisma/
 ├── schema.prisma  # Modelo de dados
 └── seed.js        # Dados iniciais
```

## Como rodar

1. Clone o repositório
2. `npm install`
3. Copie `.env.example` para `.env` e ajuste as variáveis
4. `npx prisma migrate dev --name init`
5. `npx prisma db seed`
6. `npm run dev`

## Variáveis de Ambiente

| Variável       | Descrição                          |
| -------------- | ---------------------------------- |
| `DATABASE_URL` | URL de conexão com o PostgreSQL    |
| `API_KEY`      | Chave de autenticação para cliente |

## Endpoints

### Clientes (requer header `X-API-Key`)

| Método | Rota                      | Descrição                  |
| ------ | ------------------------- | -------------------------- |
| POST   | `/api/clientes`           | Criar cliente              |
| GET    | `/api/clientes`           | Listar clientes            |
| GET    | `/api/clientes/:id`       | Buscar cliente por ID      |
| PUT    | `/api/clientes/:id`       | Atualizar cliente          |
| DELETE | `/api/clientes/:id`       | Deletar cliente            |
| GET    | `/api/clientes/:id/clima` | Consultar clima do cliente |

### Produtos

| Método | Rota                | Descrição             |
| ------ | ------------------- | --------------------- |
| POST   | `/api/produtos`     | Criar produto         |
| GET    | `/api/produtos`     | Listar produtos       |
| GET    | `/api/produtos/:id` | Buscar produto por ID |
| PUT    | `/api/produtos/:id` | Atualizar produto     |
| DELETE | `/api/produtos/:id` | Deletar produto       |

### Pedidos

| Método | Rota                        | Descrição       |
| ------ | --------------------------- | --------------- |
| POST   | `/api/pedidos`              | Criar pedido    |
| GET    | `/api/pedidos`              | Listar pedidos  |
| GET    | `/api/pedidos/:id`          | Buscar por ID   |
| PUT    | `/api/pedidos/:id/cancelar` | Cancelar pedido |
| DELETE | `/api/pedidos/:id`          | Deletar pedido  |

### Itens do Pedido

| Método | Rota                             | Descrição      |
| ------ | -------------------------------- | -------------- |
| POST   | `/api/pedidos/:id/itens`         | Adicionar item |
| DELETE | `/api/pedidos/:id/itens/:itemId` | Remover item   |

## Prisma Studio

```bash
npx prisma studio
```

## Casos de erros

### Após alterar schema.prisma

- `npx prisma migrate dev --name nome_da_alteracao`

### Banco inconsistente (⚠️ APAGA TUDO)

- `npx prisma migrate reset`

### Apenas popular dados

- `npx prisma db seed`
