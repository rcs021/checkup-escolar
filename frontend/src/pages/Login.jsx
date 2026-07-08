import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      await login(usuario, senha)
      navigate('/')
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao efetuar login')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-sm" style={{ width: '380px' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h2 className="navbar-brand-logo">✅ CheckUp Escolar</h2>
            <p className="text-secondary mb-0">Bem-vindo de volta! 👋</p>
            <small className="text-muted">Faça login para continuar</small>
          </div>

          {erro && <div className="alert alert-danger py-2">{erro}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Usuário</label>
              <input
                type="text"
                className="form-control"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="seu usuário de acesso"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Senha</label>
              <input
                type="password"
                className="form-control"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button className="btn btn-primary w-100" type="submit" disabled={carregando}>
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="text-center mt-3">
            <small className="text-muted">
              Usuários de teste (senha: 123456): admin, ana.professora, carlos.reforco, marta.banho, paulo.almoco
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}
