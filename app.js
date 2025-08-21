function wrapLines(text, maxLen = 80) {
  const lines = [];
  let i = 0;
  while (i < text.length) {
    lines.push(text.slice(i, i + maxLen));
    i += maxLen;
  }
  return lines.length ? lines : [""];
}

window.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('chart').getContext('2d');
  let chart;

  const worker = new Worker('worker.js');
  const loading = document.getElementById('loading');

  worker.onmessage = (e) => {
    const { results, error } = e.data;
    loading.style.display = 'none';
    if (error) {
      alert(error);
      return;
    }

    const labels = Object.keys(results);
    const values = Object.values(results);

    const pattern = document.getElementById('regex').value.trim();
    const attackBase = document.getElementById('attack').value.trim();
    const titleText = `Regex: ${pattern}`;
    const subtitleLines = wrapLines(`Attack: ${attackBase}`, 80);

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: '耗时 (ms)',
          data: values,
          borderColor: 'red',
          fill: false,
          tension: 0.2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: titleText,
            align: 'start',
            font: { size: 14, weight: 'bold' },
            padding: { top: 6, bottom: 4 }
          },
          subtitle: {
            display: true,
            text: subtitleLines,
            align: 'start',
            font: { size: 12 },
            padding: { bottom: 8 }
          },
          legend: {
            labels: { boxWidth: 12 }
          }
        },
        layout: {
          padding: { top: 8 }
        },
        scales: {
          x: { title: { display: true, text: '字符串长度 (N)' } },
          y: { title: { display: true, text: '耗时 (ms)' }, beginAtZero: true }
        }
      }
    });
  };

  document.getElementById('run').addEventListener('click', () => {
    const pattern = document.getElementById('regex').value.trim();
    const attackBase = document.getElementById('attack').value.trim();
    const maxLen = parseInt(document.getElementById('maxlen').value, 10);
    const step = parseInt(document.getElementById('step').value, 10);

    loading.style.display = 'inline-block';
    worker.postMessage({ pattern, attackBase, maxLen, step });
  });

  document.getElementById('export').addEventListener('click', () => {
    if (!chart) {
      alert("请先运行测试生成图表！");
      return;
    }
    const link = document.createElement('a');
    link.href = chart.toBase64Image('image/png', 1);
    link.download = 'redos_result.png';
    link.click();
  });
});
