// Website visitors dashboard (invented data, see charts.js for the shared helpers)
document.addEventListener('DOMContentLoaded', () => {
  const { color, alpha, fade, register, auto, random } = window.DemoCharts
  const rand = random(42)

  // Last 30 days: weekday traffic, weekend dips, slow growth
  const days = []
  const visitors = []
  const pageViews = []
  const today = new Date(2026, 9, 1)
  for (let i = 29; i >= 0; i--) {
    const day = new Date(today)
    day.setDate(today.getDate() - i)
    const weekend = day.getDay() === 0 || day.getDay() === 6
    const base = 760 * (1 + ((29 - i) * .006)) * (weekend ? .68 : 1)
    const value = Math.round(base * (.92 + (rand() * .16)))
    days.push(day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    visitors.push(value)
    pageViews.push(Math.round(value * (3.1 + (rand() * .6))))
  }

  // Realtime: active users per minute, refreshed every 3 seconds
  const minutes = Array.from({ length: 30 }, (value, index) => (index === 29 ? 'now' : `-${29 - index}m`))
  const perMinute = Array.from({ length: 30 }, () => Math.round(38 + (rand() * 22)))
  let active = 147

  const traffic = canvas => new Chart(canvas, {
    type: 'line',
    data: {
      labels: days,
      datasets: [
        { label: 'Page views', data: pageViews, borderColor: color('turquoise'), backgroundColor: fade('turquoise', .25), fill: true },
        { label: 'Visitors', data: visitors, borderColor: color('primary'), backgroundColor: fade('primary', .3), fill: true }
      ]
    },
    options: {
      maintainAspectRatio: false,
      tension: .35,
      interaction: { mode: 'index', intersect: false },
      elements: { point: { radius: 0, hoverRadius: 4 }, line: { borderWidth: 2 } },
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
        y: { beginAtZero: true, border: { display: false } }
      },
      plugins: { legend: { position: 'top', align: 'end', labels: { usePointStyle: true, pointStyle: 'line' } } }
    }
  })

  const realtime = canvas => new Chart(canvas, {
    type: 'bar',
    data: {
      labels: minutes,
      datasets: [{
        label: 'Active users',
        data: perMinute,
        backgroundColor: perMinute.map((value, index) => (index === perMinute.length - 1 ? color('danger') : alpha('primary', .75))),
        borderRadius: 2,
        barPercentage: .8,
        categoryPercentage: 1
      }]
    },
    options: {
      maintainAspectRatio: false,
      animation: { duration: 300 },
      scales: { x: { display: false }, y: { display: false, beginAtZero: true } },
      plugins: { legend: { display: false }, tooltip: { displayColors: false } }
    }
  })

  register(() => [
    auto(),
    traffic(document.getElementById('chart-traffic')),
    realtime(document.getElementById('chart-realtime')),
    window.DemoCharts.doughnut(document.getElementById('chart-sources'),
      ['Organic search', 'Direct', 'Social', 'Referral', 'Email', 'Paid ads'], [42, 24, 14, 11, 6, 3],
      ['primary', 'turquoise', 'purple', 'warning', 'info', 'danger']),
    window.DemoCharts.doughnut(document.getElementById('chart-devices'),
      ['Desktop', 'Mobile', 'Tablet'], [56, 38, 6], ['primary', 'turquoise', 'yellow'])
  ])

  const counter = document.getElementById('active-users')
  setInterval(() => {
    active = Math.max(90, Math.min(220, active + Math.round((Math.random() - .45) * 12)))
    counter.textContent = active
    perMinute.push(Math.round(active / 3.4))
    perMinute.shift()

    const chart = Chart.getChart('chart-realtime')
    if (chart) {
      chart.data.datasets[0].backgroundColor = perMinute.map((value, index) => (index === perMinute.length - 1 ? color('danger') : alpha('primary', .75)))
      chart.update()
    }
  }, 3000)

})
