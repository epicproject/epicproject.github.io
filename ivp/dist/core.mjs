// src/schema.js
var SCHEMA_VERSION = 2;
var SAFE_PROTOCOLS = ["http:", "https:", "mailto:", "tel:", "sms:"];
var MAX_JSON_CHARS = 16 * 1024 * 1024;
var MAX_LAYERS = 1e3;
var MAX_KEYFRAMES = 5e3;
var SHAPES = ["pill", "rect", "ellipse"];
var ACTION_TYPES = ["link", "popup", "qr", "seek"];
var DEFAULT_COLOR = "#7c5cff";
var SdkError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "SdkError";
  }
};
function sanitizeUrl(raw) {
  if (typeof raw !== "string") return null;
  const text = raw.trim();
  if (!text || /[\u0000-\u001f]/.test(text)) return null;
  if (/^(mailto|tel|sms):\S+$/i.test(text)) return text;
  let url;
  try {
    url = new URL(text.includes("://") ? text : `https://${text}`);
  } catch {
    return null;
  }
  if (!SAFE_PROTOCOLS.includes(url.protocol) || !url.hostname) return null;
  return url.href;
}
var clampPct = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : fallback;
};
var int = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : fallback;
};
var str = (v, max = 5e3) => typeof v === "string" ? v.slice(0, max) : "";
function colorToCss(value) {
  if (typeof value === "string") {
    return /^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(value) ? value.toLowerCase() : DEFAULT_COLOR;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) return DEFAULT_COLOR;
  const n = value >>> 0;
  const a = n >>> 24 & 255;
  const hex = (n & 16777215).toString(16).padStart(6, "0");
  return a === 255 ? `#${hex}` : `#${hex}${a.toString(16).padStart(2, "0")}`;
}
function cssToColorInt(css) {
  const m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(css);
  if (!m) return 4286340351;
  const a = m[2] ? parseInt(m[2], 16) : 255;
  return (a << 24 | parseInt(m[1], 16)) >>> 0;
}
function parseKeyframe(raw) {
  if (!raw || typeof raw !== "object") throw new SdkError("Keyframe must be an object");
  return {
    timeMs: int(raw.t ?? raw.timeMs),
    x: clampPct(raw.x),
    y: clampPct(raw.y),
    width: clampPct(raw.w ?? raw.width),
    height: clampPct(raw.h ?? raw.height)
  };
}
function parseAction(raw, legacyUrl) {
  const a = raw && typeof raw === "object" ? raw : {};
  const type = ACTION_TYPES.includes(a.type) ? a.type : "link";
  return {
    type,
    url: str(a.url ?? legacyUrl ?? "", 4e3),
    title: str(a.title, 300),
    message: str(a.message, 5e3),
    buttonLabel: str(a.button_label ?? a.buttonLabel, 100),
    seekMs: Math.max(0, int(a.seek_ms ?? a.seekMs))
  };
}
function parseLayer(raw, index) {
  if (!raw || typeof raw !== "object") throw new SdkError(`Layer ${index + 1} must be an object`);
  const startMs = int(raw.timestamp_start ?? raw.startMs, NaN);
  const endMs = int(raw.timestamp_end ?? raw.endMs, NaN);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    throw new SdkError(`Layer ${index + 1} needs timestamp_start and timestamp_end`);
  }
  if (endMs < startMs) throw new SdkError(`Layer ${index + 1} ends before it starts`);
  let keyframes;
  if (Array.isArray(raw.keyframes) && raw.keyframes.length > 0) {
    if (raw.keyframes.length > MAX_KEYFRAMES) throw new SdkError(`Layer ${index + 1} has too many keyframes`);
    keyframes = raw.keyframes.map(parseKeyframe).sort((a, b) => a.timeMs - b.timeMs);
  } else if (raw.relative_x !== void 0) {
    keyframes = [parseKeyframe({ t: startMs, x: raw.relative_x, y: raw.relative_y, w: raw.width, h: raw.height })];
  } else {
    throw new SdkError(`Layer ${index + 1} has no keyframes`);
  }
  return {
    id: str(raw.id, 200) || `layer-${index}`,
    name: str(raw.name, 200),
    startMs,
    endMs,
    keyframes,
    shape: SHAPES.includes(raw.shape) ? raw.shape : "pill",
    visible: raw.visible !== false,
    label: str(raw.label, 200),
    color: colorToCss(raw.color),
    action: parseAction(raw.action, raw.target_url)
  };
}
function parseProject(input) {
  let raw = input;
  if (typeof input === "string") {
    if (input.length > MAX_JSON_CHARS) throw new SdkError("Project JSON is too large");
    try {
      raw = JSON.parse(input);
    } catch {
      throw new SdkError("Project is not valid JSON");
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new SdkError("Project must be an object");
  if (typeof raw.video !== "string" || !raw.video) throw new SdkError('Project needs a "video"');
  const list = raw.hotspots ?? raw.layers ?? [];
  if (!Array.isArray(list)) throw new SdkError('"hotspots" must be an array');
  if (list.length > MAX_LAYERS) throw new SdkError("Too many layers");
  return {
    schemaVersion: SCHEMA_VERSION,
    video: raw.video,
    layers: list.map(parseLayer)
  };
}
function serializeProject(project) {
  return {
    schema_version: SCHEMA_VERSION,
    video: project.video,
    hotspots: project.layers.map((l) => ({
      id: l.id,
      name: l.name,
      timestamp_start: l.startMs,
      timestamp_end: l.endMs,
      keyframes: l.keyframes.map((k) => ({ t: k.timeMs, x: k.x, y: k.y, w: k.width, h: k.height })),
      shape: l.shape,
      visible: l.visible,
      label: l.label,
      color: cssToColorInt(l.color),
      action: {
        type: l.action.type,
        url: l.action.url,
        title: l.action.title,
        message: l.action.message,
        button_label: l.action.buttonLabel,
        seek_ms: l.action.seekMs
      }
    }))
  };
}
var stringifyProject = (project) => JSON.stringify(serializeProject(project), null, 2);
var isNetworkVideo = (project) => /^https?:\/\//i.test(project.video);
var isActive = (layer, ms) => ms >= layer.startMs && ms <= layer.endMs;
function frameAt(layer, ms) {
  const k = layer.keyframes;
  const first = k[0];
  const last = k[k.length - 1];
  if (k.length === 1 || ms <= first.timeMs) return { ...first, timeMs: ms };
  if (ms >= last.timeMs) return { ...last, timeMs: ms };
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i];
    const b = k[i + 1];
    if (ms >= a.timeMs && ms <= b.timeMs) {
      const span = b.timeMs - a.timeMs;
      const t = span <= 0 ? 0 : (ms - a.timeMs) / span;
      const mix = (p, q) => p + (q - p) * t;
      return {
        timeMs: ms,
        x: mix(a.x, b.x),
        y: mix(a.y, b.y),
        width: mix(a.width, b.width),
        height: mix(a.height, b.height)
      };
    }
  }
  return { ...last, timeMs: ms };
}
var activeLayers = (project, ms) => project.layers.filter((l) => isActive(l, ms));
function hitTest(project, ms, xPct, yPct) {
  for (let i = project.layers.length - 1; i >= 0; i--) {
    const layer = project.layers[i];
    if (!isActive(layer, ms)) continue;
    const f = frameAt(layer, ms);
    if (xPct < f.x || xPct > f.x + f.width || yPct < f.y || yPct > f.y + f.height) continue;
    if (layer.shape === "ellipse") {
      const rx = f.width / 2;
      const ry = f.height / 2;
      const dx = (xPct - (f.x + rx)) / rx;
      const dy = (yPct - (f.y + ry)) / ry;
      if (dx * dx + dy * dy > 1) continue;
    }
    return layer;
  }
  return null;
}

// src/ivp.js
var MAGIC = [73, 86, 80, 49];
var MAX_META_BYTES = 16 * 1024 * 1024;
var toBytes = (data) => data instanceof Uint8Array ? data : new Uint8Array(data);
function readBundle(data) {
  const bytes = toBytes(data);
  if (bytes.length < 8 || MAGIC.some((b, i) => bytes[i] !== b)) {
    throw new SdkError("Not an Interactive Video bundle (.ivp)");
  }
  const metaLength = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4);
  if (metaLength === 0 || metaLength > MAX_META_BYTES || 8 + metaLength > bytes.length) {
    throw new SdkError("The bundle is damaged or incomplete");
  }
  const json = new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(8, 8 + metaLength));
  return {
    project: parseProject(json),
    videoBytes: bytes.subarray(8 + metaLength)
  };
}
function writeBundle(project, videoBytes, videoName = "video.mp4") {
  const meta = new TextEncoder().encode(stringifyProject({ ...project, video: videoName }));
  const video = toBytes(videoBytes);
  const out = new Uint8Array(8 + meta.length + video.length);
  out.set(MAGIC, 0);
  new DataView(out.buffer).setUint32(4, meta.length);
  out.set(meta, 8);
  out.set(video, 8 + meta.length);
  return out;
}

// src/tracker.js
var LOST_BELOW = 0.5;
var ADAPT_ABOVE = 0.8;
var SEARCH_RADIUS = 18;
var MAX_TEMPLATE = 36;
var MIN_TEMPLATE = 12;
var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
function crop(frame, left, top, cw, ch) {
  if (left < 0 || top < 0 || left + cw > frame.width || top + ch > frame.height) return null;
  const out = new Float32Array(cw * ch);
  for (let y = 0; y < ch; y++) {
    const row = (top + y) * frame.width + left;
    for (let x = 0; x < cw; x++) out[y * cw + x] = frame.data[row + x];
  }
  return out;
}
function prepare(pixels) {
  let mean = 0;
  for (const p of pixels) mean += p;
  mean /= pixels.length;
  const zeroMean = new Float32Array(pixels.length);
  let sq = 0;
  for (let i = 0; i < pixels.length; i++) {
    const v = pixels[i] - mean;
    zeroMean[i] = v;
    sq += v * v;
  }
  return { zeroMean, norm: Math.sqrt(sq) };
}
function locate(frame, tpl, tw, th, cx, cy) {
  const n = tw * th;
  const baseLeft = Math.round(cx) - Math.floor(tw / 2);
  const baseTop = Math.round(cy) - Math.floor(th / 2);
  let best = -2;
  let bestDx = 0;
  let bestDy = 0;
  const { data, width, height } = frame;
  for (let oy = -SEARCH_RADIUS; oy <= SEARCH_RADIUS; oy++) {
    const top = baseTop + oy;
    if (top < 0 || top + th > height) continue;
    for (let ox = -SEARCH_RADIUS; ox <= SEARCH_RADIUS; ox++) {
      const left = baseLeft + ox;
      if (left < 0 || left + tw > width) continue;
      let sum = 0;
      let sumSq = 0;
      let dot = 0;
      for (let y = 0; y < th; y++) {
        const row = (top + y) * width + left;
        const trow = y * tw;
        for (let x = 0; x < tw; x++) {
          const p = data[row + x];
          sum += p;
          sumSq += p * p;
          dot += tpl.zeroMean[trow + x] * p;
        }
      }
      const variance = sumSq - sum * sum / n;
      if (variance < 1e-3 || tpl.norm < 1e-3) continue;
      const score = dot / (tpl.norm * Math.sqrt(variance));
      if (score > best) {
        best = score;
        bestDx = ox;
        bestDy = oy;
      }
    }
  }
  if (best < -1) return null;
  return { x: baseLeft + bestDx + tw / 2, y: baseTop + bestDy + th / 2, score: best };
}
function simplify(points, epsilon = 0.35) {
  if (points.length < 3) return points.slice();
  const pts = points.slice().sort((a, b) => a.timeMs - b.timeMs);
  const keep = new Array(pts.length).fill(false);
  keep[0] = keep[pts.length - 1] = true;
  const rdp = (a, b) => {
    let worst = 0;
    let index = -1;
    for (let i = a + 1; i < b; i++) {
      const t = (pts[i].timeMs - pts[a].timeMs) / (pts[b].timeMs - pts[a].timeMs || 1);
      const gx = pts[a].x + (pts[b].x - pts[a].x) * t;
      const gy = pts[a].y + (pts[b].y - pts[a].y) * t;
      const err = Math.max(Math.abs(gx - pts[i].x), Math.abs(gy - pts[i].y));
      if (err > worst) {
        worst = err;
        index = i;
      }
    }
    if (index >= 0 && worst > epsilon) {
      keep[index] = true;
      rdp(a, index);
      rdp(index, b);
    }
  };
  rdp(0, pts.length - 1);
  return pts.filter((_, i) => keep[i]);
}
async function trackObject({ source, seed, toMs, stepMs = 100, frameWidth = 192, onProgress, signal }) {
  const forward = toMs >= seed.timeMs;
  const first = await source.getFrame(seed.timeMs, frameWidth);
  const { width: w, height: h } = first;
  const boxW = seed.width;
  const boxH = seed.height;
  let cx = (seed.x + boxW / 2) / 100 * w;
  let cy = (seed.y + boxH / 2) / 100 * h;
  const tw = clamp(Math.round(boxW / 100 * w), MIN_TEMPLATE, MAX_TEMPLATE);
  const th = clamp(Math.round(boxH / 100 * h), MIN_TEMPLATE, MAX_TEMPLATE);
  const template = crop(first, Math.round(cx) - Math.floor(tw / 2), Math.round(cy) - Math.floor(th / 2), tw, th);
  if (!template) return { frames: [seed], lostAtMs: seed.timeMs, cancelled: false };
  let stats = prepare(template);
  const samples = [{ timeMs: seed.timeMs, cx, cy }];
  const span = Math.abs(toMs - seed.timeMs);
  let lostAtMs = null;
  let cancelled = false;
  let t = seed.timeMs;
  while (t !== toMs) {
    if (signal?.aborted) {
      cancelled = true;
      break;
    }
    t = forward ? Math.min(t + stepMs, toMs) : Math.max(t - stepMs, toMs);
    const frame = await source.getFrame(t, frameWidth);
    const match = locate(frame, stats, tw, th, cx, cy);
    if (!match || match.score < LOST_BELOW) {
      lostAtMs = t;
      break;
    }
    cx = cx * 0.25 + match.x * 0.75;
    cy = cy * 0.25 + match.y * 0.75;
    samples.push({ timeMs: t, cx, cy });
    if (match.score > ADAPT_ABOVE) {
      const fresh = crop(frame, Math.round(match.x) - Math.floor(tw / 2), Math.round(match.y) - Math.floor(th / 2), tw, th);
      if (fresh) {
        for (let i = 0; i < template.length; i++) template[i] = template[i] * 0.85 + fresh[i] * 0.15;
        stats = prepare(template);
      }
    }
    onProgress?.(span === 0 ? 1 : clamp(Math.abs(t - seed.timeMs) / span, 0, 1));
  }
  const path = simplify(
    samples.map((s) => ({
      timeMs: s.timeMs,
      x: clamp(s.cx / w * 100 - boxW / 2, 0, 100 - boxW),
      y: clamp(s.cy / h * 100 - boxH / 2, 0, 100 - boxH),
      width: boxW,
      height: boxH
    }))
  );
  path[path.findIndex((k) => k.timeMs === seed.timeMs)] = { ...seed };
  return { frames: path, lostAtMs, cancelled };
}
function applyTrack(layer, outcome, seedTimeMs, forward = true, toleranceMs = 40) {
  const kept = layer.keyframes.filter(
    (k) => forward ? k.timeMs < seedTimeMs - toleranceMs : k.timeMs > seedTimeMs + toleranceMs
  );
  const keyframes = [...kept, ...outcome.frames].sort((a, b) => a.timeMs - b.timeMs);
  const next = { ...layer, keyframes };
  if (forward && outcome.lostAtMs != null) next.endMs = Math.max(layer.startMs + 100, outcome.lostAtMs);
  return next;
}
export {
  SAFE_PROTOCOLS,
  SCHEMA_VERSION,
  SdkError,
  activeLayers,
  applyTrack,
  colorToCss,
  cssToColorInt,
  frameAt,
  hitTest,
  isActive,
  isNetworkVideo,
  parseProject,
  readBundle,
  sanitizeUrl,
  serializeProject,
  stringifyProject,
  trackObject,
  writeBundle
};
//# sourceMappingURL=core.mjs.map
