import axios from 'axios'

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
}
