export const code = `function Display() {
  return (
    <ResourceProvider
      resources={[{ name: 'api', resolver: fetchWrapperResolver }]}
    >
      <EpisodeDisplay />
    </ResourceProvider>
  )
}

function EpisodeDisplay() {
  const [episodeId, setEpisodeId] = useState(1)

  return (
    <>
      <NextPrevButtons id={episodeId} setId={setEpisodeId} />
      <React.Suspense fallback={<h2>Loading...</h2>}>
        <Episode episodeId={episodeId} />
      </React.Suspense>
    </>
  )
}

function Episode({ episodeId }) {
  const { fetch } = useResource('api')
  const episode = fetch(\`https://rickandmortyapi.com/api/episode/\${episodeId}\`)

  return (
    <>
      <EpisodeName episode={episode} />
      <CharacterList characters={episode.characters} />
    </>
  )
}

function CharacterList({ characters }) {
  const { preload } = useResource('api')
  useEffect(() => {
    characters.forEach((character) => preload(character))
  }, [characters, preload])

  return (
    <CharactersWrapper>
      {characters.map((characterUrl) => (
        <CharacterWrapper key={characterUrl}>
          <React.Suspense fallback={<CharacterLoading />}>
            <Character characterUrl={characterUrl} />
          </React.Suspense>
        </CharacterWrapper>
      ))}
    </CharactersWrapper>
  )
}

function Character({ characterUrl }) {
  const { fetch } = useResource('api')
  const character = fetch(characterUrl)
  return <CharacterDisplay character={character} />
}`
