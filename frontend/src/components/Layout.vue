<template>
  <div class="layout">
    <!-- Menu Lateral -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="sidebar-header">
        <h2 class="logo">K8s Manager</h2>
        <button 
          class="toggle-btn" 
          @click="toggleSidebar"
          :class="{ 'collapsed': sidebarCollapsed }"
        >
          <span class="hamburger"></span>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item">
            <router-link 
              to="/" 
              class="nav-link"
              :class="{ 'active': $route.path === '/' }"
            >
              <span class="nav-icon">🏠</span>
              <span class="nav-text" v-show="!sidebarCollapsed">Home</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link 
              to="/listar" 
              class="nav-link"
              :class="{ 'active': $route.path === '/listar' }"
            >
              <span class="nav-icon">📋</span>
              <span class="nav-text" v-show="!sidebarCollapsed">Listar</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link 
              to="/criar" 
              class="nav-link"
              :class="{ 'active': $route.path === '/criar' }"
            >
              <span class="nav-icon">➕</span>
              <span class="nav-text" v-show="!sidebarCollapsed">Criar</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link 
              to="/deletar" 
              class="nav-link"
              :class="{ 'active': $route.path === '/deletar' }"
            >
              <span class="nav-icon">🗑️</span>
              <span class="nav-text" v-show="!sidebarCollapsed">Deletar</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Conteúdo Principal -->
    <main class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="content-wrapper">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'Layout',
  data() {
    return {
      sidebarCollapsed: false
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    }
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #1a202c;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  color: #e2e8f0;
  transition: all 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
  position: fixed;
  height: 100vh;
  z-index: 1000;
  border-right: 1px solid #4a5568;
}

.sidebar-collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #4a5568;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  transition: opacity 0.3s ease;
}

.sidebar-collapsed .logo {
  opacity: 0;
}

.toggle-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.hamburger {
  display: block;
  width: 20px;
  height: 2px;
  background-color: white;
  position: relative;
  transition: all 0.3s ease;
}

.hamburger::before,
.hamburger::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: white;
  transition: all 0.3s ease;
}

.hamburger::before {
  top: -6px;
}

.hamburger::after {
  top: 6px;
}

.toggle-btn.collapsed .hamburger {
  transform: rotate(45deg);
}

.toggle-btn.collapsed .hamburger::before {
  transform: rotate(90deg);
  top: 0;
}

.toggle-btn.collapsed .hamburger::after {
  opacity: 0;
}

/* Navigation */
.sidebar-nav {
  padding: 1rem 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin: 0.5rem 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: #a0aec0;
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 0 25px 25px 0;
  margin-right: 1rem;
}

.nav-link:hover {
  background-color: #4a5568;
  color: #e2e8f0;
  transform: translateX(5px);
}

.nav-link.active {
  background-color: #667eea;
  color: white;
  font-weight: bold;
}

.nav-icon {
  font-size: 1.2rem;
  margin-right: 1rem;
  min-width: 20px;
}

.nav-text {
  transition: opacity 0.3s ease;
}

.sidebar-collapsed .nav-text {
  opacity: 0;
  width: 0;
}

/* Main Content */
.main-content {
  margin-left: 250px;
  flex: 1;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
}

.main-content.sidebar-collapsed {
  margin-left: 70px;
}

.content-wrapper {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .main-content.sidebar-collapsed {
    margin-left: 0;
  }
}
</style>
