import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.tipo === 'admin'
  const isProfissional = ['professor', 'reforco', 'banho', 'almoco'].includes(usuario?.tipo)
  const isResponsavel = usuario?.tipo === 'responsavel'

  return (
    <div className="sidebar p-3">
      <nav className="nav flex-column">
        <NavLink to="/" end className="nav-link">
          📊 Dashboard
        </NavLink>

        {isProfissional && (
          <NavLink to="/avaliacoes" className="nav-link">
            📝 Avaliações do dia
          </NavLink>
        )}

        {isAdmin && (
          <>
            <NavLink to="/alunos" className="nav-link">
              🎒 Alunos
            </NavLink>
            <NavLink to="/responsaveis" className="nav-link">
              👨‍👩‍👧 Responsáveis
            </NavLink>
            <NavLink to="/profissionais" className="nav-link">
              🧑‍🏫 Profissionais
            </NavLink>
            <NavLink to="/turmas" className="nav-link">
              🏫 Turmas
            </NavLink>
          </>
        )}

        {isResponsavel && (
          <NavLink to="/meus-filhos" className="nav-link">
            🎒 Meus Filhos
          </NavLink>
        )}

        <NavLink to="/historico" className="nav-link">
          📚 Histórico
        </NavLink>

        <NavLink to="/perfil" className="nav-link">
          ⚙️ Meu Perfil
        </NavLink>
      </nav>
    </div>
  )
}

