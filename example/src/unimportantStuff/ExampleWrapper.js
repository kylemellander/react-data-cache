import React, { useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'

export function ExampleWrapper({ children, code }) {
  const [preview, setPreview] = useState(true)

  return (
    <div style={{ margin: '2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        <button onClick={() => setPreview(true)}>Preview</button>
        <button onClick={() => setPreview(false)}>Code</button>
      </div>
      <div
        style={{
          border: '2px solid #eeeeee',
          background: '#efefef',
          padding: '1rem',
          maxHeight: '70vh',
          overflowY: 'auto'
        }}
      >
        {preview ? children : <CodeDisplay code={code} />}
      </div>
    </div>
  )
}

function CodeDisplay({ code }) {
  return (
    <SyntaxHighlighter language='javascript' style={docco}>
      {code}
    </SyntaxHighlighter>
  )
}
