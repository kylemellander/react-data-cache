import React from 'react'
import { ResourceProvider } from 'react-data-cache'
import { ExampleWrapper } from '../unimportantStuff/ExampleWrapper'
import { EpisodeDisplay } from './EpisodeDisplay'
import { fetchWrapperResolver } from '../unimportantStuff/fetchWrapperResolver'
import { code } from './code/EpisodeDisplay'

export function BasicExample() {
  return (
    <ResourceProvider
      resources={[{ name: 'api', resolver: fetchWrapperResolver }]}
    >
      <ExampleWrapper code={code}>
        <EpisodeDisplay />
      </ExampleWrapper>
    </ResourceProvider>
  )
}
