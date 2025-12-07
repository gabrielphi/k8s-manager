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

1. Certifique-se de que seu kubeconfig está configurado corretamente

2. Execute o docker-compose:

```bash
docker-compose up -d
```

3. Acesse a aplicação:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:7000

## Parar os serviços

```bash
docker-compose down
```

## Reconstruir as imagens

```bash
docker-compose build
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
