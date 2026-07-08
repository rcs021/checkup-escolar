import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import Alerta from '../../components/Alerta'
import ModalConfirmacao from '../../components/ModalConfirmacao'

const vazio = { nome: '', usuario: '', email: '', senha: '', cargo: '', tipo: 'professor', turma_id: '', ativo: true }

const tiposLabel = {
  professor: 'Professor',
  reforco: 'Reforço Escolar',
  banho: 'Banho',
  almoco: 'Almoço'
}

export default function Profissionais() {
  const [lista, setLista] = useState([])
  const [turmas, setTurmas] = useState([])
  const [busca, setBusca] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(vazio)
  const [alerta, setAlerta] = useState({ tipo: '', mensagem: '' })
  const [excluir, setExcluir] = useState(null)

  useEffect(() => {
    api.get('/turmas').then((r) => setTurmas(r.data))
    carregar()
    // eslint-disable-next-line
  }, [busca])

  async function carregar() {
    try {
      const resposta = await api.get('/profissionais', { params: busca ? { busca } : {} })
      setLista(resposta.data)
    } catch (err) {
      setAlerta({ tipo: 'erro', mensagem: 'Erro ao carregar profissionais' })
    }
  }

  function abrirNovo() {
    setEditando(null)
    setForm(vazio)
    setMostrarModal(true)
  }

  function abrirEdicao(item) {
    setEditando(item)
    setForm({ ...item, senha: '' })
    setMostrarModal(true)
  }

  async function salvar(e) {
    e.preventDefault()
    try {
      if (editando) {
        await api.put(`/profissionais/${editando.id}`, form)
        setAlerta({ tipo: 'sucesso', mensagem: 'Profissional atualizado com sucesso' })
      } else {
        await api.post('/profissionais', form)
        setAlerta({ tipo: 'sucesso', mensagem: 'Profissional cadastrado com sucesso' })
      }
      setMostrarModal(false)
      carregar()
    } catch (err) {
      setAlerta({ tipo: 'erro', mensagem: err.response?.data?.erro || 'Erro ao salvar profissional' })
    }
  }

  async function confirmarExclusao() {
    try {
      await api.delete(`/profissionais/${excluir.id}`)
      setAlerta({ tipo: 'sucesso', mensagem: 'Profissional excluído com sucesso' })
      setExcluir(null)
      carregar()
    } catch (err) {
      setAlerta({ tipo: 'erro', mensagem: 'Erro ao excluir profissional' })
      setExcluir(null)
    }
  }

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Profissionais</h3>
        <button className="btn btn-primary" onClick={abrirNovo}>+ Novo Profissional</button>
      </div>

      <Alerta tipo={alerta.tipo} mensagem={alerta.mensagem} onFechar={() => setAlerta({ tipo: '', mensagem: '' })} />

      <div className="card card-dashboard p-3 mb-3">
        <input className="form-control" placeholder="Buscar profissional..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      <div className="card card-dashboard">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Usuário</th>
                <th>Cargo</th>
                <th>Tipo de formulário</th>
                <th>Turma</th>
                <th>Situação</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id}>
                  <td>{p.nome}</td>
                  <td>{p.usuario}</td>
                  <td>{p.cargo}</td>
                  <td>{tiposLabel[p.tipo] || p.tipo}</td>
                  <td>{p.turma_nome || '-'}</td>
                  <td>{p.ativo ? <span className="badge bg-success">Ativo</span> : <span className="badge bg-secondary">Inativo</span>}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => abrirEdicao(p)}>Editar</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setExcluir(p)}>Excluir</button>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr><td colSpan="7" className="text-center text-secondary py-3">Nenhum profissional encontrado</td></tr>
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
                  <h5 className="modal-title">{editando ? 'Editar Profissional' : 'Novo Profissional'}</h5>
                  <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
                </div>
                <div className="modal-body row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nome</label>
                    <input className="form-control" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Cargo</label>
                    <input className="form-control" value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Usuário de acesso</label>
                    <input className="form-control" value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">E-mail</label>
                    <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Senha {editando && '(deixe em branco para manter a atual)'}</label>
                    <input type="password" className="form-control" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} required={!editando} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Tipo de formulário</label>
                    <select className="form-select" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                      <option value="professor">Professor</option>
                      <option value="reforco">Reforço Escolar</option>
                      <option value="banho">Banho</option>
                      <option value="almoco">Almoço</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Turma</label>
                    <select className="form-select" value={form.turma_id || ''} onChange={(e) => setForm({ ...form, turma_id: e.target.value })}>
                      <option value="">Nenhuma</option>
                      {turmas.map((t) => (
                        <option key={t.id} value={t.id}>{t.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Situação</label>
                    <select className="form-select" value={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.value === 'true' })}>
                      <option value="true">Ativo</option>
                      <option value="false">Inativo</option>
                    </select>
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
        titulo="Excluir profissional"
        mensagem={`Deseja realmente excluir "${excluir?.nome}"?`}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluir(null)}
      />
    </Layout>
  )
}
