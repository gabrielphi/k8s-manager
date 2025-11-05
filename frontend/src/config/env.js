// Configurações de ambiente para o frontend
const config = {
  // URL base da API
  API_BASE_URL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:7000',
  
  // Timeout para requisições
  API_TIMEOUT: parseInt(process.env.VUE_APP_API_TIMEOUT) || 30000,
  
  // Ambiente atual
  ENVIRONMENT: process.env.VUE_APP_ENVIRONMENT || 'development',
  
  // Endpoints da API
  ENDPOINTS: {
    NAMESPACES: process.env.VUE_APP_API_ENDPOINTS_NAMESPACES || '/listAllNs',
    PODS: process.env.VUE_APP_API_ENDPOINTS_PODS || '/listAllPods',
    CREATE_POD: process.env.VUE_APP_API_ENDPOINTS_CREATE_POD || '/createPod',
    CREATE_RESOURCE: process.env.VUE_APP_API_ENDPOINTS_CREATE_RESOURCE || '/createResource',
    DELETE_POD: process.env.VUE_APP_API_ENDPOINTS_DELETE_POD || '/deletePod'
  }
}

// Debug: Log das configurações em desenvolvimento
if (config.ENVIRONMENT === 'development') {
  console.log('🔧 Configurações carregadas:', {
    API_BASE_URL: config.API_BASE_URL,
    ENDPOINTS: config.ENDPOINTS
  })
}

// Função para construir URL completa
export const buildApiUrl = (endpoint) => {
  const fullUrl = `${config.API_BASE_URL}${endpoint}`
  
  // Debug: Log da URL construída em desenvolvimento
  if (config.ENVIRONMENT === 'development') {
    console.log(`🌐 Construindo URL: ${config.API_BASE_URL} + ${endpoint} = ${fullUrl}`)
  }
  
  return fullUrl
}

// Função para obter configuração
export const getConfig = () => {
  return config
}

// Exportar config como named export
export { config }

export default config
