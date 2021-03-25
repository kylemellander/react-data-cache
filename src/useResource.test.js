import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { waitFor } from '@testing-library/dom'
import { ResourceProvider } from './ResourceContext'
import { useResource } from './useResource'

function buildWrapper({ resources }) {
  return function TestWrapper({ children }) {
    return <ResourceProvider resources={resources}>{children}</ResourceProvider>
  }
}

describe('useResource', () => {
  it('raises error when being called outside the context', () => {
    expect(() => renderHook(() => useResource()).result.current).toThrow(
      "You've attempted to use `useResource` outside the context of the `ResourceProvider`."
    )
  })
})

describe('preload', () => {
  it('runs the resolver without throwing the promise', async () => {
    const resolverResult = {
      data: { id: 1, attributes: { name: 'Bart' }, type: 'Person' }
    }
    const { result } = renderHook(() => useResource('api'), {
      wrapper: buildWrapper({
        resources: [
          { name: 'api', resolver: () => Promise.resolve(resolverResult) }
        ]
      })
    })
    expect(result.current.readFromCache()).toBeUndefined() // Before preload, there is no data cached
    result.current.preload()
    // NOTE: this throw is not triggered by the `preload` call.
    expect(() => result.current.readFromCache()).toThrow() // it's currently fetching the data and trying to read it will throw an error
    await waitFor(() => result.current.readFromCache())
    expect(result.current.readFromCache()).toEqual(resolverResult) // the data is loaded and is returned when being read
  })

  describe('when resolver does not return a promise', () => {
    it('immediately loads the data into the cache', () => {
      const resolverResult = {
        data: { id: 1, attributes: { name: 'Bart' }, type: 'Person' }
      }
      const { result } = renderHook(() => useResource('api'), {
        wrapper: buildWrapper({
          resources: [{ name: 'api', resolver: () => resolverResult }]
        })
      })

      result.current.preload()
      expect(result.current.readFromCache()).toEqual(resolverResult)
    })
  })

  it('connects to the correct resource by name', () => {
    const apiResolver = jest.fn()
    const otherResolver = jest.fn()
    const { result } = renderHook(() => useResource('other'), {
      wrapper: buildWrapper({
        resources: [
          { name: 'api', resolver: apiResolver },
          { name: 'other', resolver: otherResolver }
        ]
      })
    })

    result.current.preload()
    expect(otherResolver).toHaveBeenCalled()
    expect(apiResolver).not.toHaveBeenCalled()
  })

  it('sends the arguments sent into resolver arguments', () => {
    const apiResolver = jest.fn()
    const { result } = renderHook(() => useResource('api'), {
      wrapper: buildWrapper({
        resources: [{ name: 'api', resolver: apiResolver }]
      })
    })

    result.current.preload('my', 'args')
    expect(apiResolver).toHaveBeenCalledWith('my', 'args')
  })
})

describe('fetch', () => {
  it('throws the error for a resolver that has not fully resolved', () => {
    let promise
    const resolver = jest.fn(() => (promise = Promise.resolve()))
    expect(() => {
      const { result } = renderHook(() => useResource('api'), {
        wrapper: buildWrapper({ resources: [{ name: 'api', resolver }] })
      })
      expect(result.current.fetch())
    }).toThrowError(promise)
    expect(resolver).toHaveBeenCalled()
  })

  describe('when resolver does not return a promise', () => {
    it('immediately loads the data into the cache', () => {
      const resolverResult = {
        data: { id: 1, attributes: { name: 'Bart' }, type: 'Person' }
      }
      const { result } = renderHook(() => useResource('api'), {
        wrapper: buildWrapper({
          resources: [{ name: 'api', resolver: () => resolverResult }]
        })
      })

      expect(result.current.fetch()).toEqual(resolverResult)
    })
  })

  it('connects to the correct resource by name', () => {
    const apiResolver = jest.fn()
    const otherResolver = jest.fn()
    const { result } = renderHook(() => useResource('other'), {
      wrapper: buildWrapper({
        resources: [
          { name: 'api', resolver: apiResolver },
          { name: 'other', resolver: otherResolver }
        ]
      })
    })

    result.current.fetch()
    expect(otherResolver).toHaveBeenCalled()
    expect(apiResolver).not.toHaveBeenCalled()
  })

  it('sends the arguments sent into resolver arguments', () => {
    const apiResolver = jest.fn()
    const { result } = renderHook(() => useResource('api'), {
      wrapper: buildWrapper({
        resources: [{ name: 'api', resolver: apiResolver }]
      })
    })

    result.current.fetch('my', 'args')
    expect(apiResolver).toHaveBeenCalledWith('my', 'args')
  })
})

describe('ingest', () => {
  it('adds the data to the cache for the expected resource', () => {
    const resolver = jest.fn(() => Promise.resolve(null))
    const resolverResult = {
      data: { id: 1, attributes: { name: 'Bart' }, type: 'Person' }
    }
    const { result } = renderHook(() => useResource('api'), {
      wrapper: buildWrapper({ resources: [{ name: 'api', resolver }] })
    })

    result.current.ingest(resolverResult, 'my_key')
    expect(result.current.fetch('my_key')).toEqual(resolverResult)
    expect(resolver).not.toHaveBeenCalled()
  })

  it('throws error if you are trying to access a resource that has not been defined', () => {
    expect(() => {
      const { result } = renderHook(() => useResource('notApi'), {
        wrapper: buildWrapper({
          resources: [{ name: 'api', resolver: jest.fn() }]
        })
      })
      expect(result.current.ingest({}, 'key'))
    }).toThrowError(
      'You are attempting to access a resource that has not been configured on the ResourceProvider'
    )
  })
})

describe('clear', () => {
  describe('when providing a callback', () => {
    it('clears any cached data that callback returns truthy for the resource', () => {
      const { result } = renderHook(() => useResource('api'), {
        wrapper: buildWrapper({
          resources: [{ name: 'api', resolver: jest.fn() }]
        })
      })
      const data = { id: 11 }
      result.current.ingest(data, 'my_key')
      expect(result.current.readFromCache('my_key')).toEqual(data)
      result.current.clear(
        (key, { keyGenerator }) => key === keyGenerator('my_key')
      )
      expect(result.current.readFromCache('my_key')).toEqual(undefined)
    })
  })
})
