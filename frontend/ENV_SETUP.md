# Configuração de Variáveis de Ambiente

Este documento explica como configurar e usar as variáveis de ambiente no frontend do K8s Manager.

## Arquivos de Configuração

### 1. Arquivo de Configuração Principal
- **Localização**: `src/config/env.js`
- **Função**: Centraliza todas as configurações de ambiente e fornece funções utilitárias

### 2. Arquivo de Exemplo
- **Localização**: `env.template`
- **Função**: Template com todas as variáveis disponíveis

## Variáveis de Ambiente Disponíveis

### Configurações Básicas
```bash
VUE_APP_API_BASE_URL=http://localhost:7000          # URL base da API
VUE_APP_API_TIMEOUT=30000                          # Timeout das requisições (ms)
VUE_APP_ENVIRONMENT=development                    # Ambiente atual
```

### Endpoints da API
```bash
VUE_APP_API_ENDPOINTS_NAMESPACES=/listAllNs        # Endpoint para listar namespaces
VUE_APP_API_ENDPOINTS_PODS=/listAllPods            # Endpoint para listar pods
VUE_APP_API_ENDPOINTS_CREATE_POD=/createPod        # Endpoint para criar pods
VUE_APP_API_ENDPOINTS_DELETE_POD=/deletePod        # Endpoint para deletar pods
```

## Como Usar

### 1. Configurar Ambiente de Desenvolvimento
1. Copie o arquivo `env.template` para `.env`:
   ```bash
   cp env.template .env
   ```

2. Edite o arquivo `.env` com suas configurações:
   ```bash
   VUE_APP_API_BASE_URL=http://localhost:7000
   ```

### 2. Configurar Ambiente de Produção
1. Crie um arquivo `.env.production`:
   ```bash
   VUE_APP_API_BASE_URL=https://api.seudominio.com
   VUE_APP_ENVIRONMENT=production
   ```

### 3. Usar no Código
```javascript
import { buildApiUrl, config } from '@/config/env.js'

// Construir URL completa
const url = buildApiUrl(config.ENDPOINTS.NAMESPACES)

// Usar configuração diretamente
const timeout = config.API_TIMEOUT
```

## Ambientes Suportados

### Desenvolvimento
- **Arquivo**: `.env`
- **URL padrão**: `http://localhost:7000`

### Produção
- **Arquivo**: `.env.production`
- **URL**: Configurar conforme necessário

### Teste
- **Arquivo**: `.env.test`
- **URL**: Pode apontar para um ambiente de teste

## Exemplos de Configuração

### Desenvolvimento Local
```bash
VUE_APP_API_BASE_URL=http://localhost:7000
VUE_APP_ENVIRONMENT=development
```

### Ambiente de Homologação
```bash
VUE_APP_API_BASE_URL=https://api-homolog.seudominio.com
VUE_APP_ENVIRONMENT=staging
```

### Ambiente de Produção
```bash
VUE_APP_API_BASE_URL=https://api.seudominio.com
VUE_APP_ENVIRONMENT=production
```

## Vantagens

1. **Flexibilidade**: Fácil mudança entre ambientes
2. **Segurança**: Configurações sensíveis não ficam no código
3. **Manutenibilidade**: Centralização das configurações
4. **Escalabilidade**: Suporte a múltiplos ambientes

## Notas Importantes

- Todas as variáveis de ambiente devem começar com `VUE_APP_`
- O arquivo `.env` não deve ser commitado no repositório
- Use `.env.example` como template para outros desenvolvedores
- Reinicie o servidor de desenvolvimento após alterar variáveis de ambiente
