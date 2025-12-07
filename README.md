# Kubernetes Manager

Interface web moderna para gerenciamento de clusters Kubernetes, facilitando operações para usuários sem conhecimento avançado em Kubernetes.

## Estrutura do Projeto

- `backend/` - API em Go que se comunica com o cluster Kubernetes
- `frontend/` - Interface web em React + TypeScript

## Pré-requisitos

- Docker e Docker Compose
- Acesso a um cluster Kubernetes (kubeconfig configurado)
- kubeconfig localizado em `~/.kube/config` (Linux/Mac) ou `%USERPROFILE%\.kube\config` (Windows)

### Nota para Windows

Se você estiver usando Windows, edite o arquivo `docker-compose.yml` e ajuste o volume do kubeconfig:

```yaml
volumes:
  - C:/Users/SEU_USUARIO/.kube/config:/root/.kube/config:ro
```

Substitua `SEU_USUARIO` pelo seu nome de usuário do Windows.

## Executando com Docker Compose

### Desenvolvimento (com Hot Reload)

Para desenvolvimento com hot reload automático:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

**Características:**
- Hot reload automático (frontend e backend)
- Código fonte montado como volume
- Cache otimizado de dependências

### Produção

Para executar em modo produção:

```bash
docker-compose -f docker-compose.prod.yml up --build
```

**Características:**
- Imagens otimizadas (multi-stage build)
- Frontend servido via Nginx
- Backend como binário estático

### Acesso

Após iniciar os serviços:
- Frontend: http://localhost:3000
- Backend API: http://localhost:7000

> 📖 **Documentação completa**: Veja [DOCKER.md](./DOCKER.md) para mais detalhes sobre desenvolvimento e produção.

## Parar os serviços

```bash
# Desenvolvimento
docker-compose -f docker-compose.dev.yml down

# Produção
docker-compose -f docker-compose.prod.yml down
```

## Reconstruir as imagens

```bash
# Desenvolvimento
docker-compose -f docker-compose.dev.yml build --no-cache

# Produção
docker-compose -f docker-compose.prod.yml build --no-cache
```

## Logs

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs apenas do backend
docker-compose logs -f backend

# Ver logs apenas do frontend
docker-compose logs -f frontend
```

## Desenvolvimento Local

### Backend

```bash
cd backend
go run main.go
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Crie um arquivo `.env` na pasta `frontend` com:

```
VITE_API_BASE_URL=http://localhost:7000
```

## Funcionalidades

- Listagem de Pods por namespace
- Visualização de status, IP, node e imagem dos pods
- Interface intuitiva e responsiva

## Notas

- O backend precisa ter acesso ao cluster Kubernetes através do kubeconfig
- O volume do kubeconfig é montado como read-only por segurança
- A comunicação entre frontend e backend acontece através da rede Docker
