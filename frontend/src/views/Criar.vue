<template>
  <div class="criar-page">
    <div class="page-header">
      <h1>Criar Recurso</h1>
      <p>Crie Namespace, Container, Deployment, Secret ou Ingress no Kubernetes</p>
    </div>

    <div class="content-card">
      <form @submit.prevent="submitForm" class="form-container">
        <div class="form-section">
          <h3>Configuração</h3>

          <!-- Navegação por abas para tipo de recurso -->
          <div class="tabs-wrapper" role="tablist" aria-label="Tipo de recurso">
            <button 
              v-for="t in tabs" 
              :key="t.value" 
              class="tab-btn" 
              :class="{ active: resourceType === t.value }"
              role="tab"
              :aria-selected="resourceType === t.value"
              type="button"
              @click="resourceType = t.value"
            >
              <span class="tab-text">{{ t.label }}</span>
            </button>
          </div>

          <div class="form-group">
            <label for="podName">Nome *</label>
            <input 
              type="text" 
              id="podName" 
              v-model="form.podName" 
              required
              placeholder="Ex: meu-recurso"
              class="form-input"
            >
          </div>

          <div class="form-group" v-if="resourceType !== 'namespace'">
            <label for="namespace">Namespace *</label>
            <select 
              id="namespace"
              v-model="form.namespace"
              class="form-input"
              :disabled="loadingNamespaces"
              required
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
          </div>
        </div>

        <!-- Campos específicos: Container -->
        <div class="form-section" v-if="resourceType === 'container'">
          <h3>Container</h3>
          <div class="form-group">
            <label for="image">Imagem *</label>
            <input 
              type="text" 
              id="image" 
              v-model="form.image" 
              placeholder="Ex: nginx:latest"
              class="form-input"
            >
          </div>
        </div>

        <!-- Campos específicos: Deployment -->
        <div class="form-section" v-if="resourceType === 'deployment'">
          <h3>Deployment</h3>
          <div class="form-group">
            <label for="depImage">Imagem *</label>
            <input 
              type="text" 
              id="depImage" 
              v-model="deployment.image" 
              placeholder="Ex: nginx:latest"
              class="form-input"
            >
          </div>
          <div class="form-row">
            <div class="form-group half">
              <label for="replicas">Réplicas *</label>
              <input type="number" id="replicas" v-model.number="deployment.replicas" min="1" class="form-input" />
            </div>
            <div class="form-group half">
              <label for="containerPort">Porta do Container</label>
              <input type="number" id="containerPort" v-model.number="deployment.containerPort" min="1" class="form-input" />
            </div>
          </div>
        </div>

        <!-- Campos específicos: Secret -->
        <div class="form-section" v-if="resourceType === 'secret'">
          <h3>Secret</h3>
          <div class="form-group">
            <label for="secretType">Tipo</label>
            <select id="secretType" v-model="secret.secretType" class="form-input">
              <option value="Opaque">Opaque</option>
              <option value="kubernetes.io/dockerconfigjson">dockerconfigjson</option>
              <option value="kubernetes.io/basic-auth">basic-auth</option>
            </select>
          </div>
          <div class="kv-list">
            <div class="kv-row" v-for="(pair, idx) in secret.pairs" :key="idx">
              <input class="form-input" type="text" v-model="pair.key" placeholder="Chave"/>
              <input class="form-input" type="text" v-model="pair.value" placeholder="Valor"/>
              <button class="btn btn-outline small" type="button" @click="removePair(idx)">Remover</button>
            </div>
            <button class="btn btn-secondary" type="button" @click="addPair">+ Adicionar Par</button>
          </div>
        </div>

        <!-- Campos específicos: Ingress -->
        <div class="form-section" v-if="resourceType === 'ingress'">
          <h3>Ingress</h3>
          <div class="form-group">
            <label for="host">Host *</label>
            <input type="text" id="host" v-model="ingress.host" class="form-input" placeholder="app.exemplo.com"/>
          </div>
          <div class="form-row">
            <div class="form-group half">
              <label for="serviceName">Service Name *</label>
              <input type="text" id="serviceName" v-model="ingress.serviceName" class="form-input" placeholder="meu-service"/>
            </div>
            <div class="form-group half">
              <label for="servicePort">Service Port *</label>
              <input type="number" id="servicePort" v-model.number="ingress.servicePort" min="1" class="form-input" placeholder="80"/>
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
            {{ submitting ? `Criando ${kindLabel}...` : `Criar ${kindLabel}` }}
          </button>
        </div>
      </form>
    </div>

    <!-- Modal de Confirmação -->
    <div v-if="showConfirmation" class="modal-overlay" @click="closeConfirmation">
      <div class="modal-content" @click.stop>
        <h3>Confirmar Criação</h3>
        <p>Tem certeza que deseja criar o {{ kindLabel }} <strong>{{ form.podName }}</strong>?</p>
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
      resourceType: 'container',
      tabs: [
        { value: 'namespace', label: 'Namespace' },
        { value: 'container', label: 'Container' },
        { value: 'deployment', label: 'Deployment' },
        { value: 'secret', label: 'Secret' },
        { value: 'ingress', label: 'Ingress' }
      ],
      form: {
        podName: '',
        namespace: '',
        image: ''
      },
      loadingNamespaces: false,
      namespaces: [],
      error: null,
      deployment: {
        image: '',
        replicas: 1,
        containerPort: null
      },
      secret: {
        secretType: 'Opaque',
        pairs: [{ key: '', value: '' }]
      },
      ingress: {
        host: '',
        serviceName: '',
        servicePort: null
      }
    }
  },
  computed: {
    kindLabel() {
      switch (this.resourceType) {
        case 'namespace': return 'Namespace';
        case 'container': return 'Container';
        case 'deployment': return 'Deployment';
        case 'secret': return 'Secret';
        case 'ingress': return 'Ingress';
        default: return 'Recurso';
      }
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
        if (!config || !config.ENDPOINTS) {
          throw new Error('Configuração não carregada corretamente');
        }
        const url = buildApiUrl(config.ENDPOINTS.NAMESPACES);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          this.namespaces = data;
        } else {
          this.namespaces = [];
        }
      } catch (error) {
        console.error('Erro ao carregar namespaces:', error);
        this.error = `Erro ao carregar namespaces: ${error.message}`;
        this.namespaces = [];
      } finally {
        this.loadingNamespaces = false;
      }
    },
    submitForm() {
      if (this.validateForm()) {
        this.showConfirmation = true;
      }
    },
    
    async confirmCreate() {
      this.submitting = true;
      this.showConfirmation = false;
      
      try {
        const payload = this.buildPayload();
        const response = await fetch(buildApiUrl(config.ENDPOINTS.CREATE_RESOURCE), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Erro HTTP ${response.status}: ${text}`);
        }

        const result = await response.json();
        console.log('Recurso criado com sucesso:', result);
        
        this.$router.push('/listar');
        this.showSuccessMessage();
        
      } catch (error) {
        console.error('Erro ao criar recurso:', error);
        this.showErrorMessage(error?.message);
      } finally {
        this.submitting = false;
      }
    },
    
    buildPayload() {
      if (this.resourceType === 'namespace') {
        return {
          kind: 'namespace',
          name: this.form.podName
        };
      }
      const base = {
        kind: this.resourceType,
        namespace: this.form.namespace,
        name: this.form.podName
      };
      if (this.resourceType === 'container') {
        return { ...base, image: this.form.image };
      }
      if (this.resourceType === 'deployment') {
        const payload = {
          ...base,
          image: this.deployment.image,
          replicas: Number(this.deployment.replicas)
        };
        if (this.deployment.containerPort) payload.containerPort = Number(this.deployment.containerPort);
        return payload;
      }
      if (this.resourceType === 'secret') {
        const data = {};
        this.secret.pairs.forEach(p => {
          if (p.key) data[p.key] = p.value || '';
        });
        return { ...base, secretType: this.secret.secretType, data };
      }
      if (this.resourceType === 'ingress') {
        return { ...base, host: this.ingress.host, serviceName: this.ingress.serviceName, servicePort: Number(this.ingress.servicePort) };
      }
      return base;
    },

    closeConfirmation() {
      this.showConfirmation = false;
    },
    
    validateForm() {
      if (this.resourceType === 'namespace') {
        return !!this.form.podName;
      }
      if (!this.form.podName || !this.form.namespace) return false;
      switch (this.resourceType) {
        case 'container':
          return !!this.form.image;
        case 'deployment':
          return !!this.deployment.image && Number(this.deployment.replicas) >= 1;
        case 'secret': {
          const hasValid = this.secret.pairs.some(p => p.key && p.value !== undefined);
          return hasValid;
        }
        case 'ingress':
          return !!this.ingress.host && !!this.ingress.serviceName && Number(this.ingress.servicePort) > 0;
        default:
          return true;
      }
    },
    
    resetForm() {
      this.resourceType = 'container';
      this.form = {
        podName: '',
        namespace: '',
        image: ''
      };
      this.deployment = { image: '', replicas: 1, containerPort: null };
      this.secret = { secretType: 'Opaque', pairs: [{ key: '', value: '' }] };
      this.ingress = { host: '', serviceName: '', servicePort: null };
    },

    addPair() {
      this.secret.pairs.push({ key: '', value: '' });
    },
    removePair(index) {
      this.secret.pairs.splice(index, 1);
    },
    
    showSuccessMessage() {
      alert(`${this.kindLabel} criado com sucesso!`);
    },
    
    showErrorMessage(msg) {
      alert(msg ? `Erro ao criar ${this.kindLabel}: ${msg}` : `Erro ao criar ${this.kindLabel}. Tente novamente.`);
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

.form-hint {
  display: block;
  margin-top: 0.5rem;
  color: #a0aec0;
  font-size: 0.875rem;
  font-style: italic;
}

.tabs-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  background: rgba(26, 32, 44, 0.6);
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid #4a5568;
  margin-bottom: 1.5rem;
}

.tab-btn {
  appearance: none;
  border: 1px solid transparent;
  background: transparent;
  color: #a0aec0;
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  color: #e2e8f0;
  border-color: #4a5568;
  background: rgba(45, 55, 72, 0.6);
}

.tab-btn.active {
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.tab-emoji {
  font-size: 1rem;
}

.tab-text {
  font-size: 0.95rem;
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
