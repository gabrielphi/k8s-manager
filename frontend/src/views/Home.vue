<template>
  <div class="home">
    <div class="hero-section">
      <div class="hero-content">
        <h1>K8s Manager</h1>
        <p class="hero-subtitle">Gerencie seus recursos Kubernetes de forma simples e eficiente</p>
        <div class="hero-actions">
          <router-link to="/listar" class="btn btn-primary btn-large">
            <span class="btn-icon">📋</span>
            Ver Recursos
          </router-link>
          <router-link to="/criar" class="btn btn-outline btn-large">
            <span class="btn-icon">➕</span>
            Criar Novo
          </router-link>
        </div>
      </div>
      <div class="hero-image">
        <div class="k8s-logo">☸️</div>
      </div>
    </div>

    <div class="features-section">
      <h2>Funcionalidades</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📋</div>
          <h3>Listar Recursos</h3>
          <p>Visualize todos os seus recursos Kubernetes em uma interface intuitiva</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">➕</div>
          <h3>Criar Recursos</h3>
          <p>Crie novos deployments, services e outros recursos com facilidade</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🗑️</div>
          <h3>Deletar Recursos</h3>
          <p>Remova recursos de forma segura com confirmação e validação</p>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <h2>Estatísticas</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ stats.totalResources }}</div>
          <div class="stat-label">Total de Recursos</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.runningPods }}</div>
          <div class="stat-label">Pods em Execução</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.activeServices }}</div>
          <div class="stat-label">Services Ativos</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.namespaces }}</div>
          <div class="stat-label">Namespaces</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      stats: {
        totalResources: 12,
        runningPods: 8,
        activeServices: 4,
        namespaces: 3
      }
    }
  },
  methods: {
    async loadStats() {
      try {
        // TODO: Inserir backend - carregar estatísticas
        console.log('Carregando estatísticas do cluster...');
        
        // Em produção, aqui seria:
        // const response = await fetch('/api/stats');
        // this.stats = await response.json();
        
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        // TODO: Inserir backend - tratamento de erro
      }
    }
  },
  mounted() {
    this.loadStats();
  }
}
</script>

<style scoped>
.home {
  max-width: 100%;
}

.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  padding: 3rem 0;
  margin-bottom: 4rem;
}

.hero-content h1 {
  font-size: 3.5rem;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #718096;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.k8s-logo {
  font-size: 8rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.features-section,
.stats-section {
  margin-bottom: 4rem;
}

.features-section h2,
.stats-section h2 {
  text-align: center;
  font-size: 2.5rem;
  color: #2d3748;
  margin-bottom: 3rem;
  font-weight: 700;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: #2d3748;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.feature-card p {
  color: #718096;
  line-height: 1.6;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 3rem;
  font-weight: 800;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #718096;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.9rem;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  font-size: 1rem;
}

.btn-large {
  padding: 1.25rem 2.5rem;
  font-size: 1.1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 2rem;
  }
  
  .hero-content h1 {
    font-size: 2.5rem;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .k8s-logo {
    font-size: 6rem;
  }
  
  .features-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .btn-large {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
}
</style>
