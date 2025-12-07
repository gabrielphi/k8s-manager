import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Pods from './pages/Pods'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pods" element={<Pods />} />
      </Routes>
    </Router>
  )
}

export default App
