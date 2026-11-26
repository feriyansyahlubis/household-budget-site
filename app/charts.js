// NestEgg — small canvas charts, drawn with the browser's own canvas API.
// No library, no network: two functions, one donut and one grouped bar chart,
// both sized for their canvas and labelled in plain text below the drawing.

function setupCanvas(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, width, height };
}

// Donut: one slice per category that has spending, with the total in the middle.
function drawDonut(canvas, slices, centerLabel, centerValue) {
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const total = slices.reduce((a, s) => a + s.value, 0);
  if (total <= 0) return;
  const cx = width / 2;
  const cy = height / 2;
  const outer = Math.min(width, height) / 2 - 8;
  const inner = outer * 0.62;
  let angle = -Math.PI / 2;
  for (const s of slices) {
    const sweep = (s.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    angle += sweep;
  }
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#1c2b22";
  ctx.font = "700 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(centerLabel, cx, cy - 4);
  ctx.font = "800 19px system-ui, sans-serif";
  ctx.fillText(centerValue, cx, cy + 18);
}

// Grouped bars: income (green) vs spending (red) for each month in history.
function drawIncomeBars(canvas, months) {
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const padLeft = 46, padRight = 8, padTop = 14, padBottom = 26;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const max = Math.max(...months.map((m) => Math.max(m.income, m.spending))) * 1.08;
  // Gridlines and y labels.
  ctx.strokeStyle = "#e5ddd0";
  ctx.fillStyle = "#6b7280";
  ctx.font = "11px system-ui, sans-serif";
  ctx.textAlign = "right";
  for (let i = 0; i <= 4; i++) {
    const v = (max / 4) * i;
    const y = padTop + plotH - (v / max) * plotH;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.stroke();
    ctx.fillText("$" + Math.round(v / 1000) + "k", padLeft - 6, y + 4);
  }
  const groupW = plotW / months.length;
  const barW = Math.min(22, (groupW - 18) / 2);
  months.forEach((m, i) => {
    const gx = padLeft + i * groupW + groupW / 2;
    const incomeH = (m.income / max) * plotH;
    const spendH = (m.spending / max) * plotH;
    ctx.fillStyle = "#2f6f4f";
    ctx.fillRect(gx - barW - 2, padTop + plotH - incomeH, barW, incomeH);
    ctx.fillStyle = "#c0563f";
    ctx.fillRect(gx + 2, padTop + plotH - spendH, barW, spendH);
    ctx.fillStyle = "#374151";
    ctx.font = "12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(m.month, gx, height - 8);
  });
  // Legend.
  ctx.textAlign = "left";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillStyle = "#2f6f4f";
  ctx.fillRect(padLeft, 2, 12, 12);
  ctx.fillStyle = "#374151";
  ctx.fillText("Income", padLeft + 18, 12);
  ctx.fillStyle = "#c0563f";
  ctx.fillRect(padLeft + 86, 2, 12, 12);
  ctx.fillStyle = "#374151";
  ctx.fillText("Spending", padLeft + 104, 12);
}
