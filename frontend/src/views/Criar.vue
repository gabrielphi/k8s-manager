<template>
  <div class="criar-page">
    <div class="page-header">
      <h1>Criar Pod</h1>
      <p>Crie um novo pod no Kubernetes</p>
    </div>

    <div class="content-card">
      <form @submit.prevent="submitForm" class="form-container">
        <div class="form-section">
          <h3>Informações do Pod</h3>
          
          <div class="form-group">
            <label for="podName">Nome do Container *</label>
            <input 
              type="text" 
              id="podName" 
              v-model="form.podName" 
              required
              placeholder="Ex: meu-novo-pod"
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="image">Imagem *</label>
            <input 
              type="text" 
              id="image" 
              v-model="form.image" 
              required
              placeholder="Ex: nginx:latest"
              class="form-input"
            >
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
            {{ submitting ? 'Criando Pod...' : 'Criar Pod' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Modal de Confirmação -->
    <div v-if="showConfirmation" class="modal-overlay" @click="closeConfirmation">
      <div class="modal-content" @click.stop>
        <h3>Confirmar Criação</h3>
        <p>Tem certeza que deseja criar o pod <strong>{{ form.podName }}</strong>?</p>
        <div class="modal-actions">
          <button @click="closeConfirmation" class="btn btn-outline">Cancelar</button>
          <button @click="confirmCreate" class="btn btn-primary">Confirmar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { buildApiUrl, config } from '@/config/env.js'

export default {
  name: 'Criar',
  data() {
    return {
      submitting: false,
      showConfirmation: false,
      form: {
        podName: '',
        namespace: 'default',
        image: ''
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
        const response = await fetch(buildApiUrl(config.ENDPOINTS.CREATE_POD), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            podName: this.form.podName,
            namespace: this.form.namespace,
            image: this.form.image
          })
        });

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const result = await response.json();
        console.log('Pod criado com sucesso:', result);
        
        this.$router.push('/listar');
        this.showSuccessMessage();
        
      } catch (error) {
        console.error('Erro ao criar pod:', error);
        this.showErrorMessage();
      } finally {
        this.submitting = false;
      }
    },
    
    closeConfirmation() {
      this.showConfirmation = false;
    },
    
    validateForm() {
      return this.form.podName && this.form.namespace && this.form.image;
    },
    
    resetForm() {
      this.form = {
        podName: '',
        namespace: 'default',
        image: ''
      };
    },
    
    showSuccessMessage() {
      alert('Pod criado com sucesso!');
    },
    
    showErrorMessage() {
      alert('Erro ao criar pod. Tente novamente.');
    }
  }
}
</script>

<style scoped>
.criar-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  color: #e2e8f0;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-header p {
  color: #a0aec0;
  font-size: 1.1rem;
}

.content-card {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  border: 1px solid #4a5568;
  backdrop-filter: blur(10px);
}

.form-container {
  padding: 3rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  color: #e2e8f0;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
}

.form-group {
  margin-bottom: 2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  color: #e2e8f0;
  font-weight: 600;
  font-size: 1rem;
}

.form-input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid #4a5568;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(26, 32, 44, 0.8);
  color: #e2e8f0;
  backdrop-filter: blur(10px);
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.form-input::placeholder {
  color: #718096;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  padding-top: 2rem;
  margin-top: 2rem;
  border-top: 1px solid #4a5568;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 140px;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover:not(:disabled) {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  padding: 2.5rem;
  border-radius: 16px;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  border: 1px solid #4a5568;
  backdrop-filter: blur(10px);
}

.modal-content h3 {
  color: #e2e8f0;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  text-align: center;
}

.modal-content p {
  color: #a0aec0;
  margin-bottom: 2rem;
  text-align: center;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .criar-page {
    padding: 1rem;
  }
  
  .form-container {
    padding: 2rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
