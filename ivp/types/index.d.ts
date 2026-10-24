export type Shape = 'pill' | 'rect' | 'ellipse';
export type ActionType = 'link' | 'popup' | 'qr' | 'seek';

/** Box position/size in percent (0-100) of the video frame at `timeMs`. */
export interface Keyframe { timeMs: number; x: number; y: number; width: number; height: number }

export interface Action {
  type: ActionType;
  /** Link target, popup button target, or the text a QR code encodes. */
  url: string;
  title: string;
  message: string;
  buttonLabel: string;
  seekMs: number;
}

export interface Layer {
  id: string;
  name: string;
  startMs: number;
  endMs: number;
  keyframes: Keyframe[];
  shape: Shape;
  /** false = invisible tap area over something already in the video. */
  visible: boolean;
  label: string;
  /** CSS colour, `#rrggbb` or `#rrggbbaa`. */
  color: string;
  action: Action;
}

export interface Project { schemaVersion: number; video: string; layers: Layer[] }

export class SdkError extends Error {}

export const SCHEMA_VERSION: number;
export const SAFE_PROTOCOLS: string[];

export function sanitizeUrl(raw: unknown): string | null;
export function parseProject(input: string | object): Project;
export function serializeProject(project: Project): object;
export function stringifyProject(project: Project): string;
export function isNetworkVideo(project: Project): boolean;
export function colorToCss(value: number | string): string;
export function cssToColorInt(css: string): number;
export function isActive(layer: Layer, ms: number): boolean;
export function frameAt(layer: Layer, ms: number): Keyframe;
export function activeLayers(project: Project, ms: number): Layer[];
export function hitTest(project: Project, ms: number, xPct: number, yPct: number): Layer | null;

export function readBundle(data: Uint8Array | ArrayBuffer): { project: Project; videoBytes: Uint8Array };
export function writeBundle(project: Project, videoBytes: Uint8Array | ArrayBuffer, videoName?: string): Uint8Array;

/** 8-bit luminance frame, row by row. */
export interface GrayFrame { width: number; height: number; data: Uint8Array }
export interface FrameSource { getFrame(timeMs: number, width: number): Promise<GrayFrame> }

export interface TrackOptions {
  source: FrameSource;
  seed: Keyframe;
  toMs: number;
  stepMs?: number;
  frameWidth?: number;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}
export interface TrackOutcome { frames: Keyframe[]; lostAtMs: number | null; cancelled: boolean }
export function trackObject(options: TrackOptions): Promise<TrackOutcome>;
export function applyTrack(layer: Layer, outcome: TrackOutcome, seedTimeMs: number, forward?: boolean, toleranceMs?: number): Layer;

export class VideoFrameSource implements FrameSource {
  constructor(src: string, options?: { crossOrigin?: string | null; seekTimeoutMs?: number });
  open(): Promise<void>;
  getFrame(timeMs: number, width?: number): Promise<GrayFrame>;
  close(): void;
}

export interface PlayerOptions {
  project: string | object | Project;
  src?: string;
  controls?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  debug?: boolean;
  poster?: string;
  crossOrigin?: string;
  theme?: { accent?: string; surface?: string; text?: string };
}

export interface ActionEvent {
  layer: Layer;
  action: Action;
  defaultPrevented: boolean;
  /** Call to replace the built-in behaviour with your own. */
  preventDefault(): void;
}

export interface PlayerEvents {
  action: ActionEvent;
  layerenter: { layer: Layer };
  layerleave: { layer?: Layer };
  popupopen: { layer: Layer };
  popupclose: { layer: Layer };
  ready: {};
  error: { error: Error };
}

export class InteractiveVideoPlayer {
  constructor(container: HTMLElement, options: PlayerOptions);
  static fromBundle(container: HTMLElement, data: Uint8Array | ArrayBuffer, options?: Omit<PlayerOptions, 'project' | 'src'> & { mimeType?: string }): InteractiveVideoPlayer;
  readonly root: HTMLElement;
  readonly video: HTMLVideoElement;
  readonly project: Project;
  readonly currentTimeMs: number;
  readonly layersNow: Layer[];
  on<K extends keyof PlayerEvents>(event: K, handler: (payload: PlayerEvents[K]) => void): () => void;
  off<K extends keyof PlayerEvents>(event: K, handler: (payload: PlayerEvents[K]) => void): void;
  play(): Promise<void>;
  pause(): void;
  seek(ms: number): void;
  runAction(layer: Layer): void;
  closeWindow(): void;
  setDebug(on: boolean): void;
  setProject(project: string | object | Project): void;
  destroy(): void;
}
