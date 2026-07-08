// Componente simples para exibir mensagens de sucesso/erro usando classes do Bootstrap
export default function Alerta({ tipo, mensagem, onFechar }) {
  if (!mensagem) return null

  const classe = tipo === 'erro' ? 'alert-danger' : 'alert-success'

  return (
    <div className={`alert ${classe} alert-dismissible fade show`} role="alert">
      {mensagem}
      {onFechar && (
        <button type="button" className="btn-close" onClick={onFechar}></button>
      )}
    </div>
  )
}
