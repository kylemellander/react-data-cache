import sleep from 'sleep-promise'

export function fetchWrapperResolver(...args) {
  return fetch(...args)
    .then(sleep(1000))
    .then((result) => result.json())
}
