import { useEffect, useState } from 'react'
import api from '../api/axios'
import Layout from '../components/Layout'
import Alerta from '../components/Alerta'

const nomesTipo = {
  professor: { titulo: 'Professor', icone: '👤' },
  reforco: { titulo: 'Reforço Escolar', icone: '📘' },
  banho: { titulo: 'Banho', icone: '🚿' },
  almoco: { titulo: 'Almoço', icone: '🍽️' }
}

export default function MeusFilhos() {
  const [alunos, setAlunos] = useState([])
  const [alunoSelecionado, setAlunoSelecionado] = useState(null)
  const [resumo, setResumo] = useState([])
  const [alerta, setAlerta] = useState({ tipo: '', mensagem: '' })
  const [carregandoResumo, setCarregandoResumo] = useState(false)

  useEffect(() => {
    api.get('/responsaveis/meus-alunos').then((r) => {
      setAlunos(r.data)
      if (r.data.length > 0) setAlunoSelecionado(r.data[0].id)
    }).catch(() => setAlerta({ tipo: 'erro', mensagem: 'Erro ao carregar seus alunos' }))
  }, [])

  useEffect(() => {
    if (alunoSelecionado) carregarResumo(alunoSelecionado)
    // eslint-disable-next-line
  }, [alunoSelecionado])

  async function carregarResumo(alunoId) {
    setCarregandoResumo(true)
    try {
      const resposta = await api.get(`/avaliacoes/resumo/${alunoId}`)
      setResumo(resposta.data)
    } catch (err) {
      setAlerta({ tipo: 'erro', mensagem: 'Erro ao carregar resumo do dia' })
    } finally {
      setCarregandoResumo(false)
    }
  }

  function renderizarDetalhe(avaliacao) {
    const d = avaliacao.detalhes || {}
    if (avaliacao.tipo === 'professor') {
      return (
        <>
          <p className="mb-1"><strong>Participação:</strong> {d.participacao || '-'}</p>
          <p className="mb-1"><strong>Aprendizado:</strong> {d.aprendizado || '-'}</p>
          <p className="mb-1"><strong>Comportamento:</strong> {d.comportamento || '-'}</p>
        </>
      )
    }
    if (avaliacao.tipo === 'reforco') {
      return (
        <>
          <p className="mb-1"><strong>Atividades:</strong> {d.atividades || '-'}</p>
          <p className="mb-1"><strong>Dificuldades:</strong> {d.dificuldades || '-'}</p>
          <p className="mb-1"><strong>Evolução:</strong> {d.evolucao || '-'}</p>
        </>
      )
    }
    if (avaliacao.tipo === 'banho') {
      return (
        <>
          <p className="mb-1"><strong>Tomou banho:</strong> {d.tomou_banho ? 'Sim' : 'Não'}</p>
          <p className="mb-1"><strong>Precisou de ajuda:</strong> {d.precisou_ajuda ? 'Sim' : 'Não'}</p>
          <p className="mb-1"><strong>Comportamento:</strong> {d.comportamento || '-'}</p>
        </>
      )
    }
    if (avaliacao.tipo === 'almoco') {
      return (
        <>
          <p className="mb-1"><strong>Comeu bem:</strong> {d.comeu_bem ? 'Sim' : 'Não'}</p>
          <p className="mb-1"><strong>Quantidade:</strong> {d.quantidade || '-'}</p>
          <p className="mb-1"><strong>Alimento recusado:</strong> {d.recusou_alimento || '-'}</p>
        </>
      )
    }
    return null
  }

  const alunoAtual = alunos.find((a) => a.id === alunoSelecionado)

  return (
    <Layout>
      <h3 className="mb-3">Resumo do dia</h3>
      <Alerta tipo={alerta.tipo} mensagem={alerta.mensagem} onFechar={() => setAlerta({ tipo: '', mensagem: '' })} />

      {alunos.length > 1 && (
        <div className="mb-3" style={{ maxWidth: '300px' }}>
          <select className="form-select" value={alunoSelecionado || ''} onChange={(e) => setAlunoSelecionado(parseInt(e.target.value))}>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>{a.nome}</option>
            ))}
          </select>
        </div>
      )}

      {alunoAtual && (
        <div className="card card-dashboard p-4 mb-3">
          <div className="d-flex align-items-center gap-3">
            <img
              src={alunoAtual.foto ? `${import.meta.env.VITE_API_URL.replace('/api','')}${alunoAtual.foto}` : 'https://via.placeholder.com/60'}
              className="foto-aluno"
              style={{ width: '60px', height: '60px' }}
              alt={alunoAtual.nome}
            />
            <div>
              <h5 className="mb-0">{alunoAtual.nome}</h5>
              <span className="text-secondary small">{alunoAtual.turma_nome}</span>
            </div>
          </div>
        </div>
      )}

      {carregandoResumo && <p>Carregando resumo do dia...</p>}

      <div className="row g-3">
        {resumo.map((avaliacao) => (
          <div className="col-md-6" key={avaliacao.id}>
            <div className="card card-dashboard p-3 h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">{nomesTipo[avaliacao.tipo]?.icone} {nomesTipo[avaliacao.tipo]?.titulo}</h6>
                <span className={`badge ${avaliacao.status === 'concluida' ? 'badge-concluida' : 'badge-pendente'}`}>
                  {avaliacao.status === 'concluida' ? 'Concluída' : 'Pendente'}
                </span>
              </div>
              {renderizarDetalhe(avaliacao)}
              {avaliacao.observacoes && <p className="mb-1"><strong>Observações:</strong> {avaliacao.observacoes}</p>}
              {avaliacao.fotos && avaliacao.fotos.length > 0 && (
                <div className="d-flex gap-2 flex-wrap mt-2">
                  {avaliacao.fotos.map((f) => (
                    <img key={f.id} src={`${import.meta.env.VITE_API_URL.replace('/api','')}${f.caminho}`} className="foto-preview" style={{ width: '70px', height: '70px' }} alt="foto" />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {!carregandoResumo && resumo.length === 0 && (
          <p className="text-secondary">Nenhuma avaliação registrada hoje ainda.</p>
        )}
      </div>
    </Layout>
  )
}
