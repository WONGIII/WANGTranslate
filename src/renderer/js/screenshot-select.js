const ipc = window.wangtranslate;
const qs = window.location.search.substring(1);
const p = {};
qs.split('&').forEach(pair => { const [k, v] = pair.split('='); if (k) p[k] = decodeURIComponent(v || ''); });
const imagePath = p['imagePath'];

if (imagePath) {
  document.getElementById('bg').src = 'file:///' + imagePath.replace(/\\/g, '/');
}

let startX = 0, startY = 0;
let isDragging = false;
const selection = document.getElementById('selection');

function sendResult(data) { ipc.sendScreenshotResult(data); }

document.addEventListener('mousedown', function(e) {
  startX = e.clientX;
  startY = e.clientY;
  isDragging = true;
  selection.style.display = 'block';
  updateSelection(e.clientX, e.clientY);
});

document.addEventListener('mousemove', function(e) {
  if (!isDragging) return;
  updateSelection(e.clientX, e.clientY);
});

function updateSelection(cx, cy) {
  const x = Math.min(startX, cx);
  const y = Math.min(startY, cy);
  selection.style.left = x + 'px';
  selection.style.top = y + 'px';
  selection.style.width = Math.abs(cx - startX) + 'px';
  selection.style.height = Math.abs(cy - startY) + 'px';
}

document.addEventListener('mouseup', function(e) {
  if (!isDragging) return;
  isDragging = false;

  const x = Math.min(startX, e.clientX);
  const y = Math.min(startY, e.clientY);
  const width = Math.abs(e.clientX - startX);
  const height = Math.abs(e.clientY - startY);

  if (width < 10 || height < 10) {
    sendResult({ type: 'cancelled' });
    return;
  }

  sendResult({
    type: 'cropped',
    imagePath: imagePath,
    rect: { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) }
  });
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') sendResult({ type: 'cancelled' });
});
