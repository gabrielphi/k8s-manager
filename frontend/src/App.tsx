import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Pods from './pages/Pods'
import Create from './pages/Create'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pods" element={<Pods />} />
          <Route path="/create" element={<Create />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
