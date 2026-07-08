// Modal de confirmação reutilizável (usado principalmente para exclusões)
export default function ModalConfirmacao({ show, titulo, mensagem, onConfirmar, onCancelar }) {
  if (!show) return null

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{titulo || 'Confirmar ação'}</h5>
            <button type="button" className="btn-close" onClick={onCancelar}></button>
          </div>
          <div className="modal-body">
            <p>{mensagem || 'Tem certeza que deseja continuar?'}</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
            <button className="btn btn-danger" onClick={onConfirmar}>Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
