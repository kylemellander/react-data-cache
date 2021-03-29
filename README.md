# React-Data-Cache

React-Data-Cache looks to leverage the [React Suspense API](https://reactjs.org/docs/concurrent-mode-suspense.html) in order to create a configurable hook that can be used to build a clean, easy to use interface to fetch data and handle loading and error states.

[![NPM](https://img.shields.io/npm/v/@planningcenter/react-data-cache.svg)](https://www.npmjs.com/package/@planningcenter/react-data-cache)

## Is this safe to use?

React.Suspense is a part of the core React library, but it is still listed as experimental.  It is subject to change so this library could become obsolete in time.  One of the goals of this library is to stay as closely tied to the progress that is being made to by the core React team with experiments that are happening on things like `react-cache` and `react-fetch`, so that if the core team rolls out an official version, then this could be adapted easily to their format.

None of the logic in this library uses experimental React logic, but because it is trying to push the edges of where React is going, it is possible that your application might need to rework some details if React moves away from the Suspense approach.

## Using React-Data-Cache

### Quickstart

// TODO: add details on how to add this to your app

### More usage

### API

## More Advanced Usage Tips And Questions

### Preventing Waterfalls

Using a `fetch-on-render` approach can lead to waterfalls.  What this means is that you render component A which is loading a resource and its child is component B which also loads a resource.  If component B does not fully render until component A is fully loaded, then it will create a waterfall approach to loading.

For example, if you have a social media post with comments.  If you use this approach, then the social media post will load, and then when it is finished, the comments will load.  This gives people the most important data first, but takes a while to load. On the other hand, if you load both the post and the comments before any rendering, then it will delay the user being able to see anything until all is loaded.  You can easily prevent this by defining components that are data fetching components and then rendering components that consume the data.

```js
const buildPostURL(postId) {
  return `/api/posts/${postId}`
}

function SocialMediaPostDataFetcher({ postId }) {
  const { preload } = useResource("api")
  preload(buildPostURL(postId))
  preload(`${buidPostURL(postId)}/comments`)
}

function SocialMediaPost({ postId }) {
  const { read } = useResource("api")
  const post = read(buildPostURL(postId))

  return <div>
    <h1>{post.title}</h1>
    <div class="post-body">{post.body}</div>
    <PostComments postId={postId} />
  </div>
}

function PostComments({postId}) {
  const { read } = useResource("api")
  const comments = read(`${buidPostURL(postId)}/comments`)

  return <div>
    {comments.map(comment => <PostComment key={comment.id} comment={comment}/>)}
  </div>
}
```

In this example, the `SocialMediaPostDataFetcher` component makes the fetch requests for all the data we need without holding anything up. The components that require the data that is loaded will render the fallback while the request for the resource referenced, but then will render the element as soon as it is ready, without need for additional requests.

It is recommended that you load all the data you want for a particular view at once using `preload` and then use `read` to display it where you want to render it.

## How does this vary from the current React experimental approach?

Currently, react-cache is being unified with the concept of `react-fetch`, which connects this process with native fetch.  While this is handy, it can be difficult in some circumstances where there are already predefined functions that are used to fetch data.  By using resolvers, you can wrap all the fetching, serialization/deserialization, etc in your resolver, or you can simply make the resource a wrapper around fetch, but we don't want to couple it any closer to your implementation.
