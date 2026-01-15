import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Neighborhoods from './components/Neighborhoods'
import Addresses from './components/Addresses'
import Solutions from './components/Solutions'
import HealthProvider from './components/HealthProvider'
import Sources from './components/Sources'
import Reference from './components/Reference'
import HotNeighborhoods from './components/HotNeighborhoods'
import TornadoMap from './components/TornadoMap'
import './App.css'

function Dropdown({ label, children }: { label: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  // Close dropdown when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  return (
    <div 
      className="dropdown" 
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button 
        className="dropbtn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label} ▾
      </button>
      <div 
        className={`dropdown-content ${isOpen ? 'show' : ''}`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

function AppContent() {
  return (
    <div className="app">
      <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Neighborhoods />} />
            <Route path="/addresses" element={<Addresses />} />
            <Route path="/hot-neighborhoods" element={<HotNeighborhoods />} />
            <Route path="/tornado-map" element={<TornadoMap />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/health-provider" element={<HealthProvider />} />
            <Route path="/sources" element={<Sources />} />
            <Route path="/reference" element={<Reference />} />
          </Routes>
        </main>
      </div>
  )
}

function Navigation() {
  return (
    <nav className="nav">
      <div className="nav-container">
        <h1 className="nav-title">🛡️ Radon Canvas App</h1>
        <div className="nav-links">
          <Link to="/tornado-map" className="nav-link">Tornado Map</Link>
          <Dropdown label="Organize">
            <Link to="/hot-neighborhoods">Target Neighborhoods</Link>
            <Link to="/addresses">Household Information</Link>
            <Link to="/">Neighborhoods</Link>
          </Dropdown>
          <Dropdown label="Remediation">
            <Link to="/solutions">Solutions</Link>
            <Link to="/health-provider">Health Provider Resources</Link>
          </Dropdown>
          <Dropdown label="Information">
            <Link to="/sources">Sources</Link>
            <Link to="/reference">Reference</Link>
          </Dropdown>
        </div>
      </div>
    </nav>
  )
}

export default App
