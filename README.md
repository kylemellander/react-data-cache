# React-Data-Cache

React-Data-Cache looks to leverage the [React Suspense API](https://reactjs.org/docs/concurrent-mode-suspense.html) in order to create a configurable hook that can be used to build a clean, easy to use interface to fetch data and handle loading and error states.

[![NPM](https://img.shields.io/npm/v/@reactistry/react-data-cache.svg)](https://www.npmjs.com/package/@reactistry/react-data-cache)

## Is this safe to use?

React.Suspense is a part of the core React library, but it is still listed as experimental.  It is subject to change so this library could become obsolete in time.  One of the goals of this library is to stay as closely tied to the progress that is being made to by the core React team with experiments that are happening on things like `react-cache` and `react-fetch`, so that if the core team rolls out an official version, then this could be adapted easily to their format.

None of the logic in this library uses experimental React logic, but because it is trying to push the edges of where React is going, it is possible that your application might need to rework some details if React moves away from the Suspense approach.

## Using React-Data-Cache

### Quickstart

```
npm install @reactistry/react-data-cache --save
```

or with yarn

```
yarn add @reactistry/react-data-cache
```

#### Defining your resources

At a high level place in your React tree, wrap your code with:

```js
import { ResourceProvider } from "@reactistry/react-data-cache

<ResourceProvider resources={[
  { name: 'api', resolver: (path, options) => makeRequest(path, options) },
  { name: 'graphQLApi', resolver: (...args) => makeGraphQLRequest(...args) }
]}>
  <MyComponents />
</ResourceProvider>
```

In this example, when you use `api`, it will use `makeRequest` to resolve any requests that you make.
This example also shows how you might also access to a different API that takes different types of arguments and a different resolver.
Both can be used in the same app/tree and keep their data independent.

You could also define your resources as specific endpoints, for example with a RESTful API.

```js
import { ResourceProvider } from "@reactistry/react-data-cache"

<ResourceProvider resources={[
  { name: 'episodes', resolver: (id, options) => makeRequest(`http://mysite/api/episodes${id ? `/${id}` : ""}`, options) },
  { name: 'characters', resolver: (id, options) =>  makeRequest(`http://mysite/api/characters${id ? `/${id}` : ""}`, options) }
]}>
  <MyComponents />
</ResourceProvider>
```

This would allow you to create multiple resolvers for each resource and can help prevent having to repeat knowing how to call each of your resource calls in the implementation details.

#### Wrap Places where you will fetch data with React.Suspense

Because react-data-cache relies on concurrent mode in React, you will need to make sure to have any places where you fetch data wrapped in `React.Suspense`. It is generally best practice to add React.Suspense at key places in your app to prevent the whole page from going to a loading screen each time you load anything.  You can put multiple `React.Suspense` calls in your app, even nested within one another, and the lowest one will catch any loading requests that are going out. (NOTE: this must be wrapped at a higher level than any requests that are made, but not necessarily higher than your `ResourceProvider`)

```js
<React.Suspense fallback={<LoadingSpinner>}>
  <EpisodeLoaderAndDisplayer>
</React.Suspense>
```

#### Fetching data

To fetch the data you want to use:

```js
import { useResource } from "@reactistry/react-data-cache"

function EpisodeLoaderAndDisplayer() {
  const { fetch } = useResource('api')
  const episodes = fetch('path/to/episodes')

  return <EpisodeDisplayer episodes={episodes} />
}
```

This will load the episodes, and while it is loading, it will show the loader from `React.Suspense`.  When it is finished loading, it will show the `EpisodeDisplayer` with the episodes loaded from the resolver.  No more tracking loading states manually!

#### Preloading data

When you want to load multiple requests for a page, you want to start requesting the data as soon as possible, but don't want to prevent displaying things to the users for all the data to load.  It is good practice to set up preload to load data at the highest place where you know it will be used, but it doesn't need to be referenced in the code at that level. Just use preload and it will load the data so that it is ready for where you want to use it:

```js
import { useResource } from "@reactistry/react-data-cache"

function Page() {
  const { preload } = useResource('api')
  preload('path/to/episodes')
  preload('path/to/characters')

  return <PageToShowAllThatDataSomewhere>
}
```

In this scenario, both episodes and characters will load on loading of Page, but references within will still wait for the loading to complete.  No waterfalls!

#### Clearing cache results / Refreshing Data

Sometimes you want to make a request clear its cache so that the request will go out again.  Due to the nature of the library, if you clear the cache of a cached record, if it is referenced, it will act like it did on its first render and refetch the request, so for this reason, clearing and refreshing are one and the same.  Here's how you do it:

```js
import { useResource } from "@reactistry/react-data-cache"

function Page() {
  const { clear } = useResource('api')

  return <div>
    <button onClick={() => clear()}>Clear/Refresh All Requests</button>
    <button onClick={() => clear((key) => key.includes("/episodes"))}>Clear/Refresh episodes</button>
  </div>
}
```

NOTE: As of writing, I know that clearing specific resources is not ideal.  I would love thoughts on how to make it better.

#### Ingesting data

Sometimes you might have data that is loaded in the format of a request from the API, but is loaded in a different way, for instance, through server rendered props.  This will add data to the cache for the given arguments so that calling `fetch` for the data will reference that data.

```js
import { useResource } from "@reactistry/react-data-cache"

function Component({ episodeData, id }) {
  const { ingest } = useResource("api")

  ingest(episodeData, `path/to/episode/${id}`)

  return <Episode episodeId={id} />
}

function Episode({ episodeId }) {
  const { fetch } = useResource("api")
  const episode = fetch(`path/to/episode/${id}`)
  // episode === episodeData and does not make request to resolver
  return <EpisodeDisplay episode={episode}/>
}
```

#### Handling Errors

[React can use Error Boundaries](https://reactjs.org/docs/error-boundaries.html) to handle errors from your requests so that you don't have to build special functionality into your resolvers. When doing so, it is important to clear out failed requests because they will be stored in the cache.

### Examples

- [API resource based example](https://codesandbox.io/s/basic-example-zljb6) - This demonstrates an example of a simple api resource that has a resolver that is simply a wrapper around `fetch`.  In it, you can see how loading states are handled, as well as how caching keeps data in store so that extra requests don't need to be made when navigating back to previous pages.  Also, you can see that characters that have been loaded from other episode views use the cached values rather than making new requests.  In addition, there is a button to test clearing the cache and seeing how that forces the reload.  The last button gives the example of an error boundary and how it can be used to handle scenarios where an API request fails (NOTE: there is an extra layer that is shown on errors from CodeSandbox, but you can close it to see the error).
- [RESTful resource based example](https://codesandbox.io/s/resource-based-84hci) - Very similar to the approach above, but instead of using just the wrapper around fetch, it shows how the implementation can be easier/different if you define extra resolvers in the ResourceProvider
- [Preloading vs not Preloading example](https://codesandbox.io/s/preload-not-preload-example-ysij7) - Its important to think about how your data will load on your page, and although `react-data-cache` provides some simple ways of handling that data, its important that you load your data in the right place.  This is an example that shows the difference in load times between a Waterfall (not using preload) approach and

### API

#### `ResourceProvider`

Component to define resources

**Props**
| Prop | type / shape | required? |
|---|---|---|
| resources | Array of objects with keys(name: string _required_, resolver: function _required_, keyGenerator: function _optional_) | yes |
| children | node | yes |

**Resource object shape**
|key | value type | required? | example |
|---|---|---|---|
| name | string | yes | "api" |
| resolver | function (args can be whatever and are received when calling `fetch`/`preload`/etc) | yes | `(path, options) => fetch(path, options).then(result => result.json())` |
| keyGenerator | function (args are same as resolver), required to return string | yes | `keyGenerator: (path, options) => "my-key-for-${path}-${JSON.stringify(options)}"` |

#### `useResource`

Hook returning functions to interact with resources

```js
  const { fetch, preload, clear, ingest, readFromCache } = useResource(resourceName)
```

| function name | simple explanation | arguments | returns | triggers suspense loading | makes request |
|---|---|---|---|---|---|
| fetch | requests and returns data from resolver | _any_ (will be sent to resolver) | resolved result of the resolver | yes | yes |
| preload | requests data from resolver without triggering load | _any_ (will be sent to resolver) | `undefined` | no | yes |
| clear | clears cache of data and refreshes any requests | _function_(optional) return true for each key in the cache that you want to clear | `undefined` | only if fetch is being called for the resources that have had their cache cleared | <--- |
| ingest | loads data into the cache without making a request | _value_ result that would come from resolver, _any_ (args that would be sent to the resolver) | value | no | no |
| readFromCache| reads data from the cache without making a request | _any_ (same args that would be used for fetch) | cached result for the args | no | no |

## How does this vary from the current React experimental approach?

Currently, react-cache is being unified with the concept of `react-fetch`, which connects this process with native fetch.  While this is handy, it can be difficult in some circumstances where there are already predefined functions that are used to fetch data.  By using resolvers, you can wrap all the fetching, serialization/deserialization, etc in your resolver, or you can simply make the resource a wrapper around fetch, but we don't want to couple it any closer to your implementation.  In addition, the current `react-fetch` implementation does not have the extra features like ingesting and clearing data.
