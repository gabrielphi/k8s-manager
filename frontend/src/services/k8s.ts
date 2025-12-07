import axios from 'axios'

// Usa a URL do backend definida nas variáveis de ambiente
// Com network_mode: host no Docker, localhost:7000 funciona do navegador
// Em desenvolvimento local, também funciona diretamente
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface PodInfo {
  nome: string
  namespace: string
  status: string
  ip: string
  node: string
  image: string
}

export interface DeploymentInfo {
  nome: string
  namespace: string
  status: string
  image: string
  replicas: number
  containerPort: number
  selector: Record<string, string>
}

export interface CreateResourceRequest {
  kind: 'container' | 'pod' | 'deployment' | 'secret' | 'ingress' | 'namespace' | 'service'
  namespace?: string
  name: string
  image?: string
  replicas?: number
  containerPort?: number
  secretType?: string
  data?: Record<string, string>
  env?: Record<string, string>
  host?: string
  serviceName?: string
  servicePort?: number
  serviceType?: string
  port?: number
  targetPort?: number
}

export interface CreateApplicationRequest {
  namespace: string
  name: string
  image: string
  replicas: number
  containerPort: number
  serviceType: string
  servicePort: number
  targetPort: number
  env?: Record<string, string>
}

export interface CreateResourceResponse {
  status: string
  message: string
}

export const k8sService = {
  async listPods(namespace: string): Promise<PodInfo[]> {
    try {
      const response = await api.get<PodInfo[]>(`/listAllPods/${namespace}`)
      // Garante que sempre retorna um array, mesmo se response.data for null/undefined
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Erro ao listar pods:', error)
      // Retorna array vazio em caso de erro ao invés de lançar exceção
      return []
    }
  },

  async listNamespaces(): Promise<string[]> {
    try {
      const response = await api.get<string[]>('/listAllNs')
      // Garante que sempre retorna um array, mesmo se response.data for null/undefined
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Erro ao listar namespaces:', error)
      // Retorna array vazio em caso de erro ao invés de lançar exceção
      return []
    }
  },

  async createResource(data: CreateResourceRequest): Promise<CreateResourceResponse> {
    try {
      const response = await api.post<CreateResourceResponse>('/createResource', data)
      return response.data
    } catch (error: any) {
      console.error('Erro ao criar recurso:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao criar recurso'
      throw new Error(errorMessage)
    }
  },

  async deletePod(name: string, namespace: string): Promise<CreateResourceResponse> {
    try {
      const response = await api.post<CreateResourceResponse>('/deletePod', {
        name,
        namespace,
      })
      return response.data
    } catch (error: any) {
      console.error('Erro ao deletar pod:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao deletar pod'
      throw new Error(errorMessage)
    }
  },

  async deleteDeployment(name: string, namespace: string): Promise<CreateResourceResponse> {
    try {
      const response = await api.post<CreateResourceResponse>('/deleteDeployment', {
        name,
        namespace,
      })
      return response.data
    } catch (error: any) {
      console.error('Erro ao deletar deployment:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao deletar deployment'
      throw new Error(errorMessage)
    }
  },

  async listDeployments(namespace: string): Promise<DeploymentInfo[]> {
    try {
      const response = await api.get<DeploymentInfo[]>(`/listAllDeployments/${namespace}`)
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Erro ao listar deployments:', error)
      return []
    }
  },

  async createApplication(data: CreateApplicationRequest): Promise<CreateResourceResponse> {
    try {
      const response = await api.post<CreateResourceResponse>('/createApplication', data)
      return response.data
    } catch (error: any) {
      console.error('Erro ao criar aplicação:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao criar aplicação'
      throw new Error(errorMessage)
    }
  },
}
