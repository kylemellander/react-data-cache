import React from 'react'

export function CharacterDisplay({ character }) {
  return (
    <>
      <img
        src={character.image}
        alt={character.name}
        style={{ width: '100px', height: '100px' }}
      />
      <h6 style={{ margin: 0 }}>{character.name}</h6>
    </>
  )
}

export function CharacterLoading() {
  return <h6 style={{ width: '100px', height: '114px' }}>Loading...</h6>
}

export function CharactersWrapper({ children }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap' }}>{children}</div>
}

export function CharacterWrapper({ children }) {
  return <div style={{ maxWidth: '100px', margin: '3px 10px' }}>{children}</div>
}

export function EpisodeName({ episode }) {
  return (
    <h2>
      {episode.episode} - {episode.name}
    </h2>
  )
}
