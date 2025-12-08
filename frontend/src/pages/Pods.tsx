import { useState, useEffect } from 'react'
import { k8sService, PodInfo, DeploymentInfo, ServiceInfo } from '../services/k8s'

type ViewType = 'pods' | 'deployments' | 'services'

function Pods() {
  const [namespaces, setNamespaces] = useState<string[]>([])
  const [selectedNamespace, setSelectedNamespace] = useState<string>('')
  const [viewType, setViewType] = useState<ViewType>('pods')
  const [pods, setPods] = useState<PodInfo[]>([])
  const [deployments, setDeployments] = useState<DeploymentInfo[]>([])
  const [services, setServices] = useState<ServiceInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedDeployment, setSelectedDeployment] = useState<{ name: string; namespace: string; image: string; replicas: number } | null>(null)
  const [updateImage, setUpdateImage] = useState<string>('')
  const [updateReplicas, setUpdateReplicas] = useState<number>(1)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null)
  const [confirmMessage, setConfirmMessage] = useState<string>('')

  useEffect(() => {
    loadNamespaces()
  }, [])

  useEffect(() => {
    if (selectedNamespace) {
      if (viewType === 'pods') {
        loadPods(selectedNamespace)
      } else if (viewType === 'deployments') {
        loadDeployments(selectedNamespace)
      } else if (viewType === 'services') {
        loadServices(selectedNamespace)
      }
    } else {
      setPods([])
      setDeployments([])
      setServices([])
    }
  }, [selectedNamespace, viewType])

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

  const loadDeployments = async (namespace: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await k8sService.listDeployments(namespace)
      // Verifica se data é válido antes de usar
      if (Array.isArray(data)) {
        setDeployments(data)
      } else {
        setDeployments([])
        setError('Erro ao carregar deployments. Resposta inválida do servidor.')
      }
    } catch (err) {
      setError('Erro ao carregar deployments. Verifique se o backend está rodando.')
      console.error(err)
      setDeployments([])
    } finally {
      setLoading(false)
    }
  }

  const loadServices = async (namespace: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await k8sService.listServices(namespace)
      // Verifica se data é válido antes de usar
      if (Array.isArray(data)) {
        setServices(data)
      } else {
        setServices([])
        setError('Erro ao carregar services. Resposta inválida do servidor.')
      }
    } catch (err) {
      setError('Erro ao carregar services. Verifique se o backend está rodando.')
      console.error(err)
      setServices([])
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
    setConfirmMessage(`Tem certeza que deseja deletar o pod "${name}" no namespace "${namespace}"?`)
    setConfirmAction(async () => {
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
        setShowConfirmModal(false)
        setConfirmAction(null)
      }
    })
    setShowConfirmModal(true)
  }

  const handleDeleteDeployment = async (name: string, namespace: string) => {
    setConfirmMessage(`Tem certeza que deseja deletar o deployment "${name}" no namespace "${namespace}"?`)
    setConfirmAction(async () => {
      try {
        setLoading(true)
        setError(null)
        await k8sService.deleteDeployment(name, namespace)
        // Recarrega a lista de deployments após deletar
        await loadDeployments(namespace)
      } catch (err: any) {
        setError(err.message || 'Erro ao deletar deployment')
        console.error(err)
      } finally {
        setLoading(false)
        setShowConfirmModal(false)
        setConfirmAction(null)
      }
    })
    setShowConfirmModal(true)
  }

  const handleDeleteService = async (name: string, namespace: string) => {
    setConfirmMessage(`Tem certeza que deseja deletar o service "${name}" no namespace "${namespace}"?`)
    setConfirmAction(async () => {
      try {
        setLoading(true)
        setError(null)
        await k8sService.deleteService(name, namespace)
        // Recarrega a lista de services após deletar
        await loadServices(namespace)
      } catch (err: any) {
        setError(err.message || 'Erro ao deletar service')
        console.error(err)
      } finally {
        setLoading(false)
        setShowConfirmModal(false)
        setConfirmAction(null)
      }
    })
    setShowConfirmModal(true)
  }

  const handleOpenUpdateModal = (deployment: DeploymentInfo) => {
    setSelectedDeployment({
      name: deployment.nome,
      namespace: deployment.namespace,
      image: deployment.image,
      replicas: deployment.replicas,
    })
    setUpdateImage(deployment.image)
    setUpdateReplicas(deployment.replicas)
    setShowUpdateModal(true)
  }

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false)
    setSelectedDeployment(null)
    setUpdateImage('')
    setUpdateReplicas(1)
  }

  const handleUpdateDeployment = async () => {
    if (!selectedDeployment) return

    if (!updateImage.trim() && (!updateReplicas || updateReplicas < 1)) {
      setError('Preencha pelo menos a imagem ou o número de réplicas')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const updateData: { namespace: string; name: string; image?: string; replicas?: number } = {
        namespace: selectedDeployment.namespace,
        name: selectedDeployment.name,
      }

      if (updateImage.trim()) {
        updateData.image = updateImage.trim()
      }

      if (updateReplicas && updateReplicas > 0) {
        updateData.replicas = updateReplicas
      }

      await k8sService.updateDeployment(updateData)
      handleCloseUpdateModal()
      // Recarrega a lista de deployments após atualizar
      await loadDeployments(selectedDeployment.namespace)
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar deployment')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (confirmAction) {
      await confirmAction()
    }
  }

  const handleCancelConfirm = () => {
    setShowConfirmModal(false)
    setConfirmAction(null)
    setConfirmMessage('')
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

  // Filtra os deployments baseado no termo de busca (nome ou imagem)
  const filteredDeployments = deployments.filter((deployment) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      deployment.nome.toLowerCase().includes(searchLower) ||
      deployment.image.toLowerCase().includes(searchLower)
    )
  })

  // Filtra os services baseado no termo de busca (nome ou tipo)
  const filteredServices = services.filter((service) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      service.nome.toLowerCase().includes(searchLower) ||
      service.type.toLowerCase().includes(searchLower)
    )
  })

  const handleRefresh = async () => {
    if (selectedNamespace) {
      if (viewType === 'pods') {
        await loadPods(selectedNamespace)
      } else if (viewType === 'deployments') {
        await loadDeployments(selectedNamespace)
      } else if (viewType === 'services') {
        await loadServices(selectedNamespace)
      }
    } else {
      await loadNamespaces()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Listar Recursos</h1>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={() => setViewType('pods')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewType === 'pods'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Pods
            </button>
            <button
              onClick={() => setViewType('deployments')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewType === 'deployments'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Deployments
            </button>
            <button
              onClick={() => setViewType('services')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewType === 'services'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Services
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="namespace-select"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Namespace
              </label>
              <select
                id="namespace-select"
                value={selectedNamespace}
                onChange={(e) => setSelectedNamespace(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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

            <div>
              <label
                htmlFor="search-input"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Buscar {viewType === 'pods' ? 'Pod' : viewType === 'deployments' ? 'Deployment' : 'Service'}
              </label>
              <div className="relative">
                <input
                  id="search-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome ou imagem..."
                  className="w-full px-4 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  disabled={loading}
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 dark:text-slate-500"
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
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Carregando...</p>
          </div>
        )}

        {!loading && selectedNamespace && viewType === 'pods' && pods.length === 0 && !error && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Nenhum pod encontrado no namespace <strong>{selectedNamespace}</strong>
            </p>
          </div>
        )}

        {!loading && selectedNamespace && viewType === 'deployments' && deployments.length === 0 && !error && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Nenhum deployment encontrado no namespace <strong>{selectedNamespace}</strong>
            </p>
          </div>
        )}

        {!loading && selectedNamespace && viewType === 'services' && services.length === 0 && !error && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Nenhum service encontrado no namespace <strong>{selectedNamespace}</strong>
            </p>
          </div>
        )}

        {!loading && viewType === 'pods' && pods.length > 0 && filteredPods.length === 0 && searchTerm && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Nenhum pod encontrado com o termo de busca <strong>"{searchTerm}"</strong>
            </p>
          </div>
        )}

        {!loading && viewType === 'deployments' && deployments.length > 0 && filteredDeployments.length === 0 && searchTerm && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Nenhum deployment encontrado com o termo de busca <strong>"{searchTerm}"</strong>
            </p>
          </div>
        )}

        {!loading && viewType === 'services' && services.length > 0 && filteredServices.length === 0 && searchTerm && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Nenhum service encontrado com o termo de busca <strong>"{searchTerm}"</strong>
            </p>
          </div>
        )}

        {!loading && viewType === 'pods' && filteredPods.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Namespace
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Node
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredPods.map((pod) => (
                    <tr key={`${pod.namespace}-${pod.nome}`} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {pod.nome}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500 dark:text-slate-400">{pod.namespace}</div>
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
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">
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

        {!loading && viewType === 'deployments' && filteredDeployments.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Namespace
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Replicas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Porta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredDeployments.map((deployment) => (
                    <tr key={`${deployment.namespace}-${deployment.nome}`} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {deployment.nome}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500 dark:text-slate-400">{deployment.namespace}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            deployment.status
                          )}`}
                        >
                          {deployment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {deployment.replicas}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                          {deployment.containerPort || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-mono truncate max-w-xs">
                          {deployment.image}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenUpdateModal(deployment)}
                            disabled={loading}
                            className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Atualizar
                          </button>
                          <button
                            onClick={() => handleDeleteDeployment(deployment.nome, deployment.namespace)}
                            disabled={loading}
                            className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Deletar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && viewType === 'services' && filteredServices.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Namespace
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Porta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Target Port
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Cluster IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      External IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Load Balancer IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredServices.map((service) => (
                    <tr key={`${service.namespace}-${service.nome}`} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {service.nome}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500 dark:text-slate-400">{service.namespace}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {service.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                          {service.port || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                          {service.targetPort || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                          {service.clusterIP || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                          {service.externalIP || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                          {service.loadBalancerIP || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteService(service.nome, service.namespace)}
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

        {/* Modal de Confirmação */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Confirmar Ação
                  </h2>
                </div>
              </div>
              
              <p className="text-slate-700 dark:text-slate-300 mb-6">
                {confirmMessage}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processando...' : 'Confirmar'}
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-md hover:bg-slate-400 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Atualização de Deployment */}
        {showUpdateModal && selectedDeployment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Atualizar Deployment: {selectedDeployment.name}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="update-image"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Imagem
                  </label>
                  <input
                    id="update-image"
                    type="text"
                    value={updateImage}
                    onChange={(e) => setUpdateImage(e.target.value)}
                    placeholder="ex: nginx:latest"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="update-replicas"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Réplicas
                  </label>
                  <input
                    id="update-replicas"
                    type="number"
                    min="1"
                    value={updateReplicas}
                    onChange={(e) => setUpdateReplicas(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdateDeployment}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Atualizando...' : 'Atualizar'}
                </button>
                <button
                  onClick={handleCloseUpdateModal}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-md hover:bg-slate-400 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

export default Pods
