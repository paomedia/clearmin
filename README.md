# Clearmin Web Template

![Clearmin template](preview.png)

Bootstrap 5.3 dashboard / webapp / admin template. No jQuery: Clearmin's own script is plain JavaScript.

**Check the demo: http://cm.paomedia.com/**

**More doc inside the repo** (`docs/index.html`)

Browser support: latest Chrome, Edge, Firefox, Safari and their mobile versions.

## Repository layout

```
src/scss/          Sass sources (clearmin.scss = entry point, _variables.scss = settings)
src/js/            clearmin.js source (vanilla JS)
dist/css/          clearmin.css / clearmin.min.css + Roboto & small-n-flat stylesheets
dist/js/           clearmin.js / clearmin.min.js + untouched bootstrap.min.js and popper.min.js
dist/fontawesome/  untouched Font Awesome 7 Free (css + webfonts)
dist/fonts/        Roboto fonts
dist/img/          logo and small-n-flat svg icons
demo/              demo pages (demo-only libraries live in demo/assets)
docs/              documentation
build/             tiny node helpers used by the npm scripts
```

## Build

The CSS is compiled from the Bootstrap 5.3 Sass sources (installed with npm) and the Clearmin partials.

```sh
npm install
npm run build   # css + js + copy Bootstrap, Popper & Font Awesome into dist/
npm run watch   # recompile dist/css/clearmin.css on change
```

Every Sass variable is `!default`. To build your own theme, create an entry file and compile it with `node_modules` in the load path:

```scss
// my-theme.scss
$primary: #8e44ad;
$cm-menu-width: 240px;

@import "clearmin/src/scss/clearmin";
```

## Quick start

To start using Clearmin template in a new project you can use this minimal template:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="dist/css/clearmin.min.css">
    <link rel="stylesheet" href="dist/css/roboto.css">
    <link rel="stylesheet" href="dist/css/small-n-flat.css">
    <link rel="stylesheet" href="dist/fontawesome/css/all.min.css">
    <title>Clearmin Page</title>
  </head>
  <body class="cm-no-transition cm-1-navbar">
    <div id="cm-menu">
      <nav class="cm-navbar cm-navbar-primary">
        <div class="cm-flex"><div class="cm-logo"></div></div>
        <button type="button" class="btn btn-primary" data-toggle="cm-menu" aria-label="Toggle menu"><i class="fa-solid fa-bars" aria-hidden="true"></i></button>
      </nav>
      <div id="cm-menu-content">
        <div id="cm-menu-items-wrapper">
          <div id="cm-menu-scroller">
            <ul class="cm-menu-items">
              <li class="active"><a href="#" class="sf-house">This page is active</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <header id="cm-header">
      <nav class="cm-navbar cm-navbar-primary">
        <button type="button" class="btn btn-primary d-lg-none" data-toggle="cm-menu" aria-label="Toggle menu"><i class="fa-solid fa-bars" aria-hidden="true"></i></button>
        <div class="cm-flex"><h1>Put your title here</h1></div>
      </nav>
    </header>
    <div id="global">
      <div class="container-fluid">
        <div class="card">
          <div class="card-body">
            <h2 class="m-0">Hello World !</h2>
          </div>
        </div>
      </div>
      <footer class="cm-footer"><span class="float-end">&copy; ACME Inc.</span></footer>
    </div>
    <script src="dist/js/popper.min.js"></script>
    <script src="dist/js/bootstrap.min.js"></script>
    <script src="dist/js/clearmin.min.js"></script>
  </body>
</html>
```

## General structure

### CSS and JS files

**CSS files (`<head>`):**

*   dist/css/clearmin.min.css (Bootstrap 5.3 + Clearmin theme)
*   dist/css/roboto.css (main font)
*   dist/css/small-n-flat.css (small-n-flat colored svg icons classes)
*   dist/fontawesome/css/all.min.css (Font Awesome 7 Free icons)

**JavaScript files (just before `</body>`):**

*   dist/js/popper.min.js (required by Bootstrap dropdowns, tooltips and popovers)
*   dist/js/bootstrap.min.js (Bootstrap widgets)
*   dist/js/clearmin.min.js (Clearmin layout, no dependency)

### Body classes

*   cm-no-transition: **must** be present to prevent browsers from starting transitions on page load
*   cm-1-navbar: when one navbar is present on your page
*   cm-2-navbar: when two navbars are present on your page
*   cm-3-navbar: when three navbars are present on your page
*   cm-menu-toggled: if you want the menu to be toggled on page load (see next section)

### Preserving left menu state between pages

When the user chooses the condensed version of the side menu, we want it to stay in this state when they click on another page. To achieve this, a cookie is automatically set to reflect the menu state.

There are two different ways to restore this state:

*   **Server-side** (recommended): when your server receives a cookie named "cm-menu-toggled" with value "true", just add the `.cm-menu-toggled` class to the body tag.
*   **Client-side**: nothing to do, `.cm-menu-toggled` is automatically added to the body when needed, but it can cause a blinking reflow on some browsers.

### JavaScript options

`clearmin.js` initializes itself when the DOM is ready. Options can be set before loading it:

```html
<script>
  window.CMConfig = {
    navbarHeight: 50,       // should reflect the $cm-navbar-height Sass variable
    menuSwiper: true,       // enable swipe gesture (toggle menu) on touch devices
    menuSwiperIOS: true,    // enable swipe gesture on iOS Safari
    restoreMenuState: true  // client-side menu state restoration
  }
</script>
```

## Dashboard features

*   **Dark mode**: `<button data-toggle="cm-theme">` toggles Bootstrap 5.3 color modes (stored in localStorage, follows the OS preference by default), with its own "midnight jewel" palette (ink blue surfaces, deeper jewel tone colors, subtle glows)
*   **Stat cards**: `.card.cm-stat` KPI tiles with icon, value and trend
*   **Data tables**: `<table data-cm-table data-cm-page-size="10">` with `th[data-sort]` sortable columns and `input[data-cm-table-filter="#id"]` filters
*   **Toasts**: `CM.toast('Saved!', { color: 'success' })` or `data-cm-toast="Saved!"` on any button

See the "Dashboard features" section of `docs/index.html`.

## Migrating from Clearmin 1.x (Bootstrap 3)

See the "Migrating from 1.x" section of `docs/index.html`.

## Credits

*   [Bootstrap](https://getbootstrap.com/) CSS front-end framework
*   [Popper](https://popper.js.org/) Tooltip & popover positioning engine
*   [Quill](https://quilljs.com/) Rich text editor (demo)
*   [Font Awesome Free](https://fontawesome.com/) The iconic font and CSS toolkit
*   [Roboto](https://fonts.google.com/specimen/Roboto) Google font
*   [Small-n-flat icons](https://github.com/paomedia/small-n-flat) SVG icons on a 24px grid
*   [Chart.js](https://www.chartjs.org/) Simple yet flexible JavaScript charting (demo)
