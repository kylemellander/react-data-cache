import React, { createContext, useContext, useState } from 'react'

function CreateCache() {
  return new CacheImpl()
}

function CacheImpl() {
  this.resources = new Map()
  this.resolvers = new Map()
}

export const CacheContext = createContext()

export function CacheProvider({ children }) {
  // We are only using cache here to make sure that it persists through rerenders
  // It's possible we might do more in the future, but we cannot update the state and have it work
  // with our resource.
  const cacheState = useState(CreateCache())
  return (
    <CacheContext.Provider value={cacheState}>{children}</CacheContext.Provider>
  )
}

export function useForceRefresh() {
  const setCache = useContext(CacheContext)[1]
  return () =>
    setCache((cache) => {
      const newCache = CreateCache()
      newCache.resources = cache.resources
      newCache.resolvers = cache.resolvers
      return newCache
    })
}
