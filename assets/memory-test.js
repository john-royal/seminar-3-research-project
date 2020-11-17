'use strict'

module.exports = () => {
  const images = Array.from(document.querySelectorAll('.image'))
  const draggable = document.getElementById('draggable-image')

  let overlap = null
  let last = null

  function findOverlap (top, left) {
    return images.find(image => {
      const rect1 = image.getBoundingClientRect()
      let rect2 = { top, left }
      if (!(top && left)) {
        rect2 = draggable.getBoundingClientRect()
      }

      return !(
        rect1.top > rect2.bottom ||
        rect1.right < rect2.left ||
        rect1.bottom < rect2.top ||
        rect1.left > rect2.right
      )
    })
  }

  function updateOverlap (force = false) {
    if (last && Date.now() - last <= 25 && !force) {
      return
    }
    last = Date.now()
    const detectedOverlap = findOverlap()
    if (overlap !== detectedOverlap) {
      if (overlap) {
        overlap.classList.remove('image--is-dragging')
      }
      overlap = detectedOverlap
    }
    if (overlap) {
      overlap.classList.add('image--is-dragging')
    }
    return overlap
  }

  function onDrag (event) {
    const image = event.target
    const id = image.id
    const dragImageClass = window.state[id]
    if (!dragImageClass) {
      return
    }
    document.querySelector('html').classList.add('unselectable')

    draggable.classList.add(dragImageClass)
    image.classList.add('image--is-dragging')

    // centers the ball at (pageX, pageY) coordinates
    function moveAt (pageX, pageY) {
      const top = pageY - draggable.offsetHeight / 2
      const left = pageX - draggable.offsetWidth / 2
      if (draggable.style.top !== `${top}px`) {
        draggable.style.top = `${top}px`
      }
      draggable.style.left = `${left}px`
      updateOverlap()
    }

    // move our absolutely positioned ball under the pointer
    moveAt(event.pageX, event.pageY)

    function onMouseMove (event) {
      moveAt(event.pageX, event.pageY)
    }

    function onMouseUp () {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      updateOverlap(true)
      if (overlap) {
        const displaceImageClass = window.state[overlap.id]
        if (displaceImageClass) {
          overlap.classList.remove(displaceImageClass)
          image.classList.add(displaceImageClass)
        }
        image.classList.remove(dragImageClass)
        overlap.classList.add(dragImageClass)
        window.state[overlap.id] = dragImageClass
        window.state[image.id] = displaceImageClass
        overlap.classList.remove('image--is-dragging')
        overlap = null
      }
      draggable.classList.remove(dragImageClass)
      image.classList.remove('image--is-dragging')
      document.querySelector('html').classList.remove('unselectable')
    }

    // (2) move the ball on mousemove
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    image.ondragstart = function () {
      return false
    }
  }

  images.forEach(el => {
    el.onmousedown = onDrag
  })
}
