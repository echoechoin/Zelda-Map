import { useState } from 'react'
import MapComponent from "./components/MapComponent.jsx";
import Catalog from "./components/Catalog.jsx";
import './App.css'

function App() {
  return (
    <>
      <MapComponent />
      <Catalog style={{ width: '300px', height: '100vh', position: 'fixed', top: 0, right: 0, backgroundColor: 'white'}}/>
    </>
  )
}

export default App
