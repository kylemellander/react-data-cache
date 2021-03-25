import React, { createContext, useContext } from 'react'
import { CacheContext, CacheProvider } from './CacheContext'

let genericResourceIdentifier = 0
function buildGenericCacheKeyGenerator() {
  const identifier = genericResourceIdentifier++
  return (...args) =>
    `genericResourceCacheKey-${identifier}-` + JSON.stringify(...args)
}

export const ResourceContext = createContext()

export function ResourceProvider({ resources: definedResources, children }) {
  const [cache] = useContext(CacheContext) || []
  if (!cache) {
    return (
      <CacheProvider>
        <ResourceProvider resources={definedResources}>
          {children}
        </ResourceProvider>
      </CacheProvider>
    )
  }
  const cachedResolvers = cache.resolvers
  definedResources.forEach(
    ({ name, resolver, keyGenerator = buildGenericCacheKeyGenerator() }) => {
      if (cachedResolvers.get(name) === undefined) {
        cachedResolvers.set(name, [resolver, keyGenerator])
      }
    }
  )

  return (
    <ResourceContext.Provider value={cache}>
      {children}
    </ResourceContext.Provider>
  )
}
