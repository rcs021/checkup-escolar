import { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem('usuario')
    return salvo ? JSON.parse(salvo) : null
  })

  // Efetua login e guarda token + dados do usuário
  async function login(usuarioLogin, senha) {
    const resposta = await api.post('/auth/login', { usuario: usuarioLogin, senha })
    localStorage.setItem('token', resposta.data.token)
    localStorage.setItem('usuario', JSON.stringify(resposta.data.usuario))
    setUsuario(resposta.data.usuario)
    return resposta.data.usuario
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
