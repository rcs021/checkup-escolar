import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import Alerta from '../../components/Alerta'
import ModalConfirmacao from '../../components/ModalConfirmacao'

export default function Alunos() {
  const [alunos, setAlunos] = useState([])
  const [turmas, setTurmas] = useState([])
  const [busca, setBusca] = useState('')
  const [turmaFiltro, setTurmaFiltro] = useState('')
  const [alerta, setAlerta] = useState({ tipo: '', mensagem: '' })
  const [alunoExcluir, setAlunoExcluir] = useState(null)

  useEffect(() => {
    api.get('/turmas').then((r) => setTurmas(r.data))
  }, [])

  useEffect(() => {
    carregar()
    // eslint-disable-next-line
  }, [busca, turmaFiltro])

  async function carregar() {
    try {
      const params = {}
      if (busca) params.busca = busca
      if (turmaFiltro) params.turma_id = turmaFiltro
      const resposta = await api.get('/alunos', { params })
      setAlunos(resposta.data)
    } catch (err) {
      setAlerta({ tipo: 'erro', mensagem: 'Erro ao carregar alunos' })
    }
  }

  async function confirmarExclusao() {
    try {
      await api.delete(`/alunos/${alunoExcluir.id}`)
      setAlerta({ tipo: 'sucesso', mensagem: 'Aluno excluído com sucesso' })
      setAlunoExcluir(null)
      carregar()
    } catch (err) {
      setAlerta({ tipo: 'erro', mensagem: 'Erro ao excluir aluno' })
      setAlunoExcluir(null)
    }
  }

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Alunos</h3>
        <Link to="/alunos/novo" className="btn btn-primary">+ Novo Aluno</Link>
      </div>

      <Alerta tipo={alerta.tipo} mensagem={alerta.mensagem} onFechar={() => setAlerta({ tipo: '', mensagem: '' })} />

      <div className="card card-dashboard p-3 mb-3">
        <div className="row g-2">
          <div className="col-md-8">
            <input
              className="form-control"
              placeholder="Buscar aluno..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select className="form-select" value={turmaFiltro} onChange={(e) => setTurmaFiltro(e.target.value)}>
              <option value="">Todas as turmas</option>
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card card-dashboard">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Turma</th>
                <th>Responsáveis</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((a) => (
                <tr key={a.id}>
                  <td className="d-flex align-items-center gap-2">
                    <img
                      src={a.foto ? `${import.meta.env.VITE_API_URL.replace('/api','')}${a.foto}` : 'https://via.placeholder.com/42'}
                      className="foto-aluno"
                      alt={a.nome}
                    />
                    {a.nome}
                  </td>
                  <td>{a.turma_nome || '-'}</td>
                  <td>{a.responsaveis?.map((r) => r.nome).join(', ') || '-'}</td>
                  <td className="text-end">
                    <Link to={`/alunos/editar/${a.id}`} className="btn btn-sm btn-outline-primary me-2">Editar</Link>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setAlunoExcluir(a)}>Excluir</button>
                  </td>
                </tr>
              ))}
              {alunos.length === 0 && (
                <tr><td colSpan="4" className="text-center text-secondary py-3">Nenhum aluno encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalConfirmacao
        show={!!alunoExcluir}
        titulo="Excluir aluno"
        mensagem={`Deseja realmente excluir o aluno "${alunoExcluir?.nome}"?`}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setAlunoExcluir(null)}
      />
    </Layout>
  )
}
