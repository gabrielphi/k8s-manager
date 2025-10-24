<template>
  <div class="listar-page">
    <div class="page-header">
      <h1>Listar Recursos</h1>
      <p>Visualize todos os recursos do Kubernetes</p>
    </div>

    <div class="content-card">
      <div class="card-header">
        <h2>Recursos Disponíveis</h2>
        <button class="btn btn-primary" @click="refreshData">
          <span class="btn-icon">🔄</span>
          Atualizar
        </button>
      </div>

      <div class="loading-state" v-if="loading">
        <div class="spinner"></div>
        <p>Carregando recursos...</p>
      </div>

      <div class="empty-state" v-else-if="!resources.length">
        <div class="empty-icon">📋</div>
        <h3>Nenhum recurso encontrado</h3>
        <p>Não há recursos para exibir no momento.</p>
        <button class="btn btn-primary" @click="refreshData">
          Tentar novamente
        </button>
      </div>

      <div class="resources-grid" v-else>
        <div 
          class="resource-card" 
          v-for="resource in resources" 
          :key="resource.id"
        >
          <div class="resource-header">
            <h3>{{ resource.name }}</h3>
            <span class="resource-type">{{ resource.type }}</span>
          </div>
          <div class="resource-content">
            <p><strong>Namespace:</strong> {{ resource.namespace }}</p>
            <p><strong>Status:</strong> 
              <span class="status" :class="resource.status.toLowerCase()">
                {{ resource.status }}
              </span>
            </p>
            <p><strong>Criado em:</strong> {{ formatDate(resource.createdAt) }}</p>
          </div>
          <div class="resource-actions">
            <button class="btn btn-sm btn-outline">Ver detalhes</button>
            <button class="btn btn-sm btn-danger">Deletar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Listar',
  data() {
    return {
      loading: false,
      resources: [
        {
          id: 1,
          name: 'nginx-deployment',
          type: 'Deployment',
          namespace: 'default',
          status: 'Running',
          createdAt: new Date('2024-01-15')
        },
        {
          id: 2,
          name: 'mysql-service',
          type: 'Service',
          namespace: 'default',
          status: 'Active',
          createdAt: new Date('2024-01-14')
        },
        {
          id: 3,
          name: 'redis-configmap',
          type: 'ConfigMap',
          namespace: 'default',
          status: 'Ready',
          createdAt: new Date('2024-01-13')
        }
      ]
    }
  },
  methods: {
    async refreshData() {
      this.loading = true;
      
      // Simular chamada para o backend
      try {
        // TODO: Inserir backend - chamada para API
        console.log('Chamando backend para listar recursos...');
        
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Em produção, aqui seria:
        // const response = await fetch('/api/resources');
        // this.resources = await response.json();
        
      } catch (error) {
        console.error('Erro ao carregar recursos:', error);
        // TODO: Inserir backend - tratamento de erro
      } finally {
        this.loading = false;
      }
    },
    
    formatDate(date) {
      return new Intl.DateTimeFormat('pt-BR').format(date);
    }
  },
  
  mounted() {
    this.refreshData();
  }
}
</script>

<style scoped>
.listar-page {
  max-width: 100%;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  color: #2d3748;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.page-header p {
  color: #718096;
  font-size: 1.1rem;
}

.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.card-header h2 {
  color: #2d3748;
  margin: 0;
  font-size: 1.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  color: #718096;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.resource-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.resource-header h3 {
  color: #2d3748;
  margin: 0;
  font-size: 1.2rem;
}

.resource-type {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.resource-content p {
  margin: 0.5rem 0;
  color: #4a5568;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status.running,
.status.active,
.status.ready {
  background: #c6f6d5;
  color: #22543d;
}

.status.pending {
  background: #fef5e7;
  color: #744210;
}

.status.failed {
  background: #fed7d7;
  color: #742a2a;
}

.resource-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.btn-danger {
  background: #e53e3e;
  color: white;
}

.btn-danger:hover {
  background: #c53030;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.btn-icon {
  font-size: 1rem;
}
</style>
