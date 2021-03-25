import React, { useContext } from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { CacheContext } from './CacheContext'
import { ResourceProvider } from './ResourceContext'

function buildWrapper(resources) {
  return function Wrapper({ children }) {
    return <ResourceProvider resources={resources}>{children}</ResourceProvider>
  }
}

describe('ResourceContext', () => {
  it('sets up cache', () => {
    const resolver = jest.fn(() => Promise.resolve())
    const keyGenerator = jest.fn()
    const { result } = renderHook(() => useContext(CacheContext), {
      wrapper: buildWrapper([{ name: 'api', resolver, keyGenerator }])
    })

    expect(result.current[0].resolvers).toEqual(
      new Map([['api', [resolver, keyGenerator]]])
    )
  })

  it('provides a default keyGenerator if none is provided', () => {
    const resolver = jest.fn(() => Promise.resolve())
    const { result } = renderHook(() => useContext(CacheContext), {
      wrapper: buildWrapper([{ name: 'api', resolver }])
    })

    const [, keyGenerator] = result.current[0].resolvers.get('api')

    expect(keyGenerator('my-key')).toEqual('genericResourceCacheKey-0-"my-key"')
  })
})
