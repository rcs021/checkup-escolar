import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import Alerta from '../../components/Alerta'

export default function AlunoForm() {
  const { id } = useParams()
  const editando = !!id
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [turmaId, setTurmaId] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [foto, setFoto] = useState(null)
  const [fotoAtual, setFotoAtual] = useState(null)
  const [turmas, setTurmas] = useState([])
  const [responsaveis, setResponsaveis] = useState([])
  const [responsaveisSelecionados, setResponsaveisSelecionados] = useState([])
  const [alerta, setAlerta] = useState({ tipo: '', mensagem: '' })

  useEffect(() => {
    api.get('/turmas').then((r) => setTurmas(r.data))
    api.get('/responsaveis').then((r) => setResponsaveis(r.data))

    if (editando) {
      api.get(`/alunos/${id}`).then((r) => {
        const aluno = r.data
        setNome(aluno.nome)
        setTurmaId(aluno.turma_id || '')
        setObservacoes(aluno.observacoes || '')
        setFotoAtual(aluno.foto)
        setResponsaveisSelecionados(aluno.responsaveis.map((resp) => resp.id))
      })
    }
    // eslint-disable-next-line
  }, [id])

  function alternarResponsavel(respId) {
    setResponsaveisSelecionados((atual) =>
      atual.includes(respId) ? atual.filter((r) => r !== respId) : [...atual, respId]
    )
  }

  async function salvar(e) {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('nome', nome)
      formData.append('turma_id', turmaId)
      formData.append('observacoes', observacoes)
      formData.append('responsaveis', JSON.stringify(responsaveisSelecionados))
      if (foto) formData.append('foto', foto)

      if (editando) {
        await api.put(`/alunos/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        await api.post('/alunos', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      navigate('/alunos')
    } catch (err) {
      setAlerta({ tipo: 'erro', mensagem: err.response?.data?.erro || 'Erro ao salvar aluno' })
    }
  }

  return (
    <Layout>
      <h3 className="mb-3">{editando ? 'Editar Aluno' : 'Novo Aluno'}</h3>
      <Alerta tipo={alerta.tipo} mensagem={alerta.mensagem} onFechar={() => setAlerta({ tipo: '', mensagem: '' })} />

      <div className="card card-dashboard p-4">
        <form onSubmit={salvar}>
          <div className="row">
            <div className="col-md-8">
              <div className="mb-3">
                <label className="form-label">Nome do aluno</label>
                <input className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Turma</label>
                <select className="form-select" value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
                  <option value="">Selecione uma turma</option>
                  {turmas.map((t) => (
                    <option key={t.id} value={t.id}>{t.nome}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Observações</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label">Responsáveis vinculados</label>
                <div className="border rounded p-2" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  {responsaveis.map((r) => (
                    <div className="form-check" key={r.id}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={responsaveisSelecionados.includes(r.id)}
                        onChange={() => alternarResponsavel(r.id)}
                        id={`resp-${r.id}`}
                      />
                      <label className="form-check-label" htmlFor={`resp-${r.id}`}>
                        {r.nome} ({r.parentesco})
                      </label>
                    </div>
                  ))}
                  {responsaveis.length === 0 && <p className="text-secondary mb-0">Nenhum responsável cadastrado</p>}
                </div>
              </div>
            </div>

            <div className="col-md-4 text-center">
              <label className="form-label d-block">Foto do aluno</label>
              <img
                src={
                  foto
                    ? URL.createObjectURL(foto)
                    : fotoAtual
                    ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${fotoAtual}`
                    : 'https://via.placeholder.com/100'
                }
                className="foto-preview mb-2"
                alt="Prévia"
              />
              <input
                type="file"
                accept="image/png, image/jpeg"
                className="form-control"
                onChange={(e) => setFoto(e.target.files[0])}
              />
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button type="submit" className="btn btn-primary">Salvar</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/alunos')}>Cancelar</button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
