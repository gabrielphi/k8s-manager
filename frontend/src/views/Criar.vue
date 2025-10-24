<template>
  <div class="criar-page">
    <div class="page-header">
      <h1>Criar Recurso</h1>
      <p>Crie novos recursos no Kubernetes</p>
    </div>

    <div class="content-card">
      <form @submit.prevent="submitForm" class="form-container">
        <div class="form-section">
          <h3>Informações Básicas</h3>
          
          <div class="form-group">
            <label for="name">Nome do Recurso *</label>
            <input 
              type="text" 
              id="name" 
              v-model="form.name" 
              required
              placeholder="Ex: meu-deployment"
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="type">Tipo de Recurso *</label>
            <select id="type" v-model="form.type" required class="form-select">
              <option value="">Selecione o tipo</option>
              <option value="Deployment">Deployment</option>
              <option value="Service">Service</option>
              <option value="ConfigMap">ConfigMap</option>
              <option value="Secret">Secret</option>
              <option value="Ingress">Ingress</option>
            </select>
          </div>

          <div class="form-group">
            <label for="namespace">Namespace *</label>
            <input 
              type="text" 
              id="namespace" 
              v-model="form.namespace" 
              required
              placeholder="Ex: default"
              class="form-input"
            >
          </div>
        </div>

        <div class="form-section">
          <h3>Configurações</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="replicas">Réplicas</label>
              <input 
                type="number" 
                id="replicas" 
                v-model.number="form.replicas" 
                min="1"
                class="form-input"
              >
            </div>

            <div class="form-group">
              <label for="image">Imagem Docker</label>
              <input 
                type="text" 
                id="image" 
                v-model="form.image" 
                placeholder="Ex: nginx:latest"
                class="form-input"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="description">Descrição</label>
            <textarea 
              id="description" 
              v-model="form.description" 
              rows="3"
              placeholder="Descreva o propósito deste recurso..."
              class="form-textarea"
            ></textarea>
          </div>
        </div>

        <div class="form-section">
          <h3>Labels e Annotations</h3>
          
          <div class="form-group">
            <label>Labels</label>
            <div class="key-value-pairs">
              <div 
                v-for="(label, index) in form.labels" 
                :key="index" 
                class="key-value-row"
              >
                <input 
                  type="text" 
                  v-model="label.key" 
                  placeholder="Chave"
                  class="form-input"
                >
                <span class="separator">:</span>
                <input 
                  type="text" 
                  v-model="label.value" 
                  placeholder="Valor"
                  class="form-input"
                >
                <button 
                  type="button" 
                  @click="removeLabel(index)"
                  class="btn btn-danger btn-sm"
                >
                  ✕
                </button>
              </div>
              <button 
                type="button" 
                @click="addLabel"
                class="btn btn-outline btn-sm"
              >
                + Adicionar Label
              </button>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button 
            type="button" 
            @click="resetForm"
            class="btn btn-outline"
            :disabled="submitting"
          >
            Limpar
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="submitting"
          >
            <span v-if="submitting" class="spinner-small"></span>
            {{ submitting ? 'Criando...' : 'Criar Recurso' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Modal de Confirmação -->
    <div v-if="showConfirmation" class="modal-overlay" @click="closeConfirmation">
      <div class="modal-content" @click.stop>
        <h3>Confirmar Criação</h3>
        <p>Tem certeza que deseja criar o recurso <strong>{{ form.name }}</strong>?</p>
        <div class="modal-actions">
          <button @click="closeConfirmation" class="btn btn-outline">Cancelar</button>
          <button @click="confirmCreate" class="btn btn-primary">Confirmar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Criar',
  data() {
    return {
      submitting: false,
      showConfirmation: false,
      form: {
        name: '',
        type: '',
        namespace: 'default',
        replicas: 1,
        image: '',
        description: '',
        labels: []
      }
    }
  },
  methods: {
    submitForm() {
      if (this.validateForm()) {
        this.showConfirmation = true;
      }
    },
    
    async confirmCreate() {
      this.submitting = true;
      this.showConfirmation = false;
      
      try {
        // TODO: Inserir backend - chamada para API
        console.log('Criando recurso:', this.form);
        
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Em produção, aqui seria:
        // const response = await fetch('/api/resources', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(this.form)
        // });
        
        this.$router.push('/listar');
        this.showSuccessMessage();
        
      } catch (error) {
        console.error('Erro ao criar recurso:', error);
        // TODO: Inserir backend - tratamento de erro
        this.showErrorMessage();
      } finally {
        this.submitting = false;
      }
    },
    
    closeConfirmation() {
      this.showConfirmation = false;
    },
    
    validateForm() {
      return this.form.name && this.form.type && this.form.namespace;
    },
    
    resetForm() {
      this.form = {
        name: '',
        type: '',
        namespace: 'default',
        replicas: 1,
        image: '',
        description: '',
        labels: []
      };
    },
    
    addLabel() {
      this.form.labels.push({ key: '', value: '' });
    },
    
    removeLabel(index) {
      this.form.labels.splice(index, 1);
    },
    
    showSuccessMessage() {
      // TODO: Implementar notificação de sucesso
      alert('Recurso criado com sucesso!');
    },
    
    showErrorMessage() {
      // TODO: Implementar notificação de erro
      alert('Erro ao criar recurso. Tente novamente.');
    }
  }
}
</script>

<style scoped>
.criar-page {
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

.form-container {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  color: #2d3748;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-weight: 500;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.key-value-pairs {
  space-y: 0.5rem;
}

.key-value-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.key-value-row input {
  flex: 1;
}

.separator {
  color: #718096;
  font-weight: bold;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 0.75rem 1.5rem;
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
  background: #e53e3e;
  color: white;
  padding: 0.5rem;
  min-width: 40px;
}

.btn-danger:hover {
  background: #c53030;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  color: #2d3748;
  margin-bottom: 1rem;
}

.modal-content p {
  color: #4a5568;
  margin-bottom: 2rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
