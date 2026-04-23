import React, { useEffect } from 'react'
export function Modal({ isOpen, title, children, onClose }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isOpen])
  if (!isOpen) return null
  return <div className="modal"><h2>{title}</h2>{children}
    <button onClick={onClose}>Close</button></div>
}
