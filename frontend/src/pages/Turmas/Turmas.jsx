import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import Alerta from '../../components/Alerta'
import ModalConfirmacao from '../../components/ModalConfirmacao'

export default function Turmas() {
  const [turmas, setTurmas] = useState([])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [turmaEditando, setTurmaEditando] = useState(null)
  const [nome, setNome] = useState('')
  const [turno, setTurno] = useState('Integral')
  const [alerta, setAlerta] = useState({ tipo: '', mensagem: '' })
  const [turmaExcluir, setTurmaExcluir] = useState(null)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    try {
      const resposta = await api.get('/turmas')
      setTurmas(resposta.data)
    } catch (err) {
      setAlerta({ tipo: 'erro', mensagem: 'Erro ao carregar turmas' })
    }
  }

  function abrirNovo() {
    setTurmaEditando(null)
    setNome('')
    setTurno('Integral')
    setMostrarModal(true)
  }

  function abrirEdicao(turma) {
    setTurmaEditando(turma)
    setNome(turma.nome)
    setTurno(turma.turno || '')
    setMostrarModal(true)
  }

  async function salvar(e) {
    e.preventDefault()
    try {
      if (turmaEditando) {
        await api.put(`/turmas/${turmaEditando.id}`, { nome, turno })
        setAlerta({ tipo: 'sucesso', mensagem: 'Turma atualizada com sucesso' })
      } else {
        await api.post('/turmas', { nome, turno })
        setAlerta({ tipo: 'sucesso', mensagem: 'Turma cadastrada com sucesso' })
      }
      setMostrarModal(false)
      carregar()
    } catch (err) {
      setAlerta({ tipo: 'erro', mensagem: err.response?.data?.erro || 'Erro ao salvar turma' })
    }
  }

  async function confirmarExclusao() {
    try {
      await api.delete(`/turmas/${turmaExcluir.id}`)
      setAlerta({ tipo: 'sucesso', mensagem: 'Turma excluída com sucesso' })
      setTurmaExcluir(null)
      carregar()
    } catch (err) {
      setAlerta({ tipo: 'erro', mensagem: err.response?.data?.erro || 'Erro ao excluir turma' })
      setTurmaExcluir(null)
    }
  }

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Turmas</h3>
        <button className="btn btn-primary" onClick={abrirNovo}>+ Nova Turma</button>
      </div>

      <Alerta tipo={alerta.tipo} mensagem={alerta.mensagem} onFechar={() => setAlerta({ tipo: '', mensagem: '' })} />

      <div className="card card-dashboard">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Turno</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {turmas.map((t) => (
                <tr key={t.id}>
                  <td>{t.nome}</td>
                  <td>{t.turno}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => abrirEdicao(t)}>Editar</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setTurmaExcluir(t)}>Excluir</button>
                  </td>
                </tr>
              ))}
              {turmas.length === 0 && (
                <tr><td colSpan="3" className="text-center text-secondary py-3">Nenhuma turma cadastrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mostrarModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={salvar}>
                <div className="modal-header">
                  <h5 className="modal-title">{turmaEditando ? 'Editar Turma' : 'Nova Turma'}</h5>
                  <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nome da turma</label>
                    <input className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Turno</label>
                    <input className="form-control" value={turno} onChange={(e) => setTurno(e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ModalConfirmacao
        show={!!turmaExcluir}
        titulo="Excluir turma"
        mensagem={`Deseja realmente excluir a turma "${turmaExcluir?.nome}"?`}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setTurmaExcluir(null)}
      />
    </Layout>
  )
}
