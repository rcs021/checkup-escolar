import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const nomesCargo = {
  admin: 'Administrador',
  professor: 'Professor(a)',
  reforco: 'Prof. de Reforço',
  banho: 'Cuidador(a) - Banho',
  almoco: 'Nutricionista - Almoço',
  responsavel: 'Responsável'
}

export default function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-light bg-white border-bottom px-3 py-2 shadow-sm">
      <span className="navbar-brand-logo fs-4">✅ CheckUp Escolar</span>
      <div className="d-flex align-items-center gap-3">
        {usuario && (
          <span className="text-secondary small">
            Olá, <strong>{usuario.nome}</strong>{' '}
            <span className="badge bg-light text-dark border">{nomesCargo[usuario.tipo] || usuario.tipo}</span>
          </span>
        )}
        <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </nav>
  )
}
