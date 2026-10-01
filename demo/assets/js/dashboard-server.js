// Server stats dashboard (invented data, see charts.js for the shared helpers)
document.addEventListener('DOMContentLoaded', () => {
  const { color, fade, register, auto, random } = window.DemoCharts
  const rand = random(7)
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
  const time = date => date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  // Live CPU & memory: last 2 minutes, one point every 2 seconds
  const points = 60
  const liveLabels = []
  const cpu = []
  const memory = []
  let cpuNow = 37
  let memoryNow = 35.6
  const now = Date.now()
  for (let i = points - 1; i >= 0; i--) {
    cpuNow = clamp(cpuNow + ((rand() - .5) * 9), 18, 82)
    memoryNow = clamp(memoryNow + ((rand() - .48) * .6), 33, 40)
    liveLabels.push(time(new Date(now - (i * 2000))))
    cpu.push(Math.round(cpuNow))
    memory.push(Number(memoryNow.toFixed(1)))
  }

  // Last 24 hours, hourly: daily traffic curve peaking in the afternoon
  const hours = Array.from({ length: 24 }, (value, index) => `${String((index + 1) % 24).padStart(2, '0')}:00`)
  const daily = hour => .35 + (.65 * Math.max(0, Math.sin(((hour - 6) / 24) * Math.PI * 2)) ** 1.3)
  const inbound = hours.map((label, index) => Math.round((140 + (520 * daily((index + 1) % 24))) * (.9 + (rand() * .2))))
  const outbound = inbound.map(value => Math.round(value * (1.6 + (rand() * .3))))
  const p50 = hours.map((label, index) => Math.round((42 + (28 * daily((index + 1) % 24))) * (.9 + (rand() * .2))))
  const p95 = p50.map((value, index) => Math.round((value * (2.6 + (rand() * .6))) + (index >= 21 ? 180 : 0)))

  const live = canvas => new Chart(canvas, {
    type: 'line',
    data: {
      labels: liveLabels,
      datasets: [
        { label: 'CPU %', data: cpu, borderColor: color('primary'), backgroundColor: fade('primary', .3), fill: true },
        { label: 'Memory %', data: memory, borderColor: color('purple'), backgroundColor: fade('purple', .15), fill: true }
      ]
    },
    options: {
      maintainAspectRatio: false,
      animation: false,
      tension: .3,
      interaction: { mode: 'index', intersect: false },
      elements: { point: { radius: 0, hoverRadius: 3 }, line: { borderWidth: 2 } },
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 7, maxRotation: 0 } },
        y: { min: 0, max: 100, border: { display: false }, ticks: { stepSize: 25, callback: value => `${value}%` } }
      },
      plugins: { legend: { position: 'top', align: 'end', labels: { usePointStyle: true, pointStyle: 'line' } } }
    }
  })

  const network = canvas => new Chart(canvas, {
    type: 'line',
    data: {
      labels: hours,
      datasets: [
        { label: 'Outbound', data: outbound, borderColor: color('turquoise'), backgroundColor: fade('turquoise', .3), fill: true },
        { label: 'Inbound', data: inbound, borderColor: color('primary'), backgroundColor: fade('primary', .3), fill: true }
      ]
    },
    options: {
      maintainAspectRatio: false,
      tension: .4,
      interaction: { mode: 'index', intersect: false },
      elements: { point: { radius: 0, hoverRadius: 3 }, line: { borderWidth: 2 } },
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 8, maxRotation: 0 } },
        y: { beginAtZero: true, border: { display: false }, ticks: { callback: value => `${value} Mb/s` } }
      },
      plugins: {
        legend: { position: 'top', align: 'end', labels: { usePointStyle: true, pointStyle: 'line' } },
        tooltip: { callbacks: { label: item => ` ${item.dataset.label}: ${item.parsed.y} Mb/s` } }
      }
    }
  })

  const latency = canvas => new Chart(canvas, {
    type: 'bar',
    data: {
      labels: hours,
      datasets: [
        { type: 'line', label: 'p95', data: p95, borderColor: color('warning'), backgroundColor: color('warning'), tension: .35, pointRadius: 0, pointHoverRadius: 3, borderWidth: 2 },
        { label: 'p50', data: p50, backgroundColor: color('info'), borderRadius: 2, categoryPercentage: .7 }
      ]
    },
    options: {
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 8, maxRotation: 0 } },
        y: { beginAtZero: true, border: { display: false }, ticks: { callback: value => `${value} ms` } }
      },
      plugins: {
        legend: { position: 'top', align: 'end', labels: { boxWidth: 12, boxHeight: 12 } },
        tooltip: { callbacks: { label: item => ` ${item.dataset.label}: ${item.parsed.y} ms` } }
      }
    }
  })

  register(() => [
    auto(),
    live(document.getElementById('chart-live')),
    network(document.getElementById('chart-network')),
    latency(document.getElementById('chart-latency'))
  ])

  // Live updates (the KPI cards follow the chart)
  const cpuValue = document.getElementById('cpu-value')
  const cpuLoad = document.getElementById('cpu-load')
  const memoryValue = document.getElementById('mem-value')
  const memoryPercent = document.getElementById('mem-percent')
  setInterval(() => {
    cpuNow = clamp(cpuNow + ((Math.random() - .5) * 9), 18, 82)
    memoryNow = clamp(memoryNow + ((Math.random() - .48) * .6), 33, 40)
    liveLabels.push(time(new Date()))
    cpu.push(Math.round(cpuNow))
    memory.push(Number(memoryNow.toFixed(1)))
    liveLabels.shift()
    cpu.shift()
    memory.shift()

    cpuValue.textContent = `${Math.round(cpuNow)}%`
    cpuLoad.textContent = (cpuNow * .16).toFixed(2)
    memoryValue.textContent = `${(memoryNow * .32).toFixed(1)} GB`
    memoryPercent.textContent = `${Math.round(memoryNow)}%`
    Chart.getChart('chart-live')?.update('none')
  }, 2000)
})
