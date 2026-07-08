import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import Alerta from '../../components/Alerta'
import ModalConfirmacao from '../../components/ModalConfirmacao'

const vazio = { nome: '', telefone: '', whatsapp: '', email: '', parentesco: '', preferencia_envio: 'final', forma_envio: 'email' }

export default function Responsaveis() {
  const [lista, setLista] = useState([])
  const [busca, setBusca] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(vazio)
  const [alerta, setAlerta] = useState({ tipo: '', mensagem: '' })
  const [excluir, setExcluir] = useState(null)

  useEffect(() => {
    carregar()
    // eslint-disable-next-line
  }, [busca])

  async function carregar() {
    try {
      const resposta = await api.get('/responsaveis', { params: busca ? { busca } : {} })
      setLista(resposta.data)
    } catch (err) {
      setAlerta({ tipo: 'erro', mensagem: 'Erro ao carregar responsáveis' })
    }
  }

  function abrirNovo() {
    setEditando(null)
    setForm(vazio)
    setMostrarModal(true)
  }

  function abrirEdicao(item) {
    setEditando(item)
    setForm(item)
    setMostrarModal(true)
  }

  async function salvar(e) {
    e.preventDefault()
    try {
      if (editando) {
        await api.put(`/responsaveis/${editando.id}`, form)
        setAlerta({ tipo: 'sucesso', mensagem: 'Responsável atualizado com sucesso' })
      } else {
        await api.post('/responsaveis', form)
        setAlerta({ tipo: 'sucesso', mensagem: 'Responsável cadastrado com sucesso' })
      }
      setMostrarModal(false)
      carregar()
    } catch (err) {
      setAlerta({ tipo: 'erro', mensagem: err.response?.data?.erro || 'Erro ao salvar responsável' })
    }
  }

  async function confirmarExclusao() {
    try {
      await api.delete(`/responsaveis/${excluir.id}`)
      setAlerta({ tipo: 'sucesso', mensagem: 'Responsável excluído com sucesso' })
      setExcluir(null)
      carregar()
    } catch (err) {
      setAlerta({ tipo: 'erro', mensagem: 'Erro ao excluir responsável' })
      setExcluir(null)
    }
  }

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Responsáveis</h3>
        <button className="btn btn-primary" onClick={abrirNovo}>+ Novo Responsável</button>
      </div>

      <Alerta tipo={alerta.tipo} mensagem={alerta.mensagem} onFechar={() => setAlerta({ tipo: '', mensagem: '' })} />

      <div className="card card-dashboard p-3 mb-3">
        <input className="form-control" placeholder="Buscar responsável..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      <div className="card card-dashboard">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Parentesco</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Preferência de envio</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((r) => (
                <tr key={r.id}>
                  <td>{r.nome}</td>
                  <td>{r.parentesco}</td>
                  <td>{r.email}</td>
                  <td>{r.telefone}</td>
                  <td>{r.preferencia_envio === 'etapa' ? 'A cada etapa' : 'Final do dia'}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => abrirEdicao(r)}>Editar</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setExcluir(r)}>Excluir</button>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr><td colSpan="6" className="text-center text-secondary py-3">Nenhum responsável encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mostrarModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={salvar}>
                <div className="modal-header">
                  <h5 className="modal-title">{editando ? 'Editar Responsável' : 'Novo Responsável'}</h5>
                  <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
                </div>
                <div className="modal-body row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nome</label>
                    <input className="form-control" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Parentesco</label>
                    <input className="form-control" value={form.parentesco} onChange={(e) => setForm({ ...form, parentesco: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">E-mail</label>
                    <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Telefone</label>
                    <input className="form-control" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">WhatsApp</label>
                    <input className="form-control" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Forma de envio</label>
                    <select className="form-select" value={form.forma_envio} onChange={(e) => setForm({ ...form, forma_envio: e.target.value })}>
                      <option value="email">E-mail</option>
                      <option value="whatsapp">WhatsApp (futuro)</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Quando deseja receber as avaliações?</label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="preferencia_envio"
                        checked={form.preferencia_envio === 'etapa'}
                        onChange={() => setForm({ ...form, preferencia_envio: 'etapa' })}
                        id="pref-etapa"
                      />
                      <label className="form-check-label" htmlFor="pref-etapa">
                        Por etapas (a cada profissional) - recebe o formulário assim que cada profissional finalizar
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="preferencia_envio"
                        checked={form.preferencia_envio === 'final'}
                        onChange={() => setForm({ ...form, preferencia_envio: 'final' })}
                        id="pref-final"
                      />
                      <label className="form-check-label" htmlFor="pref-final">
                        Somente no final do dia - recebe o relatório completo apenas ao final do dia
                      </label>
                    </div>
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
        show={!!excluir}
        titulo="Excluir responsável"
        mensagem={`Deseja realmente excluir "${excluir?.nome}"?`}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluir(null)}
      />
    </Layout>
  )
}
