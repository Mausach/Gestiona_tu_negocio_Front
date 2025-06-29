import React, { useEffect } from "react";
import PropTypes from "prop-types";
import "./AgregarElemento.css"; // Asegura que el CSS de formularios esté disponible en el modal

const Modal = ({ open, onClose, children, onRefreshAll }) => {
  useEffect(() => {
    if (open) {
      document.body.classList.add("gtb-modal-open");
    } else {
      document.body.classList.remove("gtb-modal-open");
    }
    return () => {
      document.body.classList.remove("gtb-modal-open");
    };
  }, [open]);

  if (!open) return null;

  const handleClose = () => {
    if (onRefreshAll) onRefreshAll();
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        touchAction: "none",
        overflowY: "auto",
        padding: "56px 16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: 0,
          borderRadius: "14px",
          boxShadow: "0 4px 32px 0 #d6cbb7",
          position: "relative",
          border: "1.5px solid #e6dbc7",
          fontFamily: '"Segoe UI", Arial, sans-serif',
          overflow: "visible",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "auto",
          minWidth: 0,
          maxWidth: "98vw",
          maxHeight: "92vh",
          /* Cambia el ancho para que se adapte al contenido pero no se pase del viewport */
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            minWidth: 0,
            maxWidth: "100vw",
            padding: "24px 18px 18px 18px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <button
            onClick={handleClose}
            style={{
              position: "absolute",
              top: 10,
              right: 14,
              background: "#e6dbc7",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              fontSize: 22,
              color: "#2a4d4f",
              cursor: "pointer",
              boxShadow: "0 1px 4px #d6cbb7",
              transition: "background 0.2s",
              zIndex: 2,
            }}
            title="Cerrar"
          >
            &times;
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  onRefreshAll: PropTypes.func,
};

export default Modal;
