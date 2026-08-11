const CustomModel = ({ show, onClose, children }) => {
  if (!show) return null;

  return (
    <div className="custom-modal">
      <div className="custom-modal-content">
        <button className="custom-modal-close" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default CustomModel;
