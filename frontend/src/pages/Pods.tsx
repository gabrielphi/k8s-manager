import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { k8sService, PodInfo } from '../services/k8s'

function Pods() {
  const [namespaces, setNamespaces] = useState<string[]>([])
  const [selectedNamespace, setSelectedNamespace] = useState<string>('')
  const [pods, setPods] = useState<PodInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      setNamespaces(data)
      if (data.length > 0 && !selectedNamespace) {
        setSelectedNamespace(data[0])
      }
    } catch (err) {
      setError('Erro ao carregar namespaces. Verifique se o backend está rodando.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadPods = async (namespace: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await k8sService.listPods(namespace)
      setPods(data)
    } catch (err) {
      setError('Erro ao carregar pods. Verifique se o backend está rodando.')
      console.error(err)
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
            <h1 className="text-3xl font-bold text-slate-900">Pods</h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
            className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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

        {!loading && pods.length > 0 && (
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {pods.map((pod) => (
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
