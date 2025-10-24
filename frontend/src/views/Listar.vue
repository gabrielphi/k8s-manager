<template>
  <div class="listar-page">
    <div class="page-header">
      <h1>Listar Recursos</h1>
      <p>Visualize todos os recursos do Kubernetes</p>
    </div>

    <div class="content-card">
      <div class="card-header">
        <h2>Consultar Pods por Namespace</h2>
        <div class="search-container">
          <div class="input-group">
            <input 
              type="text" 
              v-model="namespaceInput" 
              placeholder="Digite o namespace (ex: default, kube-system)"
              class="namespace-input"
              @keyup.enter="searchPods"
            />
            <button class="btn btn-primary" @click="searchPods" :disabled="!namespaceInput.trim()">
              <span class="btn-icon">🔍</span>
              Buscar
            </button>
          </div>
          <button class="btn btn-secondary" @click="refreshData">
            <span class="btn-icon">🔄</span>
            Atualizar
          </button>
        </div>
      </div>

      <div class="error-state" v-if="error">
        <div class="error-icon">⚠️</div>
        <h3>Erro na consulta</h3>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="searchPods" v-if="currentNamespace">
          Tentar novamente
        </button>
      </div>

      <div class="loading-state" v-if="loading">
        <div class="spinner"></div>
        <p>Carregando pods do namespace "{{ currentNamespace }}"...</p>
      </div>

      <div class="empty-state" v-else-if="!pods.length && !loading">
        <div class="empty-icon">📋</div>
        <h3>Nenhum pod encontrado</h3>
        <p v-if="currentNamespace">Nenhum pod encontrado no namespace "{{ currentNamespace }}".</p>
        <p v-else>Digite um namespace para buscar pods.</p>
        <button class="btn btn-primary" @click="refreshData" v-if="currentNamespace">
          Tentar novamente
        </button>
      </div>

      <div class="pods-container" v-else-if="pods.length">
        <div class="pods-header">
          <h3>Pods no namespace: <span class="namespace-badge">{{ currentNamespace }}</span></h3>
          <span class="pods-count">{{ pods.length }} pod(s) encontrado(s)</span>
        </div>
        
        <div class="pods-grid">
          <div 
            class="pod-card" 
            v-for="pod in pods" 
            :key="pod.metadata.uid"
          >
            <div class="pod-header">
              <div class="pod-name">
                <h4>{{ pod.metadata.name }}</h4>
                <span class="pod-namespace">{{ pod.metadata.namespace }}</span>
              </div>
              <div class="pod-status">
                <span class="status-badge" :class="getStatusClass(pod.status.phase)">
                  {{ pod.status.phase }}
                </span>
              </div>
            </div>
            
            <div class="pod-content">
              <div class="pod-info">
                <div class="info-item">
                  <span class="info-label">UID:</span>
                  <span class="info-value">{{ pod.metadata.uid }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Criado em:</span>
                  <span class="info-value">{{ formatDate(pod.metadata.creationTimestamp) }}</span>
                </div>
                <div class="info-item" v-if="pod.spec.nodeName">
                  <span class="info-label">Node:</span>
                  <span class="info-value">{{ pod.spec.nodeName }}</span>
                </div>
                <div class="info-item" v-if="pod.status.containerStatuses">
                  <span class="info-label">Containers:</span>
                  <span class="info-value">{{ pod.status.containerStatuses.length }}</span>
                </div>
              </div>
              
              <div class="pod-labels" v-if="pod.metadata.labels">
                <div class="labels-title">Labels:</div>
                <div class="labels-container">
                  <span 
                    class="label-tag" 
                    v-for="(value, key) in pod.metadata.labels" 
                    :key="key"
                  >
                    {{ key }}: {{ value }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="pod-actions">
              <button class="btn btn-sm btn-outline" @click="viewPodDetails(pod)">
                <span class="btn-icon">👁️</span>
                Detalhes
              </button>
              <button class="btn btn-sm btn-danger" @click="deletePod(pod)">
                <span class="btn-icon">🗑️</span>
                Deletar
              </button>
            </div>
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
      namespaceInput: '',
      currentNamespace: '',
      pods: [],
      error: null
    }
  },
  methods: {
    async searchPods() {
      if (!this.namespaceInput.trim()) {
        this.error = 'Por favor, digite um namespace válido';
        return;
      }

      this.loading = true;
      this.error = null;
      this.currentNamespace = this.namespaceInput.trim();

      try {
        const response = await fetch(`http://localhost:7000/listAllPods/${this.currentNamespace}`);
        
        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Processar a resposta JSON do Kubernetes
        if (data.items && Array.isArray(data.items)) {
          this.pods = data.items;
        } else if (Array.isArray(data)) {
          this.pods = data;
        } else {
          this.pods = [];
        }

        if (this.pods.length === 0) {
          this.error = `Nenhum pod encontrado no namespace "${this.currentNamespace}"`;
        }

      } catch (error) {
        console.error('Erro ao buscar pods:', error);
        this.error = `Erro ao buscar pods: ${error.message}`;
        this.pods = [];
      } finally {
        this.loading = false;
      }
    },

    async refreshData() {
      if (this.currentNamespace) {
        await this.searchPods();
      } else {
        this.pods = [];
        this.currentNamespace = '';
      }
    },

    getStatusClass(status) {
      const statusMap = {
        'Running': 'running',
        'Pending': 'pending',
        'Succeeded': 'succeeded',
        'Failed': 'failed',
        'Unknown': 'unknown'
      };
      return statusMap[status] || 'unknown';
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },

    viewPodDetails(pod) {
      // Implementar visualização de detalhes do pod
      console.log('Visualizar detalhes do pod:', pod);
      alert(`Detalhes do pod: ${pod.metadata.name}\nNamespace: ${pod.metadata.namespace}\nStatus: ${pod.status.phase}`);
    },

    deletePod(pod) {
      // Implementar deleção do pod
      if (confirm(`Tem certeza que deseja deletar o pod "${pod.metadata.name}"?`)) {
        console.log('Deletar pod:', pod);
        alert('Funcionalidade de deleção será implementada em breve');
      }
    }
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
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.card-header h2 {
  color: #2d3748;
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.search-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.namespace-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.namespace-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.namespace-input::placeholder {
  color: #a0aec0;
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

.error-state {
  text-align: center;
  padding: 3rem;
  color: #e53e3e;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  color: #e53e3e;
  margin-bottom: 0.5rem;
}

.pods-container {
  padding: 1.5rem;
}

.pods-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.pods-header h3 {
  color: #2d3748;
  margin: 0;
  font-size: 1.3rem;
}

.namespace-badge {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-left: 0.5rem;
}

.pods-count {
  color: #718096;
  font-size: 0.9rem;
  font-weight: 500;
}

.pods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.pod-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.pod-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.pod-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.pod-name h4 {
  color: #2d3748;
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.pod-namespace {
  color: #718096;
  font-size: 0.9rem;
  background: #f7fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.pod-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.running {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.pending {
  background: #fef5e7;
  color: #744210;
}

.status-badge.succeeded {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.failed {
  background: #fed7d7;
  color: #742a2a;
}

.status-badge.unknown {
  background: #e2e8f0;
  color: #4a5568;
}

.pod-content {
  margin-bottom: 1.5rem;
}

.pod-info {
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f7fafc;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #718096;
  font-weight: 500;
  font-size: 0.9rem;
}

.info-value {
  color: #2d3748;
  font-weight: 600;
  font-size: 0.9rem;
  word-break: break-all;
  text-align: right;
  max-width: 60%;
}

.pod-labels {
  margin-top: 1rem;
}

.labels-title {
  color: #718096;
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.labels-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.label-tag {
  background: #e6fffa;
  color: #234e52;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #b2f5ea;
}

.pod-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f7fafc;
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

.btn-primary:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #718096;
  color: white;
}

.btn-secondary:hover {
  background: #4a5568;
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
