import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import Alerta from '../../components/Alerta'

const tituloPorTipo = {
  professor: 'Avaliação do dia - Professor',
  reforco: 'Avaliação do dia - Reforço Escolar',
  banho: 'Avaliação do dia - Banho',
  almoco: 'Avaliação do dia - Almoço'
}

export default function AvaliacaoForm() {
  const { aluno_id } = useParams()
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const [avaliacaoId, setAvaliacaoId] = useState(null)
  const [alunoNome, setAlunoNome] = useState('')
  const [status, setStatus] = useState('pendente')
  const [campos, setCampos] = useState({})
  const [observacoes, setObservacoes] = useState('')
  const [fotosExistentes, setFotosExistentes] = useState([])
  const [novasFotos, setNovasFotos] = useState([])
  const [alerta, setAlerta] = useState({ tipo: '', mensagem: '' })
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    iniciarAvaliacao()
    // eslint-disable-next-line
  }, [aluno_id])

  async function iniciarAvaliacao() {
    setCarregando(true)
    try {
      const resposta = await api.post('/avaliacoes/iniciar', { aluno_id })
      const av = resposta.data
      setAvaliacaoId(av.id)
      setAlunoNome(av.aluno_nome || '')
      setStatus(av.status)
      setObservacoes(av.observacoes || '')
      setCampos(av.detalhes || {})
      setFotosExistentes(av.fotos || [])
    } catch (err) {
      setAlerta({ tipo: 'erro', mensagem: 'Erro ao carregar avaliação' })
    } finally {
      setCarregando(false)
    }
  }

  function atualizarCampo(campo, valor) {
    setCampos((atual) => ({ ...atual, [campo]: valor }))
  }

  function montarFormData(comFotos) {
    const formData = new FormData()
    Object.keys(campos).forEach((chave) => {
      let valor = campos[chave]
      if (typeof valor === 'boolean') valor = valor ? 'true' : 'false'
      if (valor !== null && valor !== undefined) formData.append(chave, valor)
    })
    formData.append('observacoes', observacoes)
    if (comFotos) {
      novasFotos.forEach((foto) => formData.append('fotos', foto))
    }
    return formData
  }

  async function salvarRascunho() {
    setSalvando(true)
    try {
      const formData = montarFormData(false)
      // rascunho utiliza JSON simples (sem foto), então convertemos para objeto
      const objeto = {}
      formData.forEach((valor, chave) => { objeto[chave] = valor })
      await api.put(`/avaliacoes/${avaliacaoId}/rascunho`, objeto)
      setAlerta({ tipo: 'sucesso', mensagem: 'Rascunho salvo com sucesso' })
    } catch (err) {
      setAlerta({ tipo: 'erro', mensagem: 'Erro ao salvar rascunho' })
    } finally {
      setSalvando(false)
    }
  }

  async function finalizarAvaliacao(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      const formData = montarFormData(true)
      await api.post(`/avaliacoes/${avaliacaoId}/finalizar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setAlerta({ tipo: 'sucesso', mensagem: 'Avaliação finalizada e enviada conforme preferência do responsável!' })
      setStatus('concluida')
      setTimeout(() => navigate('/avaliacoes'), 1200)
    } catch (err) {
      setAlerta({ tipo: 'erro', mensagem: err.response?.data?.erro || 'Erro ao finalizar avaliação' })
    } finally {
      setSalvando(false)
    }
  }

  const somenteLeitura = status === 'concluida'

  if (carregando) {
    return (
      <Layout>
        <p>Carregando avaliação...</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <button className="btn btn-link ps-0" onClick={() => navigate(-1)}>&larr; Voltar</button>
      <div className="card card-dashboard p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h4 className="mb-0">{tituloPorTipo[usuario.tipo]}</h4>
            <p className="text-secondary mb-0">{alunoNome}</p>
          </div>
          <span className={`badge ${somenteLeitura ? 'badge-concluida' : 'badge-pendente'}`}>
            {somenteLeitura ? 'Concluída' : 'Pendente'}
          </span>
        </div>

        <Alerta tipo={alerta.tipo} mensagem={alerta.mensagem} onFechar={() => setAlerta({ tipo: '', mensagem: '' })} />

        <form onSubmit={finalizarAvaliacao}>
          {usuario.tipo === 'professor' && (
            <FormularioProfessor campos={campos} atualizar={atualizarCampo} desabilitado={somenteLeitura} />
          )}
          {usuario.tipo === 'reforco' && (
            <FormularioReforco campos={campos} atualizar={atualizarCampo} desabilitado={somenteLeitura} />
          )}
          {usuario.tipo === 'banho' && (
            <FormularioBanho campos={campos} atualizar={atualizarCampo} desabilitado={somenteLeitura} />
          )}
          {usuario.tipo === 'almoco' && (
            <FormularioAlmoco campos={campos} atualizar={atualizarCampo} desabilitado={somenteLeitura} />
          )}

          <div className="mb-3">
            <label className="form-label">Observações gerais</label>
            <textarea
              className="form-control"
              rows="3"
              value={observacoes || ''}
              onChange={(e) => setObservacoes(e.target.value)}
              disabled={somenteLeitura}
              placeholder="Escreva suas observações sobre o aluno hoje..."
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">Fotos (opcional)</label>
            {!somenteLeitura && (
              <input
                type="file"
                accept="image/png, image/jpeg"
                className="form-control mb-2"
                multiple
                onChange={(e) => setNovasFotos(Array.from(e.target.files))}
              />
            )}
            <div className="d-flex flex-wrap gap-2">
              {fotosExistentes.map((f) => (
                <img
                  key={f.id}
                  src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${f.caminho}`}
                  className="foto-preview"
                  alt="Foto da avaliação"
                />
              ))}
              {novasFotos.map((f, i) => (
                <img key={i} src={URL.createObjectURL(f)} className="foto-preview" alt="Nova foto" />
              ))}
            </div>
          </div>

          {!somenteLeitura && (
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-secondary" disabled={salvando} onClick={salvarRascunho}>
                Salvar rascunho
              </button>
              <button type="submit" className="btn btn-primary" disabled={salvando}>
                Finalizar avaliação
              </button>
            </div>
          )}
        </form>
      </div>
    </Layout>
  )
}

// ---------- Sub-formulários por tipo de profissional ----------

function FormularioProfessor({ campos, atualizar, desabilitado }) {
  return (
    <>
      <CampoRadio
        titulo="1. Participação nas atividades"
        subtitulo="Como foi a participação do aluno hoje?"
        nome="participacao"
        opcoes={['Excelente', 'Boa', 'Regular', 'Precisa melhorar']}
        valor={campos.participacao}
        onChange={(v) => atualizar('participacao', v)}
        desabilitado={desabilitado}
      />
      <CampoRadio
        titulo="2. Aprendizado do dia"
        subtitulo="O aluno compreendeu os conteúdos trabalhados?"
        nome="aprendizado"
        opcoes={['Sim, totalmente', 'Sim, parcialmente', 'Não compreendeu']}
        valor={campos.aprendizado}
        onChange={(v) => atualizar('aprendizado', v)}
        desabilitado={desabilitado}
      />
      <CampoRadio
        titulo="3. Comportamento"
        subtitulo="Como foi o comportamento do aluno hoje?"
        nome="comportamento"
        opcoes={['Excelente', 'Bom', 'Regular', 'Precisa melhorar']}
        valor={campos.comportamento}
        onChange={(v) => atualizar('comportamento', v)}
        desabilitado={desabilitado}
      />
    </>
  )
}

function FormularioReforco({ campos, atualizar, desabilitado }) {
  return (
    <>
      <div className="mb-3">
        <label className="form-label fw-bold">1. Atividades realizadas</label>
        <textarea className="form-control" rows="2" disabled={desabilitado}
          value={campos.atividades || ''} onChange={(e) => atualizar('atividades', e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label fw-bold">2. Dificuldades encontradas</label>
        <textarea className="form-control" rows="2" disabled={desabilitado}
          value={campos.dificuldades || ''} onChange={(e) => atualizar('dificuldades', e.target.value)} />
      </div>
      <CampoRadio
        titulo="3. Evolução"
        subtitulo="Como está a evolução do aluno no reforço?"
        nome="evolucao"
        opcoes={['Muita evolução', 'Evolução moderada', 'Pouca evolução', 'Sem evolução']}
        valor={campos.evolucao}
        onChange={(v) => atualizar('evolucao', v)}
        desabilitado={desabilitado}
      />
    </>
  )
}

function FormularioBanho({ campos, atualizar, desabilitado }) {
  return (
    <>
      <CampoSimNao
        titulo="1. Tomou banho hoje?"
        valor={campos.tomou_banho}
        onChange={(v) => atualizar('tomou_banho', v)}
        desabilitado={desabilitado}
      />
      <CampoSimNao
        titulo="2. Necessitou de ajuda?"
        valor={campos.precisou_ajuda}
        onChange={(v) => atualizar('precisou_ajuda', v)}
        desabilitado={desabilitado}
      />
      <CampoRadio
        titulo="3. Comportamento durante o banho"
        nome="comportamento"
        opcoes={['Tranquilo', 'Resistente', 'Agitado']}
        valor={campos.comportamento}
        onChange={(v) => atualizar('comportamento', v)}
        desabilitado={desabilitado}
      />
    </>
  )
}

function FormularioAlmoco({ campos, atualizar, desabilitado }) {
  return (
    <>
      <CampoSimNao
        titulo="1. Comeu bem?"
        valor={campos.comeu_bem}
        onChange={(v) => atualizar('comeu_bem', v)}
        desabilitado={desabilitado}
      />
      <CampoRadio
        titulo="2. Quantidade"
        nome="quantidade"
        opcoes={['Tudo', 'Metade', 'Pouco', 'Não comeu']}
        valor={campos.quantidade}
        onChange={(v) => atualizar('quantidade', v)}
        desabilitado={desabilitado}
      />
      <div className="mb-3">
        <label className="form-label fw-bold">3. Alimento recusado</label>
        <input className="form-control" disabled={desabilitado}
          value={campos.recusou_alimento || ''} onChange={(e) => atualizar('recusou_alimento', e.target.value)} />
      </div>
    </>
  )
}

// ---------- Componentes auxiliares reutilizáveis ----------

function CampoRadio({ titulo, subtitulo, nome, opcoes, valor, onChange, desabilitado }) {
  return (
    <div className="mb-3">
      <label className="form-label fw-bold mb-0">{titulo}</label>
      {subtitulo && <p className="text-secondary small mb-1">{subtitulo}</p>}
      {opcoes.map((opcao) => (
        <div className="form-check" key={opcao}>
          <input
            className="form-check-input"
            type="radio"
            name={nome}
            id={`${nome}-${opcao}`}
            checked={valor === opcao}
            onChange={() => onChange(opcao)}
            disabled={desabilitado}
          />
          <label className="form-check-label" htmlFor={`${nome}-${opcao}`}>{opcao}</label>
        </div>
      ))}
    </div>
  )
}

function CampoSimNao({ titulo, valor, onChange, desabilitado }) {
  const valorBooleano = valor === true || valor === 'true'
  return (
    <div className="mb-3">
      <label className="form-label fw-bold d-block">{titulo}</label>
      <div className="form-check form-check-inline">
        <input className="form-check-input" type="radio" checked={valorBooleano === true} onChange={() => onChange(true)} disabled={desabilitado} />
        <label className="form-check-label">Sim</label>
      </div>
      <div className="form-check form-check-inline">
        <input className="form-check-input" type="radio" checked={valor === false || valor === 'false'} onChange={() => onChange(false)} disabled={desabilitado} />
        <label className="form-check-label">Não</label>
      </div>
    </div>
  )
}
