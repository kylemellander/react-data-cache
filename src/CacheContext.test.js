import { useContext } from 'react'
import { renderHook } from '@testing-library/react-hooks'
import '@testing-library/jest-dom/extend-expect'
import { CacheContext, CacheProvider } from './CacheContext'

describe('CacheProvider', () => {
  it('creates a cache with resources and resolvers', () => {
    const { result } = renderHook(() => useContext(CacheContext), {
      wrapper: CacheProvider
    })

    const cache = result.current[0]
    expect(cache.resources instanceof Map).toEqual(true)
    expect(cache.resolvers instanceof Map).toEqual(true)
    expect(cache).toMatchSnapshot()
  })
})
