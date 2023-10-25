import React from 'react'

function Modal({children, title, handleShow}) {
  return (
    <div className='modal'>
        <div className='modal-container'>
            <div className='modal-title-bar'>
                <div className="modal-title">{title}</div>
                <div onClick={(e) => {e.preventDefault(); handleShow()}}>X</div>
            </div>
            <hr></hr>
            <div className="modal-content">{children}</div>
        </div>
    </div>
  )
}

export default Modal