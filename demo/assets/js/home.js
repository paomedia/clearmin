// Switch navbars (and their buttons) to the clicked color
document.addEventListener('DOMContentLoaded', () => {
  let current = 'primary'

  for (const button of document.querySelectorAll('#demo-buttons [data-switch-color]')) {
    button.addEventListener('click', () => {
      const color = button.dataset.switchColor

      for (const navbar of document.querySelectorAll('.cm-navbar')) {
        navbar.classList.replace(`cm-navbar-${current}`, `cm-navbar-${color}`)
      }

      for (const btn of document.querySelectorAll('.cm-navbar .btn')) {
        btn.classList.replace(`btn-${current}`, `btn-${color}`)
      }

      current = color
    })
  }
})
