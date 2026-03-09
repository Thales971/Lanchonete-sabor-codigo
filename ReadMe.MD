# 1. Criar projeto
- npm init -y

# 2. Ajustar package.json
- Adicionar: "type": "module"
- Adicionar: "main": "server.js"
- Adicionar dentro do script: "dev": "nodemon server.js"

# 3. Instalar dependência
- npm i express dotenv pg @prisma/client @prisma/adapter-pg
- npm i -D nodemon prisma

# 4. Inicializar Prisma
- npx prisma init --datasource-provider postgresql

# 5. Configurar `.env`
- DATABASE_URL="postgresql://usuario:senha@localhost:porta/nome_do_banco_db"

# 6. Configurar schema.prisma
- crie suas tabelas

# 7. Gerar SQL
- npx prisma migrate dev --name init
- npx prisma generate

# 8. Semear dados no banco
- npx prisma db seed

# 9. Abrir Prisma Studio
- npx prisma studio

## Casos de erros

### Após alterar schema.prisma
- npx prisma migrate dev --name nome_da_alteracao (exemplo: adicionar_tabela_users)

### Banco inconsistente (⚠️ APAGA TUDO)
- npx prisma migrate reset

### Apenas popular dados
- npx prisma db seed

### Dicas
|   Comando       | Apaga dados?    | Cria migrations? | Uso            |
| --------------- | ------------    | ---------------- | -------------- |
| `migrate dev`   | ❌ Não          | ✅ Sim          | Alterar schema |
| `db seed`       | ❌ Não          | ❌ Não          | Popular dados  |
| `migrate reset` | ✅ SIM          | ❌ Não          | DEV only       |



## Clientes Routes
router.post('/clientes', autenticarApiKey, controller.criar);
router.get('/clientes', autenticarApiKey, controller.buscarTodos);👌
router.get('/clientes/:id', autenticarApiKey, controller.buscarPorId);👌
router.get('/clientes/:id/clima', autenticarApiKey, controller.buscarClima);
router.put('/clientes/:id', autenticarApiKey, controller.atualizar);👌
router.delete('/clientes/:id', autenticarApiKey, controller.deletar);👌

## Item Pedido Routes
router.post('/pedidos/:id/itens', controller.criar);
router.delete('/pedidos/:id/itens/:itemId', controller.deletar);

## Pedido Routes
router.post('/pedidos', controller.criar);
router.get('/pedidos', controller.buscarTodos);
router.get('/pedidos/:id', controller.buscarPorId);
router.put('/pedidos/:id/cancelar', controller.cancelar);

## Produto Routes
router.post("/produtos", controller.criar);👌
router.get("/produtos", controller.buscarTodos);👌
router.get("/produtos/:id", controller.buscarPorId);👌
router.put("/produtos/:id", controller.atualizar);👌
router.delete("/produtos/:id", controller.deletar);👌
