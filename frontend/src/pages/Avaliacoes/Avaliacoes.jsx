import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import Alerta from '../../components/Alerta'

export default function Avaliacoes() {
  const [lista, setLista] = useState([])
  const [alerta, setAlerta] = useState({ tipo: '', mensagem: '' })

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    try {
      const resposta = await api.get('/avaliacoes/hoje')
      setLista(resposta.data)
    } catch (err) {
      setAlerta({ tipo: 'erro', mensagem: 'Erro ao carregar avaliações do dia' })
    }
  }

  const dataHoje = new Date().toLocaleDateString('pt-BR')

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Avaliações do Dia</h3>
        <span className="badge bg-light text-dark border">{dataHoje}</span>
      </div>

      <Alerta tipo={alerta.tipo} mensagem={alerta.mensagem} onFechar={() => setAlerta({ tipo: '', mensagem: '' })} />

      <div className="card card-dashboard">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Turma</th>
                <th>Status</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((item) => (
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
                  <td className="text-end">
                    <Link to={`/avaliacoes/formulario/${item.aluno_id}`} className="btn btn-sm btn-primary">
                      {item.status === 'concluida' ? 'Ver avaliação' : 'Preencher'}
                    </Link>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr><td colSpan="4" className="text-center text-secondary py-3">Nenhum aluno encontrado na sua turma</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
