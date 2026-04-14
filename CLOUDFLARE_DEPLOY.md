# 🚀 Deploy no Cloudflare Pages

Este projeto está pronto para ser hospedado no **Cloudflare Pages** com todos os recursos funcionando.

## 🎯 O que Mudou

O projeto agora suporta:
- ✅ **Frontend**: Hospedado no Cloudflare Pages (React SPA)
- ✅ **Backend**: APIs em Cloudflare Workers Functions
- ✅ **Sem mudanças no código**: A aplicação React funciona exatamente igual
- ✅ **Automático**: Deploy contínuo via git

## 📋 Pré-requisitos

1. **Conta Cloudflare** (grátis em https://dash.cloudflare.com)
2. **Git** configurado e conectado ao repositório
3. **Node.js/npm** instalado localmente

## 🔧 Setup Passo a Passo

### 1️⃣ Instalar Dependências Cloudflare

```bash
npm install
```

(O `package.json` já foi atualizado com as dependências necessárias)

### 2️⃣ Fazer Login no Cloudflare

```bash
npx wrangler login
```

Isto abrirá o navegador para autenticação. Clique em **"Autorizar"**.

### 3️⃣ Configurar o Projeto no Cloudflare

#### Opção A: Via Interface Web (Recomendado - mais fácil)

1. Acesse [dash.cloudflare.com/sign-up/pages](https://dash.cloudflare.com/sign-up/pages)
2. Clique em **"Create project"**
3. Selecione seu repositório Git
4. Configure:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist/spa`
   - **Root directory**: `/` (deixe vazio)
5. Clique em **"Save and Deploy"**

O Cloudflare fará o primeiro deploy automaticamente.

#### Opção B: Via Terminal (wrangler)

```bash
npx wrangler pages project create agenda-app
```

### 4️⃣ Aguardar Primeiro Deploy

O Cloudflare automaticamente:
1. Fará checkout do seu repositório
2. Executará `npm run build`
3. Hospedará a pasta `dist/spa`
4. Criará uma URL pública como: `agenda-app.pages.dev`

## 🌐 Seu App Está Online!

Após o deploy, sua aplicação estará disponível em:

```
https://seu-projeto.pages.dev
```

### Verificar Deploy

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com)
2. Vá para **Pages**
3. Seu projeto aparecerá com status ✅ **Active**

## 📡 APIs e Endpoints

As APIs estão configuradas em `functions/_app.ts`:

- `GET /api/ping` - Health check
- `GET /api/demo` - Demo endpoint
- `GET /api/bids` - Listar bids
- `POST /api/bids` - Criar bid

**Importante**: Se você tiver endpoints Express customizados no seu projeto, eles precisam ser migrados para `functions/_app.ts`.

## 🔄 Deploy Contínuo

Após a configuração inicial:

1. Faça um commit e push para o branch principal:
```bash
git add .
git commit -m "Preparar para Cloudflare Pages"
git push origin main
```

2. O Cloudflare **automaticamente**:
   - Detecta o novo push
   - Executa `npm run build`
   - Faz deploy da nova versão
   - Atualiza a URL pública

Não precisa fazer nada mais!

## 🔗 Domínio Customizado (Opcional)

Para usar seu próprio domínio:

1. No **Cloudflare Dashboard** → seu projeto Pages
2. Vá para **Settings** → **Custom domains**
3. Clique em **Add custom domain**
4. Digite seu domínio (ex: `agenda.seusite.com`)
5. Siga as instruções para apontar o DNS

## 📊 Monitoramento

No **Cloudflare Dashboard** → seu projeto:

- **Analytics**: Tráfego, requisições, bandeira geográfica
- **Deployments**: Histórico de deploys com status
- **Logs**: Detalhes de requisições e erros
- **Settings**: Variáveis de ambiente, cache, etc.

## 🔐 Variáveis de Ambiente

Se precisar de variáveis secretas:

1. Dashboard → seu projeto Pages
2. **Settings** → **Environment variables**
3. Adicione as variáveis

No código React, acesse com:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 🆘 Troubleshooting

### Deploy falha com erro de build

```bash
# Testar build localmente
npm run build

# Verificar se a pasta dist/spa foi criada
ls dist/spa
```

Se falhar localmente, corrige e faz commit novamente.

### APIs retornam 404

Verifique que:
1. As rotas em `functions/_app.ts` estão corretas
2. Você fez deploy da nova versão (aguarde alguns minutos)
3. A URL da API está correta no React

### URL do Cloudflare é muito longa

Você pode:
- Usar um **domínio customizado** (veja seção acima)
- Usar um serviço como Bitly para criar um link curto

## 🚨 Rollback (Voltar a Versão Anterior)

Se algo deu errado:

1. Dashboard → seu projeto → **Deployments**
2. Encontre o deployment anterior
3. Clique nos **3 pontinhos** → **Rollback**

A versão anterior volta ao vivo em segundos!

## 💡 Dicas

- **Cache**: O Cloudflare cacheia automaticamente arquivos estáticos
- **Grátis**: Plano gratuito inclui 500 deploys/mês (mais que suficiente)
- **SSL/TLS**: Já incluído e renovado automaticamente
- **CDN Global**: Seu site é distribuído em servidores pelo mundo

## 📚 Documentação Oficial

- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Workers Functions](https://developers.cloudflare.com/workers/functions/bindings/nodejs/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

---

**Pronto para deploy?** 🚀

1. Instale as dependências: `npm install`
2. Faça login: `npx wrangler login`
3. Crie o projeto no Cloudflare Dashboard
4. Aguarde o primeiro deploy automático!

Se tiver dúvidas, verifique os logs no Dashboard ou no terminal com:
```bash
npx wrangler pages deployment list
```
