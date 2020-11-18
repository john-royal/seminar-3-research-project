'use strict'

module.exports = () => {
  'use strict'

  const form = document.getElementById('form')

  if (!form) return

  const timeout = ms => new Promise(resolve => setTimeout(resolve, ms))
  form.onsubmit = async e => {
    e.preventDefault()
    const content = {}
    for (const element of form.elements) {
      if (element.name && element.value) {
        content[element.name] = element.value
      }
      element.disabled = true
    }
    fetch(window.location.pathname, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(content)
    })
      .then(response => {
        if (response.ok) {
          Turbolinks.visit(window.NEXT_SCREEN)
        } else {
          console.warn('Response not ok')
          console.warn(response)
        }
      })
      .catch(error => {
        console.error(error)
      })
      .finally(() => {
        for (const element of form.elements) {
          element.disabled = false
        }
      })
  }
}
