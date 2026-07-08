import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'

export default function Dashboard() {
  const { usuario } = useAuth()

  if (usuario.tipo === 'responsavel') {
    return <Navigate to="/meus-filhos" replace />
  }

  return <DashboardConteudo usuario={usuario} />
}

function DashboardConteudo({ usuario }) {
  const [dados, setDados] = useState(null)
  const [alunosHoje, setAlunosHoje] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    setCarregando(true)
    try {
      if (usuario.tipo === 'admin') {
        const resposta = await api.get('/dashboard/admin')
        setDados(resposta.data)
      } else {
        const resposta = await api.get('/dashboard/profissional')
        setDados(resposta.data)
        const hoje = await api.get('/avaliacoes/hoje')
        setAlunosHoje(hoje.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setCarregando(false)
    }
  }

  const dataHoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-0">Dashboard</h3>
          <p className="text-secondary mb-0">Aqui está o resumo do dia.</p>
        </div>
        <span className="badge bg-light text-dark border">{dataHoje}</span>
      </div>

      {carregando && <p>Carregando...</p>}

      {!carregando && dados && usuario.tipo === 'admin' && (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card card-dashboard p-3">
              <span className="text-secondary small">Alunos cadastrados</span>
              <h2 className="mb-0">{dados.total_alunos}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card card-dashboard p-3">
              <span className="text-secondary small">Profissionais</span>
              <h2 className="mb-0">{dados.total_profissionais}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card card-dashboard p-3">
              <span className="text-secondary small">Avaliações de hoje</span>
              <h2 className="mb-0">{dados.avaliacoes_hoje}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card card-dashboard p-3">
              <span className="text-secondary small">Concluídas hoje</span>
              <h2 className="mb-0 text-success">{dados.avaliacoes_concluidas_hoje}</h2>
            </div>
          </div>
        </div>
      )}

      {!carregando && dados && usuario.tipo !== 'admin' && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card card-dashboard p-3">
                <span className="text-secondary small">Alunos da turma</span>
                <h2 className="mb-0">{dados.total_alunos_turma}</h2>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card card-dashboard p-3">
                <span className="text-secondary small">Avaliações pendentes</span>
                <h2 className="mb-0 text-warning">{dados.avaliacoes_pendentes}</h2>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card card-dashboard p-3">
                <span className="text-secondary small">Avaliações concluídas</span>
                <h2 className="mb-0 text-success">{dados.avaliacoes_concluidas}</h2>
              </div>
            </div>
          </div>

          <div className="card card-dashboard">
            <div className="card-body">
              <h5 className="card-title mb-3">Minhas Avaliações de Hoje</h5>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Aluno</th>
                      <th>Turma</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {alunosHoje.map((item) => (
                      <tr key={item.aluno_id}>
                        <td className="d-flex align-items-center gap-2">
                          <img
                            src={item.foto ? `${import.meta.env.VITE_API_URL.replace('/api','')}${item.foto}` : 'https://via.placeholder.com/42'}
                            className="foto-aluno"
                            alt={item.aluno_nome}
                          />
                          {item.aluno_nome}
                        </td>
                        <td>{item.turma_nome}</td>
                        <td>
                          {item.status === 'concluida' ? (
                            <span className="badge badge-concluida">Concluída</span>
                          ) : (
                            <span className="badge badge-pendente">Pendente</span>
                          )}
                        </td>
                        <td>
                          <Link
                            to={`/avaliacoes/formulario/${item.aluno_id}`}
                            className="btn btn-sm btn-primary"
                          >
                            {item.status === 'concluida' ? 'Ver' : 'Preencher'}
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {alunosHoje.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center text-secondary">
                          Nenhum aluno encontrado na sua turma.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}
