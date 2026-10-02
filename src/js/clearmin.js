/*!
 * Clearmin v2.0.1 — Bootstrap 5.3 dashboard / admin template
 * Licensed under GPL-3.0 (https://github.com/paomedia/clearmin/blob/master/LICENSE)
 *
 * Vanilla JS, no dependency. Load it after bootstrap.min.js.
 * Options can be set before loading this file:
 *   <script>window.CMConfig = { menuSwiper: false }</script>
 *
 * To avoid a flash of the wrong color mode, add this to <head>:
 *   <script>try{document.documentElement.dataset.bsTheme=localStorage.getItem('cm-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){}</script>
 */
(() => {
  'use strict'

  const $ = (selector, context = document) => context.querySelector(selector)
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector))

  const nextSiblings = element => {
    const siblings = []
    while ((element = element.nextElementSibling)) {
      siblings.push(element)
    }

    return siblings
  }

  const cookie = {
    get(name) {
      const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
      return match ? decodeURIComponent(match[1]) : null
    },
    set(name, value) {
      document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`
    }
  }

  const CM = {
    config: {
      navbarHeight: 50, // should reflect the $cm-navbar-height scss variable
      menuSwiper: true, // enable swipe gesture to toggle the menu on touch devices
      menuSwiperIOS: true, // enable swipe gesture on iOS Safari
      restoreMenuState: true // restore the condensed menu state from the cookie
    },

    init(config = {}) {
      Object.assign(this.config, config)
      const body = document.body

      body.insertAdjacentHTML('beforeend',
        '<div id="cm-menu-backdrop"></div>' +
        '<div id="cm-submenu-popover"><div class="cm-popover cm-popover-end">' +
        '<div class="cm-popover-arrow"></div><ul></ul></div></div>')

      if (this.config.restoreMenuState && cookie.get('cm-menu-toggled') === 'true' && !this.getState().mobile) {
        body.classList.add('cm-menu-toggled')
      }

      // Let Bootstrap compensate the scrollbar width on the fixed header when a modal opens
      $('#cm-header')?.classList.add('is-fixed')

      // Navbar dropdowns are statically positioned so they can be animated
      for (const toggle of $$('.cm-navbar [data-bs-toggle="dropdown"]')) {
        toggle.dataset.bsDisplay = 'static'
      }

      this.theme.init()
      this.menu.init()
      this.search.init()
      this.navbars.init()
      this.breadcrumb.init()
      this.tabs.init()
      this.popovers.init()
      this.tables.init()

      for (const trigger of $$('[data-cm-toast]')) {
        trigger.addEventListener('click', () => this.toast(trigger.dataset.cmToast, {
          title: trigger.dataset.cmToastTitle,
          color: trigger.dataset.cmToastColor
        }))
      }

      if (this.config.menuSwiper && 'ontouchstart' in window) {
        this.swiper.init()
      }

      if (window.bootstrap) {
        for (const element of $$('[data-bs-toggle="tooltip"]')) {
          window.bootstrap.Tooltip.getOrCreateInstance(element)
        }

        for (const element of $$('[data-bs-toggle="popover"]')) {
          window.bootstrap.Popover.getOrCreateInstance(element)
        }
      }

      const enableTransitions = () => body.classList.remove('cm-no-transition')
      if (document.readyState === 'complete') {
        enableTransitions()
      } else {
        window.addEventListener('load', enableTransitions)
      }
    },

    // Show a Bootstrap toast in the bottom right corner:
    // CM.toast('Saved!', { title: 'Article', color: 'success', delay: 4000 })
    toast(message, { title, color = 'primary', delay = 4000 } = {}) {
      let container = $('#cm-toasts')
      if (!container) {
        container = document.createElement('div')
        container.id = 'cm-toasts'
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3'
        document.body.append(container)
      }

      const toast = document.createElement('div')
      toast.className = `toast align-items-center text-bg-${color} border-0`
      toast.setAttribute('role', 'status')
      toast.setAttribute('aria-live', 'polite')
      toast.setAttribute('aria-atomic', 'true')
      toast.innerHTML = '<div class="d-flex"><div class="toast-body"><strong class="d-block"></strong><span></span></div>' +
        '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>'
      const strong = $('strong', toast)
      if (title) {
        strong.textContent = title
      } else {
        strong.remove()
      }

      $('.toast-body span', toast).textContent = message
      container.append(toast)

      const instance = window.bootstrap.Toast.getOrCreateInstance(toast, { delay })
      toast.addEventListener('hidden.bs.toast', () => toast.remove())
      instance.show()
      return instance
    },

    afterTransition(callback) {
      setTimeout(callback, 150)
    },

    // mobile: the menu is off-canvas; open: the menu is visible (not condensed on desktop)
    getState() {
      const backdrop = $('#cm-menu-backdrop')
      const mobile = Boolean(backdrop) && getComputedStyle(backdrop).display !== 'none'
      return {
        mobile,
        open: mobile === document.body.classList.contains('cm-menu-toggled')
      }
    },

    // Light / dark color mode. The choice is stored in localStorage ("cm-theme"),
    // otherwise the OS preference is followed. Toggles: [data-toggle="cm-theme"]
    theme: {
      init() {
        this.toggles = $$('[data-toggle="cm-theme"]')
        for (const toggle of this.toggles) {
          toggle.addEventListener('click', () => this.set(this.get() === 'dark' ? 'light' : 'dark'))
        }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
          if (!this.stored()) {
            this.apply(this.get())
          }
        })

        this.apply(this.get())
      },

      stored() {
        try {
          return localStorage.getItem('cm-theme')
        } catch {
          return null
        }
      },

      get() {
        return this.stored() || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      },

      set(theme) {
        try {
          localStorage.setItem('cm-theme', theme)
        } catch {}

        this.apply(theme)
      },

      apply(theme) {
        document.documentElement.dataset.bsTheme = theme
        for (const toggle of this.toggles) {
          toggle.setAttribute('aria-pressed', theme === 'dark')
          const icon = $('i', toggle)
          if (icon) {
            icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'
          }
        }

        document.dispatchEvent(new CustomEvent('cm:themechange', { detail: { theme } }))
      }
    },

    // Sortable, filterable and paginated tables:
    //   <input type="search" data-cm-table-filter="#users">
    //   <table id="users" class="table" data-cm-table data-cm-page-size="10">
    //     <thead><tr><th data-sort>Name</th><th data-sort="number">Age</th><th data-sort="date">Date</th>...
    // A cell can provide its sort value in data-value.
    tables: {
      init() {
        for (const table of $$('table[data-cm-table]')) {
          this.setup(table)
        }
      },

      setup(table) {
        const tbody = table.tBodies[0]
        const headers = table.tHead ? Array.from(table.tHead.rows[0].cells) : []
        const state = {
          rows: Array.from(tbody.rows),
          query: '',
          page: 1,
          size: Number(table.dataset.cmPageSize) || 0
        }
        const filters = table.id ? $$(`[data-cm-table-filter="#${table.id}"]`) : []
        table.classList.add('cm-table')

        const value = (row, index, type) => {
          const cell = row.cells[index]
          const raw = cell?.dataset.value ?? cell?.textContent.trim() ?? ''
          if (type === 'number') {
            return Number.parseFloat(raw.replace(/[^\d.-]/g, '')) || 0
          }

          if (type === 'date') {
            return Date.parse(raw) || 0
          }

          return raw.toLowerCase()
        }

        headers.forEach((th, index) => {
          if (!('sort' in th.dataset)) {
            return
          }

          th.tabIndex = 0
          th.setAttribute('aria-sort', 'none')
          const sort = () => {
            const direction = th.getAttribute('aria-sort') === 'ascending' ? -1 : 1
            for (const header of headers) {
              if (header.hasAttribute('aria-sort')) {
                header.setAttribute('aria-sort', 'none')
              }
            }

            th.setAttribute('aria-sort', direction > 0 ? 'ascending' : 'descending')
            const type = th.dataset.sort
            state.rows.sort((a, b) => {
              const x = value(a, index, type)
              const y = value(b, index, type)
              return (typeof x === 'number' ? x - y : x.localeCompare(y, undefined, { numeric: true })) * direction
            })
            render()
          }

          th.addEventListener('click', sort)
          th.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              sort()
            }
          })
        })

        for (const input of filters) {
          input.addEventListener('input', () => {
            state.query = input.value.trim().toLowerCase()
            state.page = 1
            render()
          })
        }

        let footer = null
        if (state.size || filters.length) {
          footer = document.createElement('div')
          footer.className = 'cm-table-footer'
          footer.innerHTML = '<div class="cm-table-info" aria-live="polite"></div><nav><ul class="pagination pagination-sm"></ul></nav>'
          ;(table.closest('.table-responsive') || table).after(footer)
          footer.addEventListener('click', event => {
            const link = event.target.closest('[data-page]')
            if (link) {
              event.preventDefault()
              state.page = Number(link.dataset.page)
              render()
            }
          })
        }

        const pageItem = (page, label, { active = false, disabled = false, ariaLabel } = {}) =>
          `<li class="page-item${active ? ' active' : ''}${disabled ? ' disabled' : ''}">` +
          `<a class="page-link" href="#" data-page="${page}"${ariaLabel ? ` aria-label="${ariaLabel}"` : ''}${active ? ' aria-current="page"' : ''}>${label}</a></li>`

        const render = () => {
          const matched = state.query ? state.rows.filter(row => row.textContent.toLowerCase().includes(state.query)) : state.rows
          const pages = state.size ? Math.max(1, Math.ceil(matched.length / state.size)) : 1
          state.page = Math.min(Math.max(state.page, 1), pages)
          const start = state.size ? (state.page - 1) * state.size : 0
          const visible = state.size ? matched.slice(start, start + state.size) : matched

          if (visible.length) {
            tbody.replaceChildren(...visible)
          } else {
            const row = document.createElement('tr')
            row.className = 'cm-table-empty'
            row.innerHTML = `<td colspan="${headers.length || 1}">No matching records</td>`
            tbody.replaceChildren(row)
          }

          if (!footer) {
            return
          }

          const filtered = matched.length === state.rows.length ? '' : ` (filtered from ${state.rows.length})`
          $('.cm-table-info', footer).textContent = matched.length ?
            `Showing ${start + 1}–${start + visible.length} of ${matched.length}${filtered}` :
            `No entries${filtered}`

          let items = ''
          if (pages > 1) {
            const first = Math.max(1, Math.min(state.page - 2, pages - 4))
            const last = Math.min(pages, first + 4)
            items += pageItem(state.page - 1, '&lsaquo;', { disabled: state.page === 1, ariaLabel: 'Previous' })
            for (let page = first; page <= last; page++) {
              items += pageItem(page, page, { active: page === state.page })
            }

            items += pageItem(state.page + 1, '&rsaquo;', { disabled: state.page === pages, ariaLabel: 'Next' })
          }

          $('.pagination', footer).innerHTML = items
        }

        render()
      }
    },

    breadcrumb: {
      init() {
        const breadcrumbs = $$('.cm-navbar .breadcrumb')
        if (!breadcrumbs.length) {
          return
        }

        const fitAll = () => breadcrumbs.forEach(breadcrumb => this.fit(breadcrumb))
        fitAll()
        window.addEventListener('load', fitAll)
        window.addEventListener('resize', fitAll)
      },

      // Hide the first items until the breadcrumb fits in its container
      fit(breadcrumb) {
        const container = breadcrumb.parentElement
        breadcrumb.classList.remove('lonely')
        $$('.ellipsis', breadcrumb).forEach(item => item.remove())

        const items = Array.from(breadcrumb.children)
        items.forEach(item => {
          item.hidden = false
        })

        let hidden = 0
        while (breadcrumb.offsetWidth > container.clientWidth - 15 && hidden < items.length - 1) {
          items[hidden++].hidden = true
        }

        const visible = items.length - hidden
        if (visible > 1 && hidden) {
          breadcrumb.insertAdjacentHTML('afterbegin', '<li class="breadcrumb-item active ellipsis" aria-hidden="true">&hellip;</li>')
        } else if (visible === 1) {
          breadcrumb.classList.add('lonely')
        }
      }
    },

    tabs: {
      init() {
        for (const container of $$('.cm-navbar .nav-tabs')) {
          let animate = false
          const center = item => {
            const containerRect = container.getBoundingClientRect()
            const itemRect = item.getBoundingClientRect()
            const left = Math.max(container.scrollLeft + itemRect.left - containerRect.left - ((containerRect.width - itemRect.width) / 2), 0)
            if (animate) {
              container.scrollTo({ left, behavior: 'smooth' })
            } else {
              container.scrollLeft = left
              animate = true
            }
          }

          container.addEventListener('click', event => {
            const item = event.target.closest('.nav-item')
            if (item) {
              center(item)
            }
          })

          // Vertical mouse wheel scrolls the tabs horizontally
          container.addEventListener('wheel', event => {
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
              return
            }

            event.preventDefault()
            container.scrollLeft += event.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? event.deltaY : event.deltaY * 16
          }, { passive: false })

          const active = $('.nav-link.active', container)
          if (active) {
            center(active.closest('.nav-item') || active)
          }
        }
      }
    },

    // `.cm-navbar-slideup` navbars slide away when scrolling down
    navbars: {
      init() {
        const navbars = $$('.cm-navbar-slideup')
        if (!navbars.length) {
          return
        }

        let last = window.scrollY
        let current = 0
        window.addEventListener('scroll', () => {
          if (document.body.classList.contains('cm-scroll-lock')) {
            return
          }

          const offset = window.scrollY
          let shift = Math.max(Math.min(current - offset + last, 0), -CM.config.navbarHeight - 1)
          if (offset <= 0) {
            shift = 0
          }

          for (const navbar of navbars) {
            navbar.style.transform = `translateY(${shift}px)`
          }

          current = shift
          last = offset
        }, { passive: true })
      }
    },

    search: {
      init() {
        const form = $('#cm-search')
        const input = $('#cm-search input')
        const button = $('#cm-search-btn')
        if (!input) {
          return
        }

        this.open = button?.classList.contains('open') ?? false
        this.toggling = false

        for (const toggle of $$('[data-toggle="cm-search"]')) {
          // Clicking the toggle while the search is open only closes it (input blur)
          toggle.addEventListener('mousedown', () => {
            this.toggling = this.open
          })
          toggle.addEventListener('click', () => {
            if (!this.open && !this.toggling) {
              this.open = true
              input.focus()
            }
          })
        }

        input.addEventListener('focus', () => {
          form.classList.add('open')
          button?.classList.add('open')
          this.open = true
        })

        input.addEventListener('blur', () => {
          form.classList.remove('open')
          CM.afterTransition(() => button?.classList.remove('open'))
          this.open = false
        })
      }
    },

    // Center `.cm-popover` dropdowns under their navbar button, inside the viewport
    popovers: {
      init() {
        const popovers = $$('.cm-navbar .cm-popover')
        if (!popovers.length) {
          return
        }

        for (const popover of popovers) {
          this.place(popover)
          popover.parentElement.addEventListener('show.bs.dropdown', () => this.place(popover))
        }

        window.addEventListener('resize', () => popovers.forEach(popover => this.place(popover)))
      },

      place(popover) {
        const margin = 10 // minimum space between the popover and the viewport border
        const arrow = $('.cm-popover-arrow', popover)
        const parent = popover.parentElement
        const width = popover.offsetWidth
        const center = parent.getBoundingClientRect().left + (parent.offsetWidth / 2)
        const max = document.documentElement.clientWidth - margin
        let left = (parent.offsetWidth - width) / 2
        let offset = 0

        if (center + (width / 2) > max) {
          offset = center + (width / 2) - max
        } else if (center - (width / 2) < margin) {
          offset = center - (width / 2) - margin
        }

        left -= offset
        popover.style.left = `${left}px`
        if (arrow) {
          arrow.style.left = offset ? `${(width / 2) + offset}px` : ''
        }
      }
    },

    menu: {
      init() {
        this.scroll = 0
        this.wheelDelta = 0
        this.popover = $('#cm-submenu-popover')
        const scroller = $('#cm-menu-scroller')

        for (const toggle of $$('[data-toggle="cm-menu"]')) {
          toggle.addEventListener('click', () => this.toggle())
        }

        $('#cm-menu-backdrop').addEventListener('click', () => this.toggle())

        if (scroller) {
          scroller.addEventListener('scroll', () => this.hidePopover())
          scroller.addEventListener('wheel', event => this.wheel(event), { passive: false })
        }

        for (const link of $$('#cm-menu a')) {
          link.addEventListener('click', () => {
            if (!link.getAttribute('href')) {
              return
            }

            if (CM.getState().mobile) {
              this.setToggled(false)
            }

            if (!link.closest('.cm-submenu')) {
              this.closeSubmenus()
            }
          })
        }

        for (const submenu of $$('.cm-submenu')) {
          submenu.addEventListener('click', event => {
            if (!event.target.closest('.cm-submenu > ul')) {
              this.toggleSubmenu(submenu)
            }
          })
        }

        document.addEventListener('click', event => {
          if (!event.target.closest('#cm-submenu-popover, .cm-submenu')) {
            this.hidePopover()
          }
        })

        document.addEventListener('keydown', event => {
          if (event.key === 'Escape') {
            this.hidePopover()
          }
        })

        const state = CM.getState()
        for (const submenu of $$('.cm-submenu.pre-open')) {
          submenu.classList.remove('pre-open')
          if (state.mobile || state.open) {
            this.openSubmenu(submenu)
          }
        }
      },

      // Scroll the menu item by item
      wheel(event) {
        event.preventDefault()
        const step = CM.config.navbarHeight + 1
        this.wheelDelta += event.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? event.deltaY : event.deltaY * step
        if (Math.abs(this.wheelDelta) < step / 2) {
          return // wait for more touchpad movement
        }

        const direction = Math.sign(this.wheelDelta)
        this.wheelDelta = 0

        let max = step - window.innerHeight
        for (const element of $$('.cm-menu-items > li, .cm-submenu.open > ul')) {
          max += element.offsetHeight
        }

        const scroll = Math.min(Math.max(this.scroll - (direction * step), -step * Math.ceil(max / step)), 0)
        $('.cm-menu-items').style.transform = `translateY(${scroll}px)`
        this.scroll = scroll
        this.hidePopover()
      },

      toggleSubmenu(submenu) {
        const state = CM.getState()
        if (!state.mobile && !state.open) {
          this.setPopover(submenu)
          return
        }

        const wasOpen = submenu.classList.contains('open')
        this.closeSubmenus()
        if (!wasOpen) {
          this.openSubmenu(submenu)
        }
      },

      // Opened submenu pushes the following items down
      openSubmenu(submenu) {
        const height = $(':scope > ul', submenu).offsetHeight
        submenu.classList.add('open')
        for (const sibling of nextSiblings(submenu)) {
          sibling.style.transform = `translateY(${height}px)`
        }
      },

      closeSubmenus() {
        $$('.cm-submenu').forEach(submenu => submenu.classList.remove('open'))
        $$('.cm-menu-items li').forEach(item => item.style.removeProperty('transform'))
      },

      hidePopover() {
        this.popover?.classList.remove('show')
        $$('.cm-submenu.popen').forEach(submenu => submenu.classList.remove('popen'))
      },

      // Condensed menu: show the submenu items in a popover next to the menu
      setPopover(submenu) {
        const container = this.popover
        const popover = $('.cm-popover', container)
        const arrow = $('.cm-popover-arrow', popover)

        if (submenu.classList.contains('popen') && container.classList.contains('show')) {
          this.hidePopover()
          return
        }

        $$('.cm-submenu.popen').forEach(item => item.classList.remove('popen'))
        $('ul', popover).innerHTML = $(':scope > ul', submenu).innerHTML

        const margin = 10
        const max = window.innerHeight - margin
        const height = popover.offsetHeight
        const linkRect = submenu.firstElementChild.getBoundingClientRect()
        let top = linkRect.top + (linkRect.height / 2) - (height / 2)

        arrow.hidden = false
        if (top + height > max) {
          const offset = top + height - max
          top -= offset
          arrow.style.top = `${(height / 2) + offset}px`
        } else if (top < margin) {
          const offset = top - margin
          top -= offset
          arrow.style.top = `${(height / 2) + offset}px`
        } else {
          arrow.style.top = '50%'
        }

        if (arrow.offsetTop > height) {
          arrow.hidden = true
        }

        container.style.top = `${top}px`
        submenu.classList.add('popen')
        container.classList.add('show')
      },

      setToggled(toggled) {
        document.body.classList.toggle('cm-menu-toggled', toggled)
        document.body.classList.toggle('cm-scroll-lock', toggled && CM.getState().mobile)
        cookie.set('cm-menu-toggled', false)
      },

      toggle() {
        const body = document.body
        body.classList.toggle('cm-menu-toggled')
        const state = CM.getState()

        if (state.mobile) {
          cookie.set('cm-menu-toggled', false)
          body.classList.toggle('cm-scroll-lock', state.open)
          return
        }

        this.closeSubmenus()
        this.hidePopover()
        cookie.set('cm-menu-toggled', !state.open)
        // Let charts & co. adapt to the new content width once the transition is over
        setTimeout(() => window.dispatchEvent(new Event('resize')), 200)
      }
    },

    // Drag the menu open from the left border of the screen, or drag it closed (mobile).
    // The menu follows the finger; on release it settles open or closed depending on
    // the fling velocity, or on how far it was dragged when released slowly.
    swiper: {
      slop: 10, // px of movement before the gesture picks an axis
      fling: 0.3, // px/ms above which the release velocity decides the direction
      samples: 100, // ms of movement used to measure the release velocity

      init() {
        this.menu = $('#cm-menu')
        this.backdrop = $('#cm-menu-backdrop')
        if (!this.menu) {
          return
        }

        this.ios = navigator.vendor.indexOf('Apple') === 0 && /\sSafari\//.test(navigator.userAgent)
        if (this.ios && !CM.config.menuSwiperIOS) {
          return
        }

        document.addEventListener('touchstart', event => this.start(event), { passive: true })
        // Not passive: once the menu is being dragged, the page must not scroll
        document.addEventListener('touchmove', event => this.move(event), { passive: false })
        document.addEventListener('touchend', event => this.end(event), { passive: true })
        document.addEventListener('touchcancel', event => this.end(event, true), { passive: true })
      },

      touch(event) {
        return Array.from(event.changedTouches).find(touch => touch.identifier === this.id)
      },

      start(event) {
        if (this.tracking) {
          return // a second finger, keep following the first one
        }

        this.finish()
        const touch = event.changedTouches[0]
        const state = CM.getState()
        // iOS Safari uses the very border of the screen for its own back gesture
        const edgeMin = this.ios ? 10 : 0
        const edgeMax = this.ios ? 90 : 50
        if (!state.mobile || (!state.open && (touch.clientX < edgeMin || touch.clientX > edgeMax))) {
          return
        }

        this.tracking = true
        this.dragging = false
        this.id = touch.identifier
        this.open = state.open
        this.width = this.menu.offsetWidth
        this.x0 = touch.clientX
        this.y0 = touch.clientY
      },

      move(event) {
        const touch = this.tracking && this.touch(event)
        if (!touch) {
          return
        }

        if (!this.dragging) {
          const dx = touch.clientX - this.x0
          const dy = touch.clientY - this.y0
          if (Math.hypot(dx, dy) < this.slop) {
            return
          }

          // Mostly vertical, or pushing the menu where it already is: let the page scroll
          if (Math.abs(dy) > Math.abs(dx) || (dx > 0) === this.open) {
            this.tracking = false
            return
          }

          // Follow the finger from here on, so the menu does not jump by the slop
          this.dragging = true
          this.x0 = touch.clientX
          this.from = this.open ? this.width : 0
          this.pos = this.from
          this.history = []
          this.menu.style.transition = 'none'
          this.backdrop.style.transition = 'none'
          this.backdrop.style.visibility = 'visible'
        }

        if (event.cancelable) {
          event.preventDefault()
        }

        this.pos = Math.min(Math.max(this.from + touch.clientX - this.x0, 0), this.width)
        this.history.push({ x: touch.clientX, t: event.timeStamp })
        if (!this.frame) {
          this.frame = requestAnimationFrame(() => {
            this.frame = null
            this.render(this.pos)
          })
        }
      },

      end(event, cancelled = false) {
        const touch = this.tracking && this.touch(event)
        if (!touch) {
          return
        }

        this.tracking = false
        if (!this.dragging) {
          return
        }

        this.dragging = false
        cancelAnimationFrame(this.frame)
        this.frame = null
        this.render(this.pos)

        // Velocity over the last moments only: holding still before releasing is not a fling
        const recent = this.history.filter(sample => event.timeStamp - sample.t <= this.samples)
        const first = recent[0]
        const last = recent[recent.length - 1]
        const velocity = recent.length > 1 && last.t > first.t ? (last.x - first.x) / (last.t - first.t) : 0

        let open
        if (cancelled) {
          open = this.open
        } else if (Math.abs(velocity) > this.fling) {
          open = velocity > 0
        } else {
          open = this.pos > this.width / 2
        }

        this.settle(open, velocity)
      },

      render(pos) {
        this.menu.style.transform = `translateX(${pos}px)`
        this.backdrop.style.opacity = (pos / this.width) / 2
      },

      // Animate to the final position, keeping the speed of the finger when it was flung
      settle(open, velocity) {
        const distance = Math.abs((open ? this.width : 0) - this.pos)
        const speed = Math.max(Math.abs(velocity), this.width / 250)
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const duration = reduce ? 0 : Math.round(Math.min(Math.max(distance / speed, 100), 300))
        const transition = `${duration}ms cubic-bezier(.2, .8, .4, 1)`

        this.menu.style.transition = `transform ${transition}`
        this.backdrop.style.transition = `opacity ${transition}`
        this.menu.getBoundingClientRect() // start from the last rendered position
        this.render(open ? this.width : 0)
        if (open !== this.open) {
          CM.menu.setToggled(open)
        }

        // The inline styles now match the stylesheet: drop them once the menu is there
        this.timer = setTimeout(() => this.finish(), duration + 50)
      },

      finish() {
        clearTimeout(this.timer)
        this.timer = null
        for (const property of ['transition', 'transform']) {
          this.menu.style.removeProperty(property)
        }

        for (const property of ['transition', 'visibility', 'opacity']) {
          this.backdrop.style.removeProperty(property)
        }
      }
    }
  }

  window.CM = CM

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CM.init(window.CMConfig))
  } else {
    CM.init(window.CMConfig)
  }
})()
