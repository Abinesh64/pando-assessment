const TrashIcon = ({ width = 24, height = 24, onClick }) => {
  return (
    <div onClick={onClick}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height={`${height}px`}
        viewBox="0 -960 960 960"
        width={`${width}px`}
        fill="#e3e3e3"
      >
        <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280ZM680-720H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360Z" />
      </svg>
    </div>
  );
};

export default TrashIcon;
