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
