# Kubernetes Manager - Frontend

Interface web moderna para gerenciamento de clusters Kubernetes.

## Configuração

### Variável de Ambiente

Para configurar a URL do backend, crie um arquivo `.env` na raiz do diretório `frontend` com o seguinte conteúdo:

```
VITE_API_BASE_URL=http://localhost:7000
```

Substitua `http://localhost:7000` pela URL do seu backend.

**Nota:** O Vite requer que variáveis de ambiente comecem com `VITE_` para serem expostas ao código do frontend.

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## Build

```bash
npm run build
```

## Estrutura

- `src/pages/Home.tsx` - Página inicial com navegação
- `src/pages/Pods.tsx` - Página de listagem de pods
- `src/services/k8s.ts` - Serviço de comunicação com a API do backend
- `src/App.tsx` - Componente principal com roteamento
