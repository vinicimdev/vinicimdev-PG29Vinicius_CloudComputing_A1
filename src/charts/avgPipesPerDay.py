import json
import io
import base64
from datetime import datetime, timezone, timedelta
import matplotlib
matplotlib.use('agg')
import matplotlib.pyplot as plt
from js import document, window

sessions = json.loads(window.__pyodideData)

# Build buckets for the last 7 days
today = datetime.now(timezone.utc).date()
days = [(today - timedelta(days=i)) for i in range(6, -1, -1)]
labels = [d.strftime('%a %d') for d in days]

# Sum pipes per day and count sessions per day, then calculate the average
sums = [0] * 7
counts = [0] * 7

for s in sessions:
    end_time = s.get('endTime')
    pipes = s.get('pipes', 0)
    if not end_time:
        continue
    try:
        dt = datetime.fromisoformat(end_time.replace('Z', '+00:00')).date()
        for i, d in enumerate(days):
            if dt == d:
                sums[i] += pipes
                counts[i] += 1
                break
    except (ValueError, AttributeError):
        continue

averages = [sums[i] / counts[i] if counts[i] > 0 else 0 for i in range(7)]

fig, ax = plt.subplots(figsize=(8, 4), facecolor='#1e293b')
ax.set_facecolor('#1e293b')
ax.plot(labels, averages, color='#10b981', marker='o', linewidth=2.5, markersize=8)
ax.fill_between(range(7), averages, alpha=0.15, color='#10b981')
ax.set_title('Average Pipes per Session (last 7 days)', color='#e2e8f0', fontsize=14)
ax.set_ylabel('Avg pipes', color='#94a3b8')
ax.tick_params(colors='#94a3b8')
for spine in ax.spines.values():
    spine.set_color('#334155')
ax.grid(True, alpha=0.2, color='#475569')

plt.tight_layout()

buf = io.BytesIO()
fig.savefig(buf, format='png', facecolor='#1e293b')
buf.seek(0)
img_b64 = base64.b64encode(buf.read()).decode('utf-8')
plt.close(fig)

target = document.getElementById('chart-avg-pipes')
target.innerHTML = f'<img src="data:image/png;base64,{img_b64}" alt="Average Pipes" style="width:100%;"/>'