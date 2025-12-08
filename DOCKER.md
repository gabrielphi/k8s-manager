# Guia de Uso do Docker

Este projeto utiliza Docker Compose para orquestração dos serviços.

## 📋 Estrutura de Arquivos

- `docker-compose.yml` - Configuração Docker Compose
- `frontend/Dockerfile` - Dockerfile do frontend (multi-stage build)
- `backend/Dockerfile` - Dockerfile do backend (multi-stage build)

## 🚀 Executando o Projeto

### Como usar

```bash
# Iniciar serviços
docker-compose up --build

# Iniciar em background
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Ver logs apenas do backend
docker-compose logs -f backend

# Ver logs apenas do frontend
docker-compose logs -f frontend

# Parar serviços
docker-compose down

# Reconstruir apenas um serviço
docker-compose up --build backend
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
docker-compose down

# Remover volumes (cuidado: remove cache)
docker-compose down -v

# Limpar imagens não utilizadas
docker image prune -a
```

### Rebuild completo
```bash
docker-compose build --no-cache
docker-compose up
```

### Executar comandos dentro dos containers
```bash
# Frontend
docker-compose exec frontend npm install

# Backend
docker-compose exec backend go mod tidy

# Shell interativo
docker-compose exec frontend sh
docker-compose exec backend sh
```

## 📝 Variáveis de Ambiente

### Frontend
- `VITE_API_BASE_URL`: URL do backend (padrão: http://localhost:7000)

### Backend
- `KUBECONFIG`: Caminho do arquivo kubeconfig (padrão: /root/.kube/config)

## 🐛 Troubleshooting

### Erro de conexão com Kubernetes
1. Verifique se o kubeconfig está montado corretamente
2. Verifique se os certificados do minikube estão montados
3. Tente usar `network_mode: host` (já configurado no docker-compose.yml)

### Porta já em uso
```bash
# Verificar o que está usando a porta
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# Alterar porta no docker-compose
ports:
  - "3001:3000"  # Mapear porta 3001 do host para 3000 do container
```

### Frontend não consegue conectar ao backend
1. Verifique se `VITE_API_BASE_URL` está configurado corretamente
2. Verifique se o backend está rodando
3. Verifique os logs do backend: `docker-compose logs backend`
4. Teste a API diretamente: `curl http://localhost:7000/listAllNs`

## 📚 Referências

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Vite Documentation](https://vitejs.dev/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Go Documentation](https://go.dev/doc/)
