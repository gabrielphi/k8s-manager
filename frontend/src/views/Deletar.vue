<template>
  <div class="deletar-page">
    <div class="page-header">
      <h1>Deletar Recursos</h1>
      <p>Remova recursos do Kubernetes com segurança</p>
    </div>

    <div class="content-card">
      <div class="card-header">
        <h2>Selecionar Recursos para Deletar</h2>
        <div class="header-actions">
          <button 
            class="btn btn-outline" 
            @click="selectAll"
            :disabled="!resources.length"
          >
            {{ allSelected ? 'Desmarcar Todos' : 'Selecionar Todos' }}
          </button>
          <button 
            class="btn btn-danger" 
            @click="showDeleteConfirmation"
            :disabled="!hasSelectedResources"
          >
            <span class="btn-icon">🗑️</span>
            Deletar Selecionados ({{ selectedCount }})
          </button>
        </div>
      </div>

      <div class="loading-state" v-if="loading">
        <div class="spinner"></div>
        <p>Carregando recursos...</p>
      </div>

      <div class="empty-state" v-else-if="!resources.length">
        <div class="empty-icon">📋</div>
        <h3>Nenhum recurso encontrado</h3>
        <p>Não há recursos para deletar no momento.</p>
        <button class="btn btn-primary" @click="refreshData">
          Atualizar
        </button>
      </div>

      <div class="resources-list" v-else>
        <div 
          class="resource-item" 
          v-for="resource in resources" 
          :key="resource.id"
          :class="{ 'selected': isSelected(resource.id) }"
        >
          <div class="resource-checkbox">
            <input 
              type="checkbox" 
              :id="`resource-${resource.id}`"
              :checked="isSelected(resource.id)"
              @change="toggleSelection(resource.id)"
            >
            <label :for="`resource-${resource.id}`"></label>
          </div>
          
          <div class="resource-info">
            <div class="resource-header">
              <h3>{{ resource.name }}</h3>
              <span class="resource-type">{{ resource.type }}</span>
            </div>
            <div class="resource-details">
              <p><strong>Namespace:</strong> {{ resource.namespace }}</p>
              <p><strong>Status:</strong> 
                <span class="status" :class="resource.status.toLowerCase()">
                  {{ resource.status }}
                </span>
              </p>
              <p><strong>Criado em:</strong> {{ formatDate(resource.createdAt) }}</p>
            </div>
          </div>
          
          <div class="resource-actions">
            <button 
              class="btn btn-sm btn-danger"
              @click="deleteSingle(resource)"
            >
              Deletar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação -->
    <div v-if="showConfirmation" class="modal-overlay" @click="closeConfirmation">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>⚠️ Confirmar Exclusão</h3>
        </div>
        
        <div class="modal-body">
          <p v-if="deletingMultiple">
            Tem certeza que deseja deletar <strong>{{ selectedCount }} recursos</strong>?
          </p>
          <p v-else>
            Tem certeza que deseja deletar o recurso <strong>{{ singleResource?.name }}</strong>?
          </p>
          
          <div class="warning-box">
            <span class="warning-icon">⚠️</span>
            <p>Esta ação não pode ser desfeita. Os recursos serão permanentemente removidos.</p>
          </div>
          
          <div v-if="deletingMultiple" class="selected-resources">
            <h4>Recursos selecionados:</h4>
            <ul>
              <li v-for="resource in selectedResources" :key="resource.id">
                {{ resource.name }} ({{ resource.type }})
              </li>
            </ul>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="closeConfirmation" class="btn btn-outline">
            Cancelar
          </button>
          <button @click="confirmDelete" class="btn btn-danger" :disabled="deleting">
            <span v-if="deleting" class="spinner-small"></span>
            {{ deleting ? 'Deletando...' : 'Confirmar Exclusão' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Deletar',
  data() {
    return {
      loading: false,
      deleting: false,
      showConfirmation: false,
      deletingMultiple: false,
      singleResource: null,
      selectedResources: [],
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
        },
        {
          id: 4,
          name: 'test-pod',
          type: 'Pod',
          namespace: 'default',
          status: 'Failed',
          createdAt: new Date('2024-01-12')
        }
      ]
    }
  },
  computed: {
    allSelected() {
      return this.resources.length > 0 && this.selectedResources.length === this.resources.length;
    },
    hasSelectedResources() {
      return this.selectedResources.length > 0;
    },
    selectedCount() {
      return this.selectedResources.length;
    }
  },
  methods: {
    async refreshData() {
      this.loading = true;
      
      try {
        // TODO: Inserir backend - chamada para API
        console.log('Carregando recursos para deletar...');
        
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
    
    toggleSelection(resourceId) {
      const index = this.selectedResources.findIndex(r => r.id === resourceId);
      if (index > -1) {
        this.selectedResources.splice(index, 1);
      } else {
        const resource = this.resources.find(r => r.id === resourceId);
        if (resource) {
          this.selectedResources.push(resource);
        }
      }
    },
    
    isSelected(resourceId) {
      return this.selectedResources.some(r => r.id === resourceId);
    },
    
    selectAll() {
      if (this.allSelected) {
        this.selectedResources = [];
      } else {
        this.selectedResources = [...this.resources];
      }
    },
    
    deleteSingle(resource) {
      this.singleResource = resource;
      this.deletingMultiple = false;
      this.showConfirmation = true;
    },
    
    showDeleteConfirmation() {
      this.deletingMultiple = true;
      this.singleResource = null;
      this.showConfirmation = true;
    },
    
    closeConfirmation() {
      this.showConfirmation = false;
      this.deletingMultiple = false;
      this.singleResource = null;
    },
    
    async confirmDelete() {
      this.deleting = true;
      
      try {
        if (this.deletingMultiple) {
          // TODO: Inserir backend - deletar múltiplos recursos
          console.log('Deletando recursos:', this.selectedResources);
          
          // Simular delay da API
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Em produção, aqui seria:
          // await Promise.all(this.selectedResources.map(resource => 
          //   fetch('/api/deletePod', { 
          //     method: 'POST',
          //     headers: { 'Content-Type': 'application/json' },
          //     body: JSON.stringify({ podName: resource.name, namespace: resource.namespace })
          //   })
          // ));
          
          // Remover recursos da lista
          this.resources = this.resources.filter(
            resource => !this.selectedResources.some(selected => selected.id === resource.id)
          );
          this.selectedResources = [];
          
        } else {
          // TODO: Inserir backend - deletar recurso único
          console.log('Deletando recurso:', this.singleResource);
          
          // Simular delay da API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Em produção, aqui seria:
          // await fetch('/api/deletePod', { 
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ podName: this.singleResource.name, namespace: this.singleResource.namespace })
          // });
          
          // Remover recurso da lista
          this.resources = this.resources.filter(r => r.id !== this.singleResource.id);
        }
        
        this.showSuccessMessage();
        
      } catch (error) {
        console.error('Erro ao deletar recursos:', error);
        // TODO: Inserir backend - tratamento de erro
        this.showErrorMessage();
      } finally {
        this.deleting = false;
        this.closeConfirmation();
      }
    },
    
    formatDate(date) {
      return new Intl.DateTimeFormat('pt-BR').format(date);
    },
    
    showSuccessMessage() {
      // TODO: Implementar notificação de sucesso
      alert('Recursos deletados com sucesso!');
    },
    
    showErrorMessage() {
      // TODO: Implementar notificação de erro
      alert('Erro ao deletar recursos. Tente novamente.');
    }
  },
  
  mounted() {
    this.refreshData();
  }
}
</script>

<style scoped>
.deletar-page {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #4a5568;
  background: #4a5568;
}

.card-header h2 {
  color: #e2e8f0;
  margin: 0;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
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
  border-top: 4px solid #fc8181;
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

.resources-list {
  padding: 1.5rem;
}

.resource-item {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid #4a5568;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  background: #4a5568;
}

.resource-item:hover {
  background: #718096;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.resource-item.selected {
  background: #fc8181;
  border-color: #f56565;
}

.resource-checkbox {
  margin-right: 1rem;
}

.resource-checkbox input[type="checkbox"] {
  display: none;
}

.resource-checkbox label {
  display: block;
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e0;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.resource-checkbox input[type="checkbox"]:checked + label {
  background: #e53e3e;
  border-color: #e53e3e;
}

.resource-checkbox input[type="checkbox"]:checked + label::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 12px;
}

.resource-info {
  flex: 1;
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.resource-header h3 {
  color: #e2e8f0;
  margin: 0;
  font-size: 1.2rem;
}

.resource-type {
  background: #fc8181;
  color: #1a202c;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.resource-details p {
  margin: 0.25rem 0;
  color: #a0aec0;
  font-size: 0.9rem;
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
  margin-left: 1rem;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-outline:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.btn-danger {
  background: #fc8181;
  color: #1a202c;
}

.btn-danger:hover:not(:disabled) {
  background: #f56565;
  transform: translateY(-1px);
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.btn-icon {
  font-size: 1rem;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #2d3748;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.4);
  border: 1px solid #4a5568;
}

.modal-header h3 {
  color: #e2e8f0;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-body p {
  color: #a0aec0;
  margin-bottom: 1rem;
}

.warning-box {
  background: #744210;
  border: 1px solid #f6ad55;
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.warning-icon {
  font-size: 1.2rem;
}

.selected-resources {
  background: #4a5568;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
}

.selected-resources h4 {
  color: #e2e8f0;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.selected-resources ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.selected-resources li {
  color: #a0aec0;
  font-size: 0.9rem;
  padding: 0.25rem 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .resource-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .resource-checkbox {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .resource-actions {
    margin-left: 0;
    margin-top: 1rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
