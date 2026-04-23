import React, { useState } from 'react'
export function Button({ label, onClick, disabled = false }) {
  const [pressed, setPressed] = useState(false)
  return <button disabled={disabled} onClick={() => { setPressed(true); onClick?.() }}
    className={pressed ? 'pressed' : ''}>{label}</button>
}
