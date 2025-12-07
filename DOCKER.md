# Guia de Uso do Docker

Este projeto possui configurações Docker separadas para **desenvolvimento** e **produção**.

## 📋 Estrutura de Arquivos

### Desenvolvimento
- `docker-compose.dev.yml` - Compose para desenvolvimento
- `frontend/Dockerfile.dev` - Dockerfile do frontend para desenvolvimento
- `backend/Dockerfile.dev` - Dockerfile do backend para desenvolvimento

### Produção
- `docker-compose.prod.yml` - Compose para produção
- `frontend/Dockerfile` - Dockerfile do frontend para produção (multi-stage build)
- `backend/Dockerfile` - Dockerfile do backend para produção (multi-stage build)

## 🚀 Desenvolvimento

### Características
- **Hot Reload**: Mudanças no código são refletidas automaticamente
- **Volumes montados**: Código fonte montado como volume para edição em tempo real
- **Cache otimizado**: Volumes nomeados para cache de dependências

### Como usar

```bash
# Iniciar serviços de desenvolvimento
docker-compose -f docker-compose.dev.yml up --build

# Iniciar em background
docker-compose -f docker-compose.dev.yml up -d --build

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Parar serviços
docker-compose -f docker-compose.dev.yml down

# Reconstruir apenas um serviço
docker-compose -f docker-compose.dev.yml up --build backend
```

### Acessos
- **Frontend**: http://localhost:3000 (Vite dev server)
- **Backend**: http://localhost:7000

### Hot Reload

#### Frontend
O Vite já possui hot reload nativo. Qualquer mudança nos arquivos `.tsx`, `.ts`, `.css` será refletida automaticamente.

#### Backend
O backend usa [Air](https://github.com/cosmtrek/air) para hot reload. O arquivo `.air.toml` está configurado para:
- Recompilar automaticamente quando arquivos `.go` mudarem
- Reiniciar o servidor automaticamente
- Excluir arquivos de teste e diretórios desnecessários

## 🏭 Produção

### Características
- **Multi-stage builds**: Imagens otimizadas e menores
- **Nginx**: Servidor web otimizado para o frontend
- **Binário estático**: Backend compilado como binário único
- **Sem código fonte**: Apenas artefatos de build são incluídos

### Como usar

```bash
# Build e iniciar serviços de produção
docker-compose -f docker-compose.prod.yml up --build

# Build e iniciar em background
docker-compose -f docker-compose.prod.yml up -d --build

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Parar serviços
docker-compose -f docker-compose.prod.yml down

# Reconstruir apenas um serviço
docker-compose -f docker-compose.prod.yml build backend
docker-compose -f docker-compose.prod.yml up -d backend
```

### Acessos
- **Frontend**: http://localhost:3000 (Nginx)
- **Backend**: http://localhost:7000

## ⚙️ Configuração do Kubeconfig

### Linux/Mac
```yaml
volumes:
  - ~/.kube/config:/root/.kube/config:ro
  - ~/.minikube:/home/SEU_USUARIO/.minikube:ro
```

### Windows (PowerShell)
```yaml
volumes:
  - C:/Users/SEU_USUARIO/.kube/config:/root/.kube/config:ro
  - C:/Users/SEU_USUARIO/.minikube:/home/SEU_USUARIO/.minikube:ro
```

### Windows (WSL)
```yaml
volumes:
  - ~/.kube/config:/root/.kube/config:ro
  - /home/SEU_USUARIO/.minikube:/home/SEU_USUARIO/.minikube:ro
```

**Importante**: Substitua `SEU_USUARIO` pelo seu nome de usuário real.

## 🔧 Comandos Úteis

### Limpar recursos Docker
```bash
# Remover containers parados
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.prod.yml down

# Remover volumes (cuidado: remove cache)
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.prod.yml down -v

# Limpar imagens não utilizadas
docker image prune -a
```

### Rebuild completo
```bash
# Desenvolvimento
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up

# Produção
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up
```

### Executar comandos dentro dos containers
```bash
# Frontend (desenvolvimento)
docker-compose -f docker-compose.dev.yml exec frontend npm install

# Backend (desenvolvimento)
docker-compose -f docker-compose.dev.yml exec backend go mod tidy

# Shell interativo
docker-compose -f docker-compose.dev.yml exec frontend sh
docker-compose -f docker-compose.dev.yml exec backend sh
```

## 📝 Variáveis de Ambiente

### Frontend
- `VITE_API_BASE_URL`: URL do backend (padrão: http://localhost:7000)
- `CHOKIDAR_USEPOLLING`: Necessário para hot reload no Docker (true)

### Backend
- `KUBECONFIG`: Caminho do arquivo kubeconfig (padrão: /root/.kube/config)

## 🐛 Troubleshooting

### Hot reload não funciona no frontend
1. Verifique se `CHOKIDAR_USEPOLLING=true` está definido
2. Certifique-se de que os volumes estão montados corretamente
3. Verifique os logs: `docker-compose -f docker-compose.dev.yml logs frontend`

### Hot reload não funciona no backend
1. Verifique se o Air está instalado (já incluído no Dockerfile.dev)
2. Verifique o arquivo `.air.toml`
3. Verifique os logs: `docker-compose -f docker-compose.dev.yml logs backend`

### Erro de conexão com Kubernetes
1. Verifique se o kubeconfig está montado corretamente
2. Verifique se os certificados do minikube estão montados
3. Tente usar `network_mode: host` (já configurado)

### Porta já em uso
```bash
# Verificar o que está usando a porta
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# Alterar porta no docker-compose
ports:
  - "3001:3000"  # Mapear porta 3001 do host para 3000 do container
```

## 📚 Referências

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Vite Documentation](https://vitejs.dev/)
- [Air (Hot Reload para Go)](https://github.com/cosmtrek/air)
- [Nginx Documentation](https://nginx.org/en/docs/)
