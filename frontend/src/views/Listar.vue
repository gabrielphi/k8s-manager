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
            <select 
              v-model="selectedNamespace" 
              class="namespace-select"
              @change="onNamespaceChange"
              :disabled="loadingNamespaces"
            >
              <option value="">
                {{ loadingNamespaces ? 'Carregando namespaces...' : 'Selecione um namespace' }}
              </option>
              <option 
                v-for="namespace in namespaces" 
                :key="namespace" 
                :value="namespace"
              >
                {{ namespace }}
              </option>
            </select>
            <button class="btn btn-primary" @click="searchPods" :disabled="!selectedNamespace || loadingNamespaces">
              <span class="btn-icon">🔍</span>
              Buscar
            </button>
          </div>
          <button class="btn btn-secondary" @click="refreshData" :disabled="loadingNamespaces">
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
        
        <div class="pods-list">
          <table class="pods-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Namespace</th>
                <th>Status</th>
                <th>IP</th>
                <th>Node</th>
                <th>Imagem</th>
                <th class="actions-col">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(pod, index) in pods" :key="index" class="pod-row">
                <td class="col-name">
                  <div class="name-cell">
                    <div class="name-main">{{ pod.nome }}</div>
                  </div>
                </td>
                <td>{{ pod.namespace }}</td>
                <td>
                  <span class="status-badge" :class="getStatusClass(pod.status)">
                    {{ pod.status }}
                  </span>
                </td>
                <td>{{ pod.ip || '-' }}</td>
                <td>{{ pod.node || '-' }}</td>
                <td class="truncate">{{ pod.image }}</td>
                <td class="actions">
                  <button class="btn btn-sm btn-outline" @click="viewPodDetails(pod)">
                    <span class="btn-icon">👁️</span>
                    Detalhes
                  </button>
                  <button class="btn btn-sm btn-danger" @click="deletePod(pod)">
                    <span class="btn-icon">🗑️</span>
                    Deletar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { buildApiUrl, config } from '@/config/env.js'

export default {
  name: 'Listar',
  data() {
    return {
      loading: false,
      loadingNamespaces: false,
      selectedNamespace: '',
      currentNamespace: '',
      namespaces: [],
      pods: [],
      error: null
    }
  },
  async mounted() {
    await this.loadNamespaces();
  },
  methods: {
    async loadNamespaces() {
      this.loadingNamespaces = true;
      this.error = null;

      try {
        // Verificação de segurança para config
        if (!config || !config.ENDPOINTS) {
          throw new Error('Configuração não carregada corretamente');
        }
        
        const url = buildApiUrl(config.ENDPOINTS.NAMESPACES);
        console.log('🔍 Carregando namespaces da URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Namespaces carregados:', data);
        
        if (Array.isArray(data)) {
          this.namespaces = data;
          console.log('📋 Namespaces processados:', this.namespaces);
        } else {
          console.warn('⚠️ Resposta não é um array:', data);
          this.namespaces = [];
        }

      } catch (error) {
        console.error('❌ Erro ao carregar namespaces:', error);
        this.error = `Erro ao carregar namespaces: ${error.message}`;
        this.namespaces = [];
      } finally {
        this.loadingNamespaces = false;
      }
    },

    async searchPods() {
      if (!this.selectedNamespace) {
        this.error = 'Por favor, selecione um namespace';
        return;
      }

      this.loading = true;
      this.error = null;
      this.currentNamespace = this.selectedNamespace;

      try {
        // Verificação de segurança para config
        if (!config || !config.ENDPOINTS) {
          throw new Error('Configuração não carregada corretamente');
        }
        
        const url = buildApiUrl(`${config.ENDPOINTS.PODS}/${this.currentNamespace}`);
        console.log('🔍 Buscando pods da URL:', url);
        console.log('📋 Namespace selecionado:', this.currentNamespace);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Resposta da API:', data);
        
        // Processar a resposta JSON do backend
        if (Array.isArray(data)) {
          this.pods = data;
          console.log('📋 Pods processados:', this.pods);
        } else {
          console.warn('⚠️ Resposta não é um array:', data);
          this.pods = [];
        }

        if (this.pods.length === 0) {
          this.error = `Nenhum pod encontrado no namespace "${this.currentNamespace}"`;
        }

      } catch (error) {
        console.error('❌ Erro ao buscar pods:', error);
        this.error = `Erro ao buscar pods: ${error.message}`;
        this.pods = [];
      } finally {
        this.loading = false;
      }
    },

    onNamespaceChange() {
      // Limpar pods quando namespace muda
      this.pods = [];
      this.currentNamespace = '';
      this.error = null;
    },

    async refreshData() {
      // Recarregar namespaces e pods
      await this.loadNamespaces();
      if (this.selectedNamespace) {
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
      alert(`Detalhes do pod: ${pod.nome}\nNamespace: ${pod.namespace}\nStatus: ${pod.status}\nIP: ${pod.ip || 'N/A'}\nNode: ${pod.node || 'N/A'}`);
    },

    async deletePod(pod) {
      if (confirm(`Tem certeza que deseja deletar o pod "${pod.nome}" do namespace "${pod.namespace}"?`)) {
        try {
          const response = await fetch(buildApiUrl(config.ENDPOINTS.DELETE_POD), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: pod.nome,
              namespace: pod.namespace
            })
          });

          if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
          }

          const result = await response.json();
          console.log('Pod deletado com sucesso:', result);
          
          // Remover o pod da lista local
          this.pods = this.pods.filter(p => p.nome !== pod.nome);
          
          alert(`Pod "${pod.nome}" deletado com sucesso!`);
          
        } catch (error) {
          console.error('Erro ao deletar pod:', error);
          alert(`Erro ao deletar pod: ${error.message}`);
        }
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
  color: #e2e8f0;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.page-header p {
  color: #a0aec0;
  font-size: 1.1rem;
}

.content-card {
  background: #2d3748;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  border: 1px solid #4a5568;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #4a5568;
  background: #4a5568;
}

.card-header h2 {
  color: #e2e8f0;
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

.namespace-select {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #4a5568;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #1a202c;
  color: #e2e8f0;
  cursor: pointer;
}

.namespace-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.namespace-select:disabled {
  background: #2d3748;
  color: #718096;
  cursor: not-allowed;
  border-color: #4a5568;
}

.namespace-select option {
  background: #1a202c;
  color: #e2e8f0;
  padding: 0.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  color: #a0aec0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #4a5568;
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
  color: #a0aec0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #e2e8f0;
  margin-bottom: 0.5rem;
}

.error-state {
  text-align: center;
  padding: 3rem;
  color: #fc8181;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  color: #fc8181;
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
  border-bottom: 2px solid #4a5568;
}

.pods-header h3 {
  color: #e2e8f0;
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
  color: #a0aec0;
  font-size: 0.9rem;
  font-weight: 500;
}

.pods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.pod-card {
  background: #4a5568;
  border: 1px solid #718096;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.pod-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  border-color: #667eea;
}

.pod-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #718096;
}

.pod-name h4 {
  color: #e2e8f0;
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.pod-namespace {
  color: #a0aec0;
  font-size: 0.9rem;
  background: #2d3748;
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
  border-bottom: 1px solid #718096;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #a0aec0;
  font-weight: 500;
  font-size: 0.9rem;
}

.info-value {
  color: #e2e8f0;
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
  color: #a0aec0;
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
  background: #2d3748;
  color: #68d391;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #4a5568;
}

.pod-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #718096;
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
  background: #fc8181;
  color: #1a202c;
}

.btn-danger:hover {
  background: #f56565;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.btn-icon {
  font-size: 1rem;
}

.pods-list {
  width: 100%;
  overflow-x: auto;
  margin-top: 1rem;
}

.pods-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #4a5568;
  border: 1px solid #718096;
  border-radius: 12px;
}

.pods-table thead th {
  position: sticky;
  top: 0;
  background: #2d3748;
  color: #e2e8f0;
  text-align: left;
  padding: 0.75rem 1rem;
  font-weight: 600;
  border-bottom: 1px solid #718096;
}

.pods-table tbody td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #718096;
  color: #e2e8f0;
}

.pods-table tbody tr:hover {
  background: #3b475a;
}

.pod-row .status-badge {
  display: inline-block;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.actions-col {
  width: 160px;
}

.truncate {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .actions-col {
    width: 120px;
  }
  .truncate {
    max-width: 160px;
  }
}
</style>
