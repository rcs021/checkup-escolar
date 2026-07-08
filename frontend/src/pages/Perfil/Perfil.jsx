import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import Alerta from '../../components/Alerta'

export default function Perfil() {
  const { usuario } = useAuth()
  const [dados, setDados] = useState(null)
  const [alerta, setAlerta] = useState({ tipo: '', mensagem: '' })

  useEffect(() => {
    api.get('/auth/me').then((r) => setDados(r.data)).catch(() => {
      setAlerta({ tipo: 'erro', mensagem: 'Erro ao carregar perfil' })
    })
  }, [])

  async function salvarPreferencias(e) {
    e.preventDefault()
    try {
      const resposta = await api.put('/responsaveis/meu-perfil', {
        telefone: dados.telefone,
        whatsapp: dados.whatsapp,
        preferencia_envio: dados.preferencia_envio,
        forma_envio: dados.forma_envio
      })
      setDados(resposta.data)
      setAlerta({ tipo: 'sucesso', mensagem: 'Preferências salvas com sucesso!' })
    } catch (err) {
      setAlerta({ tipo: 'erro', mensagem: 'Erro ao salvar preferências' })
    }
  }

  if (!dados) {
    return (
      <Layout>
        <p>Carregando...</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <h3 className="mb-3">Meu Perfil</h3>
      <Alerta tipo={alerta.tipo} mensagem={alerta.mensagem} onFechar={() => setAlerta({ tipo: '', mensagem: '' })} />

      <div className="card card-dashboard p-4" style={{ maxWidth: '600px' }}>
        <h5 className="mb-3">Dados cadastrais</h5>
        <p><strong>Nome:</strong> {dados.nome}</p>
        {dados.usuario && <p><strong>Usuário:</strong> {dados.usuario}</p>}
        <p><strong>E-mail:</strong> {dados.email}</p>
        {dados.cargo && <p><strong>Cargo:</strong> {dados.cargo}</p>}

        {usuario.tipo === 'responsavel' && (
          <>
            <hr />
            <h5 className="mb-3">Preferências de envio</h5>
            <form onSubmit={salvarPreferencias}>
              <div className="mb-3">
                <label className="form-label">Telefone</label>
                <input className="form-control" value={dados.telefone || ''} onChange={(e) => setDados({ ...dados, telefone: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label">WhatsApp</label>
                <input className="form-control" value={dados.whatsapp || ''} onChange={(e) => setDados({ ...dados, whatsapp: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label">Forma de envio</label>
                <div>
                  <button
                    type="button"
                    className={`btn me-2 ${dados.forma_envio === 'whatsapp' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setDados({ ...dados, forma_envio: 'whatsapp' })}
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    className={`btn ${dados.forma_envio === 'email' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setDados({ ...dados, forma_envio: 'email' })}
                  >
                    E-mail
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label d-block">Quando deseja receber as avaliações?</label>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    checked={dados.preferencia_envio === 'etapa'}
                    onChange={() => setDados({ ...dados, preferencia_envio: 'etapa' })}
                    id="p-etapa"
                  />
                  <label className="form-check-label" htmlFor="p-etapa">
                    Por etapas (a cada profissional) - receber o formulário assim que cada profissional finalizar
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    checked={dados.preferencia_envio === 'final'}
                    onChange={() => setDados({ ...dados, preferencia_envio: 'final' })}
                    id="p-final"
                  />
                  <label className="form-check-label" htmlFor="p-final">
                    Somente no final do dia - receber o relatório completo apenas ao final do dia
                  </label>
                </div>
              </div>
              <button className="btn btn-primary" type="submit">Salvar preferências</button>
            </form>
          </>
        )}
      </div>
    </Layout>
  )
}
