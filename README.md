# Kubernetes Manager

Interface web moderna para gerenciamento de clusters Kubernetes, facilitando operações para usuários sem conhecimento avançado em Kubernetes.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [API Endpoints](#api-endpoints)
- [Desenvolvimento Local](#desenvolvimento-local)
- [Configuração do Kubernetes](#configuração-do-kubernetes)
- [Troubleshooting](#troubleshooting)

## 🎯 Sobre o Projeto

O Kubernetes Manager é uma aplicação web full-stack que fornece uma interface gráfica intuitiva para gerenciar recursos em clusters Kubernetes. O projeto foi desenvolvido para simplificar operações comuns do Kubernetes, permitindo que usuários realizem tarefas complexas através de uma interface amigável.

## ✨ Funcionalidades

### Visualização e Listagem

- **Pods**: Visualize todos os pods de um namespace com informações detalhadas:
  - Nome, namespace, status, IP, node e imagem
  - Busca por nome ou imagem
  - Filtro por namespace
  - Indicadores visuais de status (Running, Pending, Failed, etc.)

- **Deployments**: Gerencie deployments do cluster:
  - Visualização de nome, namespace, status, réplicas, porta e imagem
  - Status de readiness (Ready, NotReady)
  - Busca e filtros

- **Services**: Monitore serviços Kubernetes:
  - Informações de tipo (ClusterIP, NodePort, LoadBalancer, etc.)
  - Portas (port, targetPort)
  - IPs (ClusterIP, ExternalIP, LoadBalancerIP)
  - Busca e filtros

- **Namespaces**: Listagem de todos os namespaces disponíveis no cluster

### Criação de Recursos

- **Pods**: Crie pods individuais especificando:
  - Namespace, nome e imagem Docker

- **Deployments**: Crie deployments com:
  - Namespace, nome, imagem Docker
  - Número de réplicas
  - Porta do container
  - Variáveis de ambiente (ENV) opcionais

- **Services**: Crie serviços Kubernetes:
  - Tipos: ClusterIP, NodePort, LoadBalancer, ExternalName
  - Configuração de portas (port e targetPort)
  - Seletores automáticos

- **Secrets**: Crie secrets com:
  - Tipo de secret (padrão: Opaque)
  - Dados em formato key-value

- **Ingress**: Configure ingress rules:
  - Host, nome do service e porta do service

- **Namespaces**: Crie novos namespaces no cluster

- **Aplicações Completas**: Crie uma aplicação completa de uma vez:
  - Deployment + Service em uma única operação
  - Configuração de réplicas, portas e variáveis de ambiente
  - Ideal para deploy rápido de aplicações

### Exclusão de Recursos

- Deletar pods
- Deletar deployments
- Deletar services
- Deletar secrets
- Confirmação antes de deletar recursos

### Interface do Usuário

- **Design Moderno**: Interface responsiva com Tailwind CSS
- **Dark Mode**: Suporte a tema claro e escuro
- **Navegação Intuitiva**: Sidebar com acesso rápido às funcionalidades
- **Feedback Visual**: Indicadores de status, loading states e mensagens de erro/sucesso
- **Busca e Filtros**: Busca em tempo real nos recursos listados
- **Atualização Manual**: Botão de refresh para atualizar listas

## 🛠 Tecnologias

### Backend
- **Go 1.25.3**: Linguagem de programação
- **Kubernetes Client Go**: Biblioteca oficial para interação com Kubernetes API
- **HTTP Server Nativo**: Servidor HTTP padrão do Go
- **CORS**: Middleware para permitir requisições do frontend

### Frontend
- **React 18.2**: Biblioteca JavaScript para interfaces
- **TypeScript**: Tipagem estática
- **Vite**: Build tool e dev server
- **React Router**: Roteamento de páginas
- **Axios**: Cliente HTTP para comunicação com API
- **Tailwind CSS**: Framework CSS utilitário
- **Dark Mode**: Sistema de temas

### DevOps
- **Docker**: Containerização
- **Docker Compose**: Orquestração de containers
- **Nginx**: Servidor web para produção (frontend)

## 📁 Estrutura do Projeto

```
k8s-manager/
├── backend/                 # API em Go
│   ├── http/               # Handlers HTTP e rotas
│   │   └── request.go      # Definição de rotas e handlers
│   ├── k8s/                # Lógica de interação com Kubernetes
│   │   ├── client.go       # Cliente Kubernetes
│   │   ├── list.go         # Funções de listagem
│   │   ├── create.go       # Funções de criação
│   │   └── delete.go       # Funções de exclusão
│   ├── main.go             # Ponto de entrada da aplicação
│   ├── Dockerfile          # Dockerfile de produção
│   ├── go.mod              # Dependências Go
│   └── go.sum              # Checksums das dependências
│
├── frontend/               # Interface web em React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   │   ├── Layout.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── contexts/      # Contextos React
│   │   │   └── ThemeContext.tsx
│   │   ├── pages/         # Páginas da aplicação
│   │   │   ├── Home.tsx
│   │   │   ├── Pods.tsx
│   │   │   ├── Create.tsx
│   │   │   └── CreateApplication.tsx
│   │   ├── services/      # Serviços de API
│   │   │   └── k8s.ts
│   │   ├── App.tsx        # Componente principal
│   │   └── main.tsx       # Ponto de entrada
│   ├── Dockerfile          # Dockerfile de produção
│   ├── nginx.conf          # Configuração do Nginx
│   ├── package.json        # Dependências Node.js
│   └── vite.config.ts      # Configuração do Vite
│
├── devops/                 # Scripts e automação
│   └── ansible/            # Playbooks Ansible
│
├── docker-compose.yml      # Configuração Docker Compose
├── README.md               # Este arquivo
└── .gitignore             # Arquivos ignorados pelo Git
```

## 📋 Pré-requisitos

- **Docker** e **Docker Compose** instalados
- Acesso a um cluster Kubernetes (local ou remoto)
- **kubeconfig** configurado e acessível
- Para desenvolvimento local:
  - Go 1.25.3 ou superior
  - Node.js 20 ou superior
  - npm ou yarn

### Localização do kubeconfig

- **Linux/Mac**: `~/.kube/config`
- **Windows**: `%USERPROFILE%\.kube\config` ou `C:/Users/SEU_USUARIO/.kube/config`

## 🚀 Instalação e Execução

### Executando com Docker Compose

1. **Clone o repositório**:
   ```bash
   git clone <url-do-repositorio>
   cd k8s-manager
   ```

2. **Configure o kubeconfig no docker-compose.yml**:
   
   Para **Linux/Mac**:
   ```yaml
   volumes:
     - ~/.kube/config:/root/.kube/config:ro
     - ~/.minikube:/home/SEU_USUARIO/.minikube:ro
   ```
   
   Para **Windows** (PowerShell):
   ```yaml
   volumes:
     - C:/Users/SEU_USUARIO/.kube/config:/root/.kube/config:ro
     - C:/Users/SEU_USUARIO/.minikube:/home/SEU_USUARIO/.minikube:ro
   ```
   
   **Importante**: Substitua `SEU_USUARIO` pelo seu nome de usuário real.

3. **Inicie os serviços**:
   ```bash
   docker-compose up --build
   ```

4. **Acesse a aplicação**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:7000

### Comandos Úteis

```bash
# Parar os serviços
docker-compose down

# Ver logs
docker-compose logs -f

# Ver logs apenas do backend
docker-compose logs -f backend

# Ver logs apenas do frontend
docker-compose logs -f frontend

# Reconstruir as imagens
docker-compose build --no-cache

# Executar em background
docker-compose up -d
```

## 🔌 API Endpoints

### Listagem

- `GET /listAllNs` - Lista todos os namespaces
- `GET /listAllPods/{namespace}` - Lista pods de um namespace
- `GET /listAllDeployments/{namespace}` - Lista deployments de um namespace
- `GET /listAllServices/{namespace}` - Lista services de um namespace

### Criação

- `POST /createResource` - Cria um recurso (pod, deployment, secret, ingress, namespace, service)
- `POST /createApplication` - Cria uma aplicação completa (deployment + service)

### Exclusão

- `POST /deletePod` - Deleta um pod
- `POST /deleteDeployment` - Deleta um deployment
- `POST /deleteService` - Deleta um service
- `POST /deleteSecret` - Deleta um secret

### Exemplo de Requisição

**Criar um Pod**:
```json
POST /createResource
{
  "kind": "container",
  "namespace": "default",
  "name": "meu-pod",
  "image": "nginx:latest"
}
```

**Criar uma Aplicação**:
```json
POST /createApplication
{
  "namespace": "default",
  "name": "minha-app",
  "image": "nginx:latest",
  "replicas": 3,
  "containerPort": 80,
  "serviceType": "ClusterIP",
  "servicePort": 80,
  "targetPort": 80,
  "env": {
    "ENV_VAR": "valor"
  }
}
```

## 💻 Desenvolvimento Local

### Backend

```bash
cd backend
go mod download
go run main.go
```

O servidor estará disponível em `http://localhost:7000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173` (porta padrão do Vite).

**Configuração do Frontend**:

Crie um arquivo `.env` na pasta `frontend`:

```env
VITE_API_BASE_URL=http://localhost:7000
```

## ⚙️ Configuração do Kubernetes

### Acesso ao Cluster

O backend precisa ter acesso ao cluster Kubernetes através do kubeconfig. O arquivo é montado como volume read-only no container por segurança.

### Network Mode

Para acessar clusters locais (como Minikube), o `docker-compose.yml` usa `network_mode: host` no backend. Isso permite que o container acesse a rede do host diretamente.

### Certificados Minikube

Se estiver usando Minikube, é necessário montar o diretório de certificados:

```yaml
volumes:
  - ~/.minikube:/home/SEU_USUARIO/.minikube:ro
```

## 🐛 Troubleshooting

### Erro de Conexão com Kubernetes

1. Verifique se o kubeconfig está montado corretamente
2. Verifique se os certificados do minikube estão montados (se aplicável)
3. Confirme que o `network_mode: host` está configurado no docker-compose.yml
4. Teste o acesso ao cluster: `kubectl get nodes`

### Porta Já em Uso

```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :7000

# Linux/Mac
lsof -i :3000
lsof -i :7000
```

Altere as portas no `docker-compose.yml` se necessário.

### Frontend Não Consegue Conectar ao Backend

1. Verifique se `VITE_API_BASE_URL` está configurado corretamente
2. Verifique se o backend está rodando
3. Verifique os logs do backend: `docker-compose logs backend`
4. Teste a API diretamente: `curl http://localhost:7000/listAllNs`

### Erro ao Criar Recursos

1. Verifique as permissões do kubeconfig (o usuário precisa ter permissões para criar recursos)
2. Verifique os logs do backend para mensagens de erro detalhadas
3. Confirme que o namespace existe (ou use um namespace válido)

### Problemas com Minikube

1. Certifique-se de que o Minikube está rodando: `minikube status`
2. Verifique o caminho dos certificados no docker-compose.yml
3. Se usar WSL, use caminhos absolutos: `/home/SEU_USUARIO/.minikube`

## 📝 Notas Importantes

- O volume do kubeconfig é montado como **read-only** (`:ro`) por segurança
- A comunicação entre frontend e backend acontece através da rede Docker
- O backend usa `network_mode: host` para acessar clusters locais
- Todos os recursos criados seguem as convenções padrão do Kubernetes
- O projeto suporta múltiplos namespaces e permite alternar entre eles facilmente

## 🔒 Segurança

- O kubeconfig é montado como read-only
- CORS está configurado para permitir requisições do frontend
- Validação de entrada em todos os endpoints
- Tratamento de erros adequado em todas as operações

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

**Desenvolvido com ❤️ para simplificar o gerenciamento de Kubernetes**
