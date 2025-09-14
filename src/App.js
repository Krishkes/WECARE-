import React from 'react'
import LoginPage from './components/login-page'
import Homepage from './components/homepage'

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      {isLoggedIn ? <Homepage /> : <LoginPage onLogin={handleLogin} />}
    </div>
  )
}
export default App;