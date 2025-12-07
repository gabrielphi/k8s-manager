import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { k8sService, PodInfo } from '../services/k8s'

function Pods() {
  const [namespaces, setNamespaces] = useState<string[]>([])
  const [selectedNamespace, setSelectedNamespace] = useState<string>('')
  const [pods, setPods] = useState<PodInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')

  useEffect(() => {
    loadNamespaces()
  }, [])

  useEffect(() => {
    if (selectedNamespace) {
      loadPods(selectedNamespace)
    } else {
      setPods([])
    }
  }, [selectedNamespace])

  const loadNamespaces = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await k8sService.listNamespaces()
      // Verifica se data é válido antes de usar
      if (Array.isArray(data)) {
        setNamespaces(data)
        if (data.length > 0 && !selectedNamespace) {
          setSelectedNamespace(data[0])
        }
      } else {
        setNamespaces([])
        setError('Erro ao carregar namespaces. Resposta inválida do servidor.')
      }
    } catch (err) {
      setError('Erro ao carregar namespaces. Verifique se o backend está rodando.')
      console.error(err)
      setNamespaces([])
    } finally {
      setLoading(false)
    }
  }

  const loadPods = async (namespace: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await k8sService.listPods(namespace)
      // Verifica se data é válido antes de usar
      if (Array.isArray(data)) {
        setPods(data)
      } else {
        setPods([])
        setError('Erro ao carregar pods. Resposta inválida do servidor.')
      }
    } catch (err) {
      setError('Erro ao carregar pods. Verifique se o backend está rodando.')
      console.error(err)
      setPods([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDeletePod = async (name: string, namespace: string) => {
    if (!confirm(`Tem certeza que deseja deletar o pod "${name}" no namespace "${namespace}"?`)) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      await k8sService.deletePod(name, namespace)
      // Recarrega a lista de pods após deletar
      await loadPods(namespace)
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar pod')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Filtra os pods baseado no termo de busca (nome ou imagem)
  const filteredPods = pods.filter((pod) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      pod.nome.toLowerCase().includes(searchLower) ||
      pod.image.toLowerCase().includes(searchLower)
    )
  })

  const handleRefresh = async () => {
    if (selectedNamespace) {
      await loadPods(selectedNamespace)
    } else {
      await loadNamespaces()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 font-medium mb-2 inline-block"
            >
              ← Voltar para Home
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">Pods</h1>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Atualizar lista"
              >
                <svg
                  className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <label
              htmlFor="namespace-select"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Namespace
            </label>
            <select
              id="namespace-select"
              value={selectedNamespace}
              onChange={(e) => setSelectedNamespace(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={loading}
            >
              <option value="">Selecione um namespace</option>
              {namespaces.map((ns) => (
                <option key={ns} value={ns}>
                  {ns}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <label
              htmlFor="search-input"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Buscar Pod
            </label>
            <div className="relative">
              <input
                id="search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou imagem..."
                className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={loading}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Carregando...</p>
          </div>
        )}

        {!loading && selectedNamespace && pods.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-slate-600 text-lg">
              Nenhum pod encontrado no namespace <strong>{selectedNamespace}</strong>
            </p>
          </div>
        )}

        {!loading && pods.length > 0 && filteredPods.length === 0 && searchTerm && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-slate-600 text-lg">
              Nenhum pod encontrado com o termo de busca <strong>"{searchTerm}"</strong>
            </p>
          </div>
        )}

        {!loading && filteredPods.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Namespace
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Node
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredPods.map((pod) => (
                    <tr key={`${pod.namespace}-${pod.nome}`} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {pod.nome}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500">{pod.namespace}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            pod.status
                          )}`}
                        >
                          {pod.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500 font-mono">
                          {pod.ip || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500">{pod.node || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-500 font-mono truncate max-w-xs">
                          {pod.image}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeletePod(pod.nome, pod.namespace)}
                          disabled={loading}
                          className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Pods
