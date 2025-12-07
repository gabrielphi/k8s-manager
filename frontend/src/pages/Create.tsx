import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { k8sService, CreateResourceRequest } from '../services/k8s'

type ResourceType = 'pod' | 'deployment' | 'secret' | 'ingress' | 'namespace' | 'service'

interface SecretData {
  key: string
  value: string
}

function Create() {
  const navigate = useNavigate()
  const [resourceType, setResourceType] = useState<ResourceType>('pod')
  const [namespaces, setNamespaces] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form states
  const [namespace, setNamespace] = useState('')
  const [name, setName] = useState('')
  const [image, setImage] = useState('')
  const [replicas, setReplicas] = useState<number>(1)
  const [containerPort, setContainerPort] = useState<number>(8080)
  const [secretType, setSecretType] = useState('Opaque')
  const [secretData, setSecretData] = useState<SecretData[]>([{ key: '', value: '' }])
  const [host, setHost] = useState('')
  const [serviceName, setServiceName] = useState('')
  const [servicePort, setServicePort] = useState<number>(80)
  const [serviceType, setServiceType] = useState('ClusterIP')
  const [port, setPort] = useState<number>(80)
  const [targetPort, setTargetPort] = useState<number>(8080)

  useEffect(() => {
    loadNamespaces()
  }, [])

  useEffect(() => {
    // Reset form when resource type changes
    setError(null)
    setSuccess(null)
    setNamespace('')
    setName('')
    setImage('')
    setReplicas(1)
    setContainerPort(8080)
    setSecretType('Opaque')
    setSecretData([{ key: '', value: '' }])
    setHost('')
    setServiceName('')
    setServicePort(80)
    setServiceType('ClusterIP')
    setPort(80)
    setTargetPort(8080)
  }, [resourceType])

  const loadNamespaces = async () => {
    try {
      const data = await k8sService.listNamespaces()
      if (Array.isArray(data)) {
        setNamespaces(data)
        if (data.length > 0 && resourceType !== 'namespace') {
          setNamespace(data[0])
        }
      }
    } catch (err) {
      console.error('Erro ao carregar namespaces:', err)
    }
  }

  const handleSecretDataChange = (index: number, field: 'key' | 'value', value: string) => {
    const newData = [...secretData]
    newData[index][field] = value
    setSecretData(newData)
  }

  const addSecretDataRow = () => {
    setSecretData([...secretData, { key: '', value: '' }])
  }

  const removeSecretDataRow = (index: number) => {
    if (secretData.length > 1) {
      setSecretData(secretData.filter((_, i) => i !== index))
    }
  }

  const validateForm = (): boolean => {
    setError(null)

    if (resourceType === 'namespace') {
      if (!name.trim()) {
        setError('Nome do namespace é obrigatório')
        return false
      }
      return true
    }

    if (!namespace.trim()) {
      setError('Namespace é obrigatório')
      return false
    }

    if (!name.trim()) {
      setError('Nome é obrigatório')
      return false
    }

    if (resourceType === 'pod' && !image.trim()) {
      setError('Imagem é obrigatória para Pod')
      return false
    }

    if (resourceType === 'deployment') {
      if (!image.trim()) {
        setError('Imagem é obrigatória para Deployment')
        return false
      }
      if (replicas < 1) {
        setError('Número de réplicas deve ser maior que 0')
        return false
      }
    }

    if (resourceType === 'secret') {
      const hasEmptyRows = secretData.some((item) => !item.key.trim() || !item.value.trim())
      if (hasEmptyRows) {
        setError('Todos os campos de dados do Secret devem ser preenchidos')
        return false
      }
    }

    if (resourceType === 'ingress') {
      if (!host.trim()) {
        setError('Host é obrigatório para Ingress')
        return false
      }
      if (!serviceName.trim()) {
        setError('Nome do Service é obrigatório para Ingress')
        return false
      }
      if (servicePort < 1 || servicePort > 65535) {
        setError('Porta do Service deve estar entre 1 e 65535')
        return false
      }
    }

    if (resourceType === 'service') {
      if (!serviceType.trim()) {
        setError('Tipo de Service é obrigatório')
        return false
      }
      if (port < 1 || port > 65535) {
        setError('Porta do Service deve estar entre 1 e 65535')
        return false
      }
      if (targetPort < 1 || targetPort > 65535) {
        setError('Porta de destino (Target Port) deve estar entre 1 e 65535')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const request: CreateResourceRequest = {
        kind: resourceType === 'pod' ? 'container' : resourceType,
        name: name.trim(),
      }

      if (resourceType !== 'namespace') {
        request.namespace = namespace.trim()
      }

      if (resourceType === 'pod' || resourceType === 'deployment') {
        request.image = image.trim()
      }

      if (resourceType === 'deployment') {
        request.replicas = replicas
        if (containerPort > 0) {
          request.containerPort = containerPort
        }
      }

      if (resourceType === 'secret') {
        request.secretType = secretType
        const dataMap: Record<string, string> = {}
        secretData.forEach((item) => {
          if (item.key.trim() && item.value.trim()) {
            dataMap[item.key.trim()] = item.value.trim()
          }
        })
        request.data = dataMap
      }

      if (resourceType === 'ingress') {
        request.host = host.trim()
        request.serviceName = serviceName.trim()
        request.servicePort = servicePort
      }

      if (resourceType === 'service') {
        request.serviceType = serviceType.trim()
        request.port = port
        request.targetPort = targetPort
      }

      const response = await k8sService.createResource(request)
      setSuccess(response.message || `Recurso ${resourceType} criado com sucesso!`)
      
      // Reset form after success
      setTimeout(() => {
        setName('')
        setImage('')
        setReplicas(1)
        setContainerPort(8080)
        setSecretData([{ key: '', value: '' }])
        setHost('')
        setServiceName('')
        setServicePort(80)
        setServiceType('ClusterIP')
        setPort(80)
        setTargetPort(8080)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Erro ao criar recurso. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Criar Recurso</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Crie novos recursos no seu cluster Kubernetes
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Tipo de Recurso
          </label>
          <div className="flex flex-wrap gap-2">
            {(['pod', 'deployment', 'secret', 'ingress', 'namespace', 'service'] as ResourceType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setResourceType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  resourceType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          {resourceType !== 'namespace' && (
            <div className="mb-4">
              <label
                htmlFor="namespace"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Namespace *
              </label>
              <select
                id="namespace"
                value={namespace}
                onChange={(e) => setNamespace(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                required
              >
                <option value="">Selecione um namespace</option>
                {namespaces.map((ns) => (
                  <option key={ns} value={ns}>
                    {ns}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Nome *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="nome-do-recurso"
              required
            />
          </div>

          {(resourceType === 'pod' || resourceType === 'deployment') && (
            <>
              <div className="mb-4">
              <label
                htmlFor="image"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Imagem Docker *
              </label>
              <input
                type="text"
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="nginx:latest"
                required
              />
              </div>
            </>
          )}

          {resourceType === 'deployment' && (
            <>
              <div className="mb-4">
                <label
                  htmlFor="replicas"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Réplicas *
                </label>
                <input
                  type="number"
                  id="replicas"
                  value={replicas}
                  onChange={(e) => setReplicas(parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="containerPort"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Porta do Container (opcional)
                </label>
                <input
                  type="number"
                  id="containerPort"
                  value={containerPort}
                  onChange={(e) => setContainerPort(parseInt(e.target.value) || 0)}
                  min="0"
                  max="65535"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </>
          )}

          {resourceType === 'secret' && (
            <>
              <div className="mb-4">
                <label
                  htmlFor="secretType"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Tipo de Secret
                </label>
                <input
                  type="text"
                  id="secretType"
                  value={secretType}
                  onChange={(e) => setSecretType(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="Opaque"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dados (Key-Value) *
                </label>
                {secretData.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item.key}
                      onChange={(e) => handleSecretDataChange(index, 'key', e.target.value)}
                      placeholder="chave"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => handleSecretDataChange(index, 'value', e.target.value)}
                      placeholder="valor"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    {secretData.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSecretDataRow(index)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSecretDataRow}
                  className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  + Adicionar Linha
                </button>
              </div>
            </>
          )}

          {resourceType === 'ingress' && (
            <>
              <div className="mb-4">
                <label
                  htmlFor="host"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Host *
                </label>
                <input
                  type="text"
                  id="host"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="example.com"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="serviceName"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Nome do Service *
                </label>
                <input
                  type="text"
                  id="serviceName"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="meu-service"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="servicePort"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Porta do Service *
                </label>
                <input
                  type="number"
                  id="servicePort"
                  value={servicePort}
                  onChange={(e) => setServicePort(parseInt(e.target.value) || 80)}
                  min="1"
                  max="65535"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  required
                />
              </div>
            </>
          )}

          {resourceType === 'service' && (
            <>
              <div className="mb-4">
                <label
                  htmlFor="serviceType"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Tipo de Service *
                </label>
                <select
                  id="serviceType"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  required
                >
                  <option value="ClusterIP">ClusterIP</option>
                  <option value="NodePort">NodePort</option>
                  <option value="LoadBalancer">LoadBalancer</option>
                  <option value="ExternalName">ExternalName</option>
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="port"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Porta do Service *
                </label>
                <input
                  type="number"
                  id="port"
                  value={port}
                  onChange={(e) => setPort(parseInt(e.target.value) || 80)}
                  min="1"
                  max="65535"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="80"
                  required
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Porta exposta pelo Service
                </p>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="targetPort"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Porta de Destino (Target Port) *
                </label>
                <input
                  type="number"
                  id="targetPort"
                  value={targetPort}
                  onChange={(e) => setTargetPort(parseInt(e.target.value) || 8080)}
                  min="1"
                  max="65535"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="8080"
                  required
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Porta do container/pod que o Service irá encaminhar o tráfego
                </p>
              </div>
            </>
          )}

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                  Criando...
                </span>
              ) : (
                'Criar Recurso'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Create
