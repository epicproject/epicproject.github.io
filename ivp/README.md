# Interactive Video SDK

Make any video interactive. Pin buttons, popups, QR codes and links to the
picture, make them follow a moving object, and show them only at the right
moment. Build your own player on any website, web app or server.

* **Player** for the browser: one `<script>` tag or `npm install`.
* **Headless core** with no DOM: parse, validate and hit-test projects on a
  server, in a worker, in Deno/Bun, or port the player to any other OS.
* **Object tracker**: point at something, get keyframes that follow it.
* **Same project format as the Interactive Video mobile app**: open its `.ivp`
  files here, and the other way round.

Zero runtime dependencies except a tiny QR encoder (`qrcode-generator`) used by
the player. MIT licensed.

## Hosted copy

Live demo: https://epicproject.github.io/ivp/

Use it without installing anything:

```html
<script src="https://epicproject.github.io/ivp/dist/interactive-video-sdk.min.js"></script>
```

ES module: `import { InteractiveVideoPlayer } from "https://epicproject.github.io/ivp/dist/index.mjs";`
Headless core: `https://epicproject.github.io/ivp/dist/core.mjs`

This copy is a snapshot of version 1.0.0. For production, self-host the files or pin a published npm version.

## Install

```bash
npm install interactive-video-sdk
```

or, without a build step, load the single file:

```html
<script src="https://cdn.jsdelivr.net/npm/interactive-video-sdk/dist/interactive-video-sdk.min.js"></script>
```

Pin a version in production (`interactive-video-sdk@1.0.0`).

## Quick start

```html
<div id="player"></div>
<script>
  const { InteractiveVideoPlayer } = InteractiveVideoSDK;

  const player = new InteractiveVideoPlayer(document.getElementById('player'), {
    project: {
      video: 'https://example.com/clip.mp4',
      hotspots: [{
        timestamp_start: 2000, timestamp_end: 6000,
        keyframes: [{ t: 2000, x: 10, y: 60, w: 30, h: 10 },   // percent of the frame
                    { t: 6000, x: 60, y: 30, w: 30, h: 10 }],  // glides between keyframes
        label: 'Buy now', color: '#7c5cff',
        action: { type: 'link', url: 'https://example.com/shop' },
      }],
    },
  });
</script>
```

ES modules / bundlers:

```js
import { InteractiveVideoPlayer } from 'interactive-video-sdk';
```

Play a `.ivp` file exported by the mobile app:

```js
const bytes = await (await fetch('/demo.ivp')).arrayBuffer();
const player = InteractiveVideoPlayer.fromBundle(container, bytes);
```

Works in React, Vue, Svelte, Angular, plain HTML: create the player in a mount
hook and call `player.destroy()` on unmount.

## Project format

```jsonc
{
  "schema_version": 2,
  "video": "clip.mp4",                 // URL or file name
  "hotspots": [{
    "id": "cta", "name": "Buy",
    "timestamp_start": 2000,           // ms; layer exists from here...
    "timestamp_end": 6000,             // ...to here
    "keyframes": [{ "t": 2000, "x": 10, "y": 60, "w": 30, "h": 10 }],
    "shape": "pill",                   // pill | rect | ellipse
    "visible": true,                   // false = invisible tap area
    "label": "Buy now",
    "color": "#7c5cff",
    "action": {
      "type": "link",                  // link | popup | qr | seek
      "url": "https://example.com",    // link target / popup button / QR content
      "title": "", "message": "",      // popup text, QR heading
      "button_label": "",              // popup button text
      "seek_ms": 0                     // for type "seek"
    }
  }]
}
```

`x, y, w, h` are percentages of the video frame, so layers line up on every
screen size. Several keyframes make the box glide linearly between them, which
is how a layer follows a moving hand or face. Schema 1 files (one static box per
layer) load too.

## Player API

```js
const player = new InteractiveVideoPlayer(container, options);
```

| Option | Default | |
|---|---|---|
| `project` | required | object or JSON string |
| `src` | `project.video` | override the video URL |
| `controls`, `autoplay`, `muted`, `loop`, `poster`, `crossOrigin` | | passed to the `<video>` |
| `debug` | `false` | outline invisible layers while calibrating |
| `theme` | | `{ accent, surface, text }` for the popup windows |

Methods: `play()`, `pause()`, `seek(ms)`, `runAction(layer)`, `closeWindow()`,
`setDebug(bool)`, `setProject(project)`, `destroy()`. Properties:
`currentTimeMs`, `layersNow`, `video`, `root`.

Events, with `player.on(name, handler)` (returns an unsubscribe function):

```js
player.on('action', (e) => {
  // e.layer, e.action. Take over a tap, for example for analytics or a custom UI:
  track('hotspot_click', e.layer.id);
  if (e.action.type === 'popup') { e.preventDefault(); myModal(e.action); }
});
```

`action`, `layerenter`, `layerleave`, `popupopen`, `popupclose`, `ready`, `error`.

Playback pauses while a popup or QR window is open and resumes when it closes.
Layers are real `<button>` elements, so they work with keyboard and screen
readers. A built-in fullscreen button keeps layers visible (the browser's own
video fullscreen would hide them).

## Headless core

`import { ... } from 'interactive-video-sdk/core'` has no DOM access.

```js
import { parseProject, frameAt, hitTest, sanitizeUrl, readBundle, writeBundle } from 'interactive-video-sdk/core';

const project = parseProject(jsonOrObject);       // validate + normalise, throws SdkError
const box = frameAt(project.layers[0], 3500);      // interpolated {x,y,width,height}
const layer = hitTest(project, 3500, 42, 31);      // what is under this point at this time?
const { project: p, videoBytes } = readBundle(buf);// .ivp in
const out = writeBundle(project, videoBytes);      // .ivp out
```

`hitTest` and `frameAt` are everything a player needs, so you can build one for
a native app, a TV, a game engine or a server that decides what a click means.

## Tracking an object

```js
import { trackObject, applyTrack, VideoFrameSource } from 'interactive-video-sdk';

const source = new VideoFrameSource(videoUrl);      // browser frame reader
const result = await trackObject({
  source,
  seed: { timeMs: 1000, x: 40, y: 40, width: 15, height: 25 }, // box around the object
  toMs: 6000,
  onProgress: (p) => console.log(p),
  signal: abortController.signal,
});
// result.frames   keyframes along the object's path
// result.lostAtMs set when the object left the picture or was hidden
layer = applyTrack(layer, result, 1000);
```

The tracker follows whatever is inside the seed box, so it works for any object
or body part and any number of people. It matches pixel patterns, so textured
things (faces, clothes, logos) track well and plain or fast-changing areas may
drift. It stops and reports `lostAtMs` instead of guessing. Re-seed at that
moment and run it again.

In Node, pass your own frame source: any object with
`getFrame(timeMs, width) -> { width, height, data }` where `data` is 8-bit
luminance (for example fed from `ffmpeg`).

`VideoFrameSource` needs the video to be same-origin or served with CORS
headers, otherwise the browser blocks reading pixels.

## Security

* Links only open for `http`, `https`, `mailto`, `tel` and `sms`.
  `javascript:`, `data:`, `file:` and everything else is refused
  (`sanitizeUrl`). Web links open with `noopener,noreferrer`.
* Popup text and labels are inserted as text, never as HTML.
* Projects are validated and size-limited; percentages are clamped.
* If you accept projects from users, still treat the `video` URL as untrusted
  and set a Content-Security-Policy for your page.

## Build and test

```bash
npm install
npm test        # core, format, tracker and security tests
npm run build   # writes dist/
```

`examples/embed.html` is a runnable demo (serve the folder with any static
server).

## Publishing

```bash
npm login
npm publish --access public
```

After that the CDN link above works automatically.
