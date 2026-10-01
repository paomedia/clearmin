// Tooltips & popovers which are not initialized through data-bs-toggle
document.addEventListener('DOMContentLoaded', () => {
  for (const element of document.querySelectorAll('.tooltip-test')) {
    bootstrap.Tooltip.getOrCreateInstance(element)
  }

  for (const element of document.querySelectorAll('.popover-test')) {
    bootstrap.Popover.getOrCreateInstance(element)
  }
})
