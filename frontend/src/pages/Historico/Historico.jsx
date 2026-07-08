import { useEffect, useState, Fragment } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import Alerta from '../../components/Alerta'

const nomesTipo = {
  professor: 'Professor',
  reforco: 'Reforço Escolar',
  banho: 'Banho',
  almoco: 'Almoço'
}

export default function Historico() {
  const { usuario } = useAuth()
  const [resultados, setResultados] = useState([])
  const [alunos, setAlunos] = useState([])
  const [turmas, setTurmas] = useState([])
  const [filtros, setFiltros] = useState({ aluno_id: '', turma_id: '', tipo: '', data_inicio: '', data_fim: '' })
  const [alerta, setAlerta] = useState({ tipo: '', mensagem: '' })
  const [detalheAberto, setDetalheAberto] = useState(null)

  const isAdmin = usuario.tipo === 'admin'
  const isResponsavel = usuario.tipo === 'responsavel'

  useEffect(() => {
    if (isAdmin) {
      api.get('/alunos').then((r) => setAlunos(r.data))
      api.get('/turmas').then((r) => setTurmas(r.data))
    } else if (isResponsavel) {
      api.get('/responsaveis/meus-alunos').then((r) => setAlunos(r.data))
    }
    buscar()
    // eslint-disable-next-line
  }, [])

  async function buscar() {
    try {
      const params = {}
      Object.keys(filtros).forEach((chave) => {
        if (filtros[chave]) params[chave] = filtros[chave]
      })
      const resposta = await api.get('/avaliacoes/historico', { params })
      setResultados(resposta.data)
    } catch (err) {
      setAlerta({ tipo: 'erro', mensagem: 'Erro ao buscar histórico' })
    }
  }

  function handleFiltro(e) {
    e.preventDefault()
    buscar()
  }

  return (
    <Layout>
      <h3 className="mb-3">Histórico de Avaliações</h3>
      <Alerta tipo={alerta.tipo} mensagem={alerta.mensagem} onFechar={() => setAlerta({ tipo: '', mensagem: '' })} />

      <div className="card card-dashboard p-3 mb-3">
        <form className="row g-2" onSubmit={handleFiltro}>
          {(isAdmin || isResponsavel) && (
            <div className="col-md-3">
              <label className="form-label small">Aluno</label>
              <select className="form-select" value={filtros.aluno_id} onChange={(e) => setFiltros({ ...filtros, aluno_id: e.target.value })}>
                <option value="">Todos</option>
                {alunos.map((a) => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
              </select>
            </div>
          )}
          {isAdmin && (
            <div className="col-md-3">
              <label className="form-label small">Turma</label>
              <select className="form-select" value={filtros.turma_id} onChange={(e) => setFiltros({ ...filtros, turma_id: e.target.value })}>
                <option value="">Todas</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </div>
          )}
          <div className="col-md-2">
            <label className="form-label small">Tipo</label>
            <select className="form-select" value={filtros.tipo} onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}>
              <option value="">Todos</option>
              <option value="professor">Professor</option>
              <option value="reforco">Reforço</option>
              <option value="banho">Banho</option>
              <option value="almoco">Almoço</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label small">De</label>
            <input type="date" className="form-control" value={filtros.data_inicio} onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })} />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Até</label>
            <input type="date" className="form-control" value={filtros.data_fim} onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })} />
          </div>
          <div className="col-12">
            <button className="btn btn-primary btn-sm" type="submit">Filtrar</button>
          </div>
        </form>
      </div>

      <div className="card card-dashboard">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Data</th>
                <th>Aluno</th>
                <th>Tipo</th>
                <th>Profissional</th>
                <th>Status</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((av) => (
                <Fragment key={av.id}>
                  <tr>
                    <td>{new Date(av.data).toLocaleDateString('pt-BR')}</td>
                    <td>{av.aluno_nome}</td>
                    <td>{nomesTipo[av.tipo]}</td>
                    <td>{av.profissional_nome}</td>
                    <td>
                      {av.status === 'concluida' ? (
                        <span className="badge badge-concluida">Concluída</span>
                      ) : (
                        <span className="badge badge-pendente">Pendente</span>
                      )}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setDetalheAberto(detalheAberto === av.id ? null : av.id)}
                      >
                        {detalheAberto === av.id ? 'Ocultar' : 'Ver'}
                      </button>
                    </td>
                  </tr>
                  {detalheAberto === av.id && (
                    <tr>
                      <td colSpan="6" className="bg-light">
                        <p className="mb-1"><strong>Observações:</strong> {av.observacoes || 'Nenhuma'}</p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {resultados.length === 0 && (
                <tr><td colSpan="6" className="text-center text-secondary py-3">Nenhum registro encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
