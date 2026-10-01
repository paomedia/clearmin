// Shared Chart.js helpers for the demo dashboards (https://www.chartjs.org)
// Colors come from the theme CSS variables, so the charts follow the color mode.
window.DemoCharts = (() => {
  const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const color = name => css(`--bs-${name}`)
  const alpha = (name, opacity) => `rgba(${css(`--bs-${name}-rgb`)}, ${opacity})`
  const isDark = () => document.documentElement.dataset.bsTheme === 'dark'

  // Vertical gradient under a line, from the line color to transparent
  const fade = (name, top = .35) => ({ chart }) => {
    const { ctx, chartArea } = chart
    if (!chartArea) {
      return alpha(name, top / 2)
    }

    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
    gradient.addColorStop(0, alpha(name, top))
    gradient.addColorStop(1, alpha(name, 0))
    return gradient
  }

  // Writes the value in the middle of a half doughnut
  const gaugeLabel = {
    id: 'gaugeLabel',
    afterDraw(chart) {
      const arc = chart.getDatasetMeta(0).data[0]
      if (!arc) {
        return
      }

      const { ctx } = chart
      ctx.save()
      ctx.font = `300 ${Math.round(arc.outerRadius / 3.2)}px ${Chart.defaults.font.family}`
      ctx.fillStyle = css('--bs-emphasis-color')
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(`${chart.data.datasets[0].data[0]}%`, arc.x, arc.y)
      ctx.restore()
    }
  }

  // <canvas data-gauge="42" data-color="primary">
  const gauge = canvas => new Chart(canvas, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [Number(canvas.dataset.gauge), 100 - Number(canvas.dataset.gauge)],
        backgroundColor: [color(canvas.dataset.color), css('--bs-secondary-bg')],
        borderWidth: 0
      }]
    },
    options: {
      maintainAspectRatio: false,
      rotation: -90,
      circumference: 180,
      cutout: '68%',
      layout: { padding: { top: 4 } },
      plugins: { legend: { display: false }, tooltip: { enabled: false } }
    },
    plugins: [gaugeLabel]
  })

  // <canvas data-sparkline="1,4,2,5" data-color="primary" data-labels="Mon,Tue,...">
  const sparkline = canvas => {
    const values = canvas.dataset.sparkline.split(',').map(Number)
    const labels = canvas.dataset.labels ? canvas.dataset.labels.split(',') : values.map((value, index) => index + 1)
    return new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: values,
          borderColor: color(canvas.dataset.color),
          backgroundColor: fade(canvas.dataset.color, .3),
          borderWidth: 2,
          fill: true,
          tension: .4,
          pointRadius: 0,
          pointHoverRadius: 3
        }]
      },
      options: {
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: { x: { display: false }, y: { display: false, grace: '10%' } },
        plugins: {
          legend: { display: false },
          tooltip: { displayColors: false, callbacks: { title: items => items[0].label } }
        }
      }
    })
  }

  // Doughnut with the theme border color between slices
  const doughnut = (canvas, labels, values, colors, unit = '%') => new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: colors.map(color), borderColor: css('--bs-body-bg'), borderWidth: 2, hoverOffset: 6 }]
    },
    options: {
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 10, boxHeight: 10, padding: 12 } },
        tooltip: { callbacks: { label: item => ` ${item.label}: ${item.parsed}${unit}` } }
      }
    }
  })

  // Draws the charts returned by `draw()` now and again on every color mode change
  const register = draw => {
    let charts = []
    const render = () => {
      charts.forEach(chart => chart.destroy())
      Chart.defaults.font.family = getComputedStyle(document.body).fontFamily
      Chart.defaults.color = css('--cm-muted')
      Chart.defaults.borderColor = css('--bs-border-color')
      charts = draw().flat().filter(Boolean)
    }

    render()
    document.addEventListener('cm:themechange', render)
  }

  // Charts of `[data-gauge]` and `[data-sparkline]` canvases
  const auto = () => [
    ...Array.from(document.querySelectorAll('canvas[data-gauge]'), gauge),
    ...Array.from(document.querySelectorAll('canvas[data-sparkline]'), sparkline)
  ]

  // Deterministic pseudo random numbers, so the invented data is stable between reloads
  const random = (seed = 1) => () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }

  return { css, color, alpha, isDark, fade, gauge, sparkline, doughnut, register, auto, random }
})()
