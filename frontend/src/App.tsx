import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Pods from './pages/Pods'
import Create from './pages/Create'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pods" element={<Pods />} />
        <Route path="/create" element={<Create />} />
      </Routes>
    </Router>
  )
}

export default App
