import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuração do Vite para o projeto CheckUp Escolar
// "base" define o caminho onde o app fica hospedado no GitHub Pages.
// Se o repositório se chamar "checkup-escolar", a base deve ser "/checkup-escolar/".
// Ao rodar localmente (npm run dev) isso não atrapalha em nada.
export default defineConfig({
  plugins: [react()],
  base: '/checkup-escolar/',
  server: {
    port: 5173
  }
})
