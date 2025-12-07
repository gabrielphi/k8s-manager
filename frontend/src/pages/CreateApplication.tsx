import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { k8sService, CreateApplicationRequest } from '../services/k8s'

interface EnvData {
  key: string
  value: string
}

function CreateApplication() {
  const navigate = useNavigate()
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
  const [serviceType, setServiceType] = useState('ClusterIP')
  const [servicePort, setServicePort] = useState<number>(80)
  const [targetPort, setTargetPort] = useState<number>(8080)
  const [envData, setEnvData] = useState<EnvData[]>([{ key: '', value: '' }])

  useEffect(() => {
    loadNamespaces()
  }, [])

  const loadNamespaces = async () => {
    try {
      const data = await k8sService.listNamespaces()
      if (Array.isArray(data)) {
        setNamespaces(data)
        if (data.length > 0) {
          setNamespace(data[0])
        }
      }
    } catch (err) {
      console.error('Erro ao carregar namespaces:', err)
    }
  }

  const handleEnvDataChange = (index: number, field: 'key' | 'value', value: string) => {
    const newData = [...envData]
    newData[index][field] = value
    setEnvData(newData)
  }

  const addEnvDataRow = () => {
    setEnvData([...envData, { key: '', value: '' }])
  }

  const removeEnvDataRow = (index: number) => {
    if (envData.length > 1) {
      setEnvData(envData.filter((_, i) => i !== index))
    }
  }

  const validateForm = (): boolean => {
    setError(null)

    if (!namespace.trim()) {
      setError('Namespace é obrigatório')
      return false
    }

    if (!name.trim()) {
      setError('Nome da aplicação é obrigatório')
      return false
    }

    if (!image.trim()) {
      setError('Imagem Docker é obrigatória')
      return false
    }

    if (replicas < 1) {
      setError('Número de réplicas deve ser maior que 0')
      return false
    }

    if (containerPort < 1 || containerPort > 65535) {
      setError('Porta do container deve estar entre 1 e 65535')
      return false
    }

    if (servicePort < 1 || servicePort > 65535) {
      setError('Porta do Service deve estar entre 1 e 65535')
      return false
    }

    if (targetPort < 1 || targetPort > 65535) {
      setError('Porta de destino (Target Port) deve estar entre 1 e 65535')
      return false
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
      const envMap: Record<string, string> = {}
      envData.forEach((item) => {
        if (item.key.trim() && item.value.trim()) {
          envMap[item.key.trim()] = item.value.trim()
        }
      })

      const request: CreateApplicationRequest = {
        namespace: namespace.trim(),
        name: name.trim(),
        image: image.trim(),
        replicas: replicas,
        containerPort: containerPort,
        serviceType: serviceType,
        servicePort: servicePort,
        targetPort: targetPort,
      }

      if (Object.keys(envMap).length > 0) {
        request.env = envMap
      }

      const response = await k8sService.createApplication(request)
      setSuccess(response.message || 'Aplicação criada com sucesso!')
      
      // Reset form after success
      setTimeout(() => {
        setName('')
        setImage('')
        setReplicas(1)
        setContainerPort(8080)
        setServicePort(80)
        setServiceType('ClusterIP')
        setTargetPort(8080)
        setEnvData([{ key: '', value: '' }])
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Erro ao criar aplicação. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Criar Aplicação</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Crie uma aplicação completa com Deployment e Service no seu cluster Kubernetes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
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

        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            Nome da Aplicação *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            placeholder="minha-aplicacao"
            required
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Este nome será usado para o Deployment e Service
          </p>
        </div>

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
            Porta do Container *
          </label>
          <input
            type="number"
            id="containerPort"
            value={containerPort}
            onChange={(e) => setContainerPort(parseInt(e.target.value) || 8080)}
            min="1"
            max="65535"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            required
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Porta que o container expõe
          </p>
        </div>

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
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
            Porta do container que o Service irá encaminhar o tráfego (geralmente igual à porta do container)
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Variáveis de Ambiente (ENV) (opcional)
          </label>
          {envData.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={item.key}
                onChange={(e) => handleEnvDataChange(index, 'key', e.target.value)}
                placeholder="chave"
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              />
              <input
                type="text"
                value={item.value}
                onChange={(e) => handleEnvDataChange(index, 'value', e.target.value)}
                placeholder="valor"
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              />
              {envData.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEnvDataRow(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addEnvDataRow}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            + Adicionar Linha
          </button>
        </div>

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
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                Criando...
              </span>
            ) : (
              'Criar Aplicação'
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
  )
}

export default CreateApplication
