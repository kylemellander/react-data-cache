import { useContext } from 'react'
import { useForceRefresh } from './CacheContext'
import { ResourceContext } from './ResourceContext'

const PENDING = 'PENDING'
const RESOLVED = 'RESOLVED'
const REJECTED = 'REJECTED'

function toResult(promise) {
  if (!promise || !promise.then) return { status: RESOLVED, value: promise }

  const result = {
    status: PENDING,
    value: promise
  }

  promise
    .then((value) => {
      if (result.status === PENDING) {
        result.status = RESOLVED
        result.value = value
      }
    })
    .catch((err) => {
      if (result.status === PENDING) {
        result.status = REJECTED
        result.value = err
      }
    })
  return result
}

function readResult(result) {
  if (result.status === RESOLVED) {
    return result.value
  } else {
    throw result.value
  }
}

function getResolver(cache, key) {
  const resolverMap = cache.resolvers.get(key)
  if (!resolverMap) {
    throw new ReferenceError(
      'You are attempting to access a resource that has not been configured on the ResourceProvider'
    )
  }

  const [resolver, keyGenerator] = resolverMap
  return { resolver, keyGenerator }
}

function getResourceMap(cache, key) {
  const resources = cache.resources
  let resourceMap = resources.get(key)
  if (resourceMap === undefined) {
    resourceMap = new Map()
    resources.set(key, resourceMap)
  }
  return resourceMap
}

export function useResource(resourceKey) {
  const cache = useContext(ResourceContext)
  const forceRefresh = useForceRefresh()

  if (!cache) {
    throw new ReferenceError(
      "You've attempted to use `useResource` outside the context of the `ResourceProvider`."
    )
  }

  const preloadResult = (...args) => {
    const { resolver, keyGenerator } = getResolver(cache, resourceKey)
    const resourceMap = getResourceMap(cache, resourceKey)
    // find a previously cached response (if any)
    const key = keyGenerator(...args)
    let result = resourceMap.get(key)
    // if previously cached response does not exist, use the resolver to set a result
    if (!result) {
      const promise = resolver(...args)
      // We wrap the promise with a status so that we know how to handle it
      result = toResult(promise)
      resourceMap.set(key, result)
    }
    return result
  }

  const preload = (...args) => {
    preloadResult(...args)
  }

  const fetch = (...args) => {
    const result = preloadResult(...args)
    return readResult(result)
  }

  const readFromCache = (...args) => {
    const { keyGenerator } = getResolver(cache, resourceKey)
    const resourceMap = getResourceMap(cache, resourceKey)
    const key = keyGenerator(...args)
    const result = resourceMap.get(key) || { status: RESOLVED }
    return readResult(result)
  }

  const clear = (callback) => {
    const resourceMap = getResourceMap(cache, resourceKey)
    if (!resourceMap) return
    if (!callback) {
      cache.resources.delete(resourceKey)
    } else {
      const { keyGenerator } = getResolver(cache, resourceKey)
      resourceMap.forEach((value, key) => {
        if (callback(key, { keyGenerator })) {
          resourceMap.delete(key)
        }
      })
    }
    forceRefresh()
  }

  const ingest = (value, ...keyArgs) => {
    const { keyGenerator } = getResolver(cache, resourceKey)
    const resources = cache.resources
    // Find Resource in the cache
    let resourceMap = resources.get(resourceKey)
    if (resourceMap === undefined) {
      resourceMap = new Map()
      resources.set(resourceKey, resourceMap)
    }
    // find a previously cached response (if any)
    const key = keyGenerator(...keyArgs)
    resourceMap.set(key, { status: RESOLVED, value })
  }

  return { fetch, preload, clear, readFromCache, ingest }
}
