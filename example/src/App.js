import React from 'react'
import { BasicExample } from './BasicExample'

export default function App() {
  return (
    <>
      <Introduction />
      <BasicExample />
      <BasicExampleExplanation />
    </>
  )
}

function Introduction() {
  return (
    <>
      <h2>React-Data-Cache Example</h2>
      <p>
        This is an example of using `react-data-cache` to load data to display
      </p>
    </>
  )
}

function BasicExampleExplanation() {
  return (
    <>
      <h3>ResourceProvider Setup</h3>
      <p>
        The first part of the code sets up the `ResourceProvider` with
        resources. Resources can be set up in a couple different ways. In this
        example, it is set up with a function that wraps using the default
        `fetch` behavior and returning the JSON result.
      </p>
      <p>
        It is possible to set up resources on a more predefined basis, and there
        will be an example of that below.
      </p>
      <h3>React.Suspense</h3>
      <p>
        In this example, we have 2 levels where we define a Suspence
        wrapper/fallback. This is to wrap the loading of the episode and the
        loading each character. This allows the episode to display properly
        without showing a loading for the episode when the characters are
        loading.
      </p>
      <h3>Loading Resources</h3>
      <p>In the example, there are 2 different methods for loading data</p>
    </>
  )
}
