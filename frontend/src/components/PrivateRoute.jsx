import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Protege rotas que exigem autenticação. Se "perfis" for informado,
// só permite acesso caso o tipo do usuário esteja na lista.
export default function PrivateRoute({ children, perfis }) {
  const { usuario } = useAuth()

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (perfis && !perfis.includes(usuario.tipo)) {
    return <Navigate to="/" replace />
  }

  return children
}
