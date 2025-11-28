import { useState } from 'react'

import './App.css'
import HomePage from './home'
import { Route, Routes } from 'react-router-dom'
import JoinPage from './pages/join'
import MeetingPage from './component/meetingPage'
import MeetingPage1 from './pages/meeting'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
  
   <Routes>
       <Route path="/" element={<HomePage />} />
        <Route path="/meeting" element={<MeetingPage1 />} />
        <Route path="/join" element={<JoinPage />} />
       
      <Route
          path="/meeting/:meetingId"
          element={<MeetingPage />}
        />
        </Routes>
    </>
  )
}

export default App
