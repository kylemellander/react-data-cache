import React from 'react'
import { useResource } from 'react-data-cache'

export function NextPrevButtons({ id, setId }) {
  const { clear } = useResource('api')

  return (
    <div style={{ display: 'flex' }}>
      <button onClick={() => setId((id) => id - 1)} disabled={id === 1}>
        prev
      </button>
      <button onClick={() => setId((id) => id + 1)}>next</button>
      <button onClick={() => clear()}>clear cache</button>
    </div>
  )
}
