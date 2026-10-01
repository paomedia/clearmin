// Sales dashboard charts (see charts.js for the shared helpers)
document.addEventListener('DOMContentLoaded', () => {
  const { css, color, fade, isDark, register, auto } = window.DemoCharts
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const sales = canvas => new Chart(canvas, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        { label: 'Online', data: [130, 340, 200, 500, 250, 350, 130, 333, 200, 500, 220, 350], backgroundColor: color('primary') },
        { label: 'Retail', data: [30, 200, 100, 400, 150, 250, 30, 200, 112, 322, 70, 300], backgroundColor: isDark() ? css('--bs-midnight-text-emphasis') : color('midnight') }
      ]
    },
    options: {
      maintainAspectRatio: false,
      categoryPercentage: .7,
      elements: { bar: { borderRadius: 3 } },
      scales: { x: { grid: { display: false } }, y: { beginAtZero: true, border: { display: false } } },
      plugins: { legend: { position: 'top', align: 'end', labels: { boxWidth: 12, boxHeight: 12 } } }
    }
  })

  const revenue = canvas => new Chart(canvas, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        { label: 'Revenue', data: [32, 35, 33, 38, 36, 40, 39, 44, 42, 46, 45, 48], borderColor: color('turquoise'), backgroundColor: fade('turquoise'), fill: true },
        { label: 'Expenses', data: [22, 24, 23, 25, 27, 26, 28, 27, 30, 29, 31, 30], borderColor: color('primary'), backgroundColor: fade('primary', .2), fill: true }
      ]
    },
    options: {
      maintainAspectRatio: false,
      tension: .4,
      interaction: { mode: 'index', intersect: false },
      elements: { point: { radius: 0, hoverRadius: 4 }, line: { borderWidth: 2 } },
      scales: {
        x: { grid: { display: false } },
        y: { border: { display: false }, ticks: { callback: value => `$${value}k` } }
      },
      plugins: {
        legend: { position: 'top', align: 'end', labels: { usePointStyle: true, pointStyle: 'line' } },
        tooltip: { callbacks: { label: item => ` ${item.dataset.label}: $${item.parsed.y}k` } }
      }
    }
  })

  register(() => [auto(), sales(document.getElementById('chart-sales')), revenue(document.getElementById('chart-revenue'))])
})
