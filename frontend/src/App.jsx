import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MeusFilhos from './pages/MeusFilhos'

import Turmas from './pages/Turmas/Turmas'
import Alunos from './pages/Alunos/Alunos'
import AlunoForm from './pages/Alunos/AlunoForm'
import Responsaveis from './pages/Responsaveis/Responsaveis'
import Profissionais from './pages/Profissionais/Profissionais'
import Avaliacoes from './pages/Avaliacoes/Avaliacoes'
import AvaliacaoForm from './pages/Avaliacoes/AvaliacaoForm'
import Historico from './pages/Historico/Historico'
import Perfil from './pages/Perfil/Perfil'

const PROFISSIONAIS = ['professor', 'reforco', 'banho', 'almoco']

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

          <Route path="/meus-filhos" element={<PrivateRoute perfis={['responsavel']}><MeusFilhos /></PrivateRoute>} />

          <Route path="/turmas" element={<PrivateRoute perfis={['admin']}><Turmas /></PrivateRoute>} />

          <Route path="/alunos" element={<PrivateRoute perfis={['admin']}><Alunos /></PrivateRoute>} />
          <Route path="/alunos/novo" element={<PrivateRoute perfis={['admin']}><AlunoForm /></PrivateRoute>} />
          <Route path="/alunos/editar/:id" element={<PrivateRoute perfis={['admin']}><AlunoForm /></PrivateRoute>} />

          <Route path="/responsaveis" element={<PrivateRoute perfis={['admin']}><Responsaveis /></PrivateRoute>} />

          <Route path="/profissionais" element={<PrivateRoute perfis={['admin']}><Profissionais /></PrivateRoute>} />

          <Route path="/avaliacoes" element={<PrivateRoute perfis={PROFISSIONAIS}><Avaliacoes /></PrivateRoute>} />
          <Route path="/avaliacoes/formulario/:aluno_id" element={<PrivateRoute perfis={PROFISSIONAIS}><AvaliacaoForm /></PrivateRoute>} />

          <Route path="/historico" element={<PrivateRoute><Historico /></PrivateRoute>} />

          <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}

export default App
