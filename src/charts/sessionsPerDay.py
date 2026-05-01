import json
import io
import base64
from datetime import datetime, timezone, timedelta
import matplotlib
matplotlib.use('agg')
import matplotlib.pyplot as plt
from collections import Counter
from js import document, window

# Get data from React
sessions = json.loads(window.__pyodideData)

# Build buckets for the last 7 days
today = datetime.now(timezone.utc).date()
days = [(today - timedelta(days=i)) for i in range(6, -1, -1)]
labels = [d.strftime('%a %d') for d in days]
counts = [0] * 7

# Count sessions per day
for s in sessions:
    end_time = s.get('endTime')
    if not end_time:
        continue
    try:
        # Firestore returns ISO format like "2026-04-30T14:23:42.000Z"
        dt = datetime.fromisoformat(end_time.replace('Z', '+00:00')).date()
        for i, d in enumerate(days):
            if dt == d:
                counts[i] += 1
                break
    except (ValueError, AttributeError):
        continue

# Plot
fig, ax = plt.subplots(figsize=(8, 4), facecolor='#1e293b')
ax.set_facecolor('#1e293b')
ax.bar(labels, counts, color='#6366f1', edgecolor='#a5b4fc')
ax.set_title('Sessions per Day (last 7 days)', color='#e2e8f0', fontsize=14)
ax.set_ylabel('Sessions', color='#94a3b8')
ax.tick_params(colors='#94a3b8')
for spine in ax.spines.values():
    spine.set_color('#334155')
ax.grid(True, alpha=0.2, color='#475569')

plt.tight_layout()

# Save as base64 PNG and inject into the page
buf = io.BytesIO()
fig.savefig(buf, format='png', facecolor='#1e293b')
buf.seek(0)
img_b64 = base64.b64encode(buf.read()).decode('utf-8')
plt.close(fig)

target = document.getElementById('chart-sessions-per-day')
target.innerHTML = f'<img src="data:image/png;base64,{img_b64}" alt="Sessions per Day" style="width:100%;"/>'