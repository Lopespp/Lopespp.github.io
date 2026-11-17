import { HandLock, isFistClosed, isPeaceSign, palmCenter, type Point } from './gestures';

/**
 * Rastreamento da mão com o MediaPipe Hand Landmarker. Tudo aqui (a biblioteca,
 * o binário WebAssembly e o modelo) vem do próprio site e só é baixado quando o
 * visitante ativa o modo. O vídeo é processado no navegador e nunca sai dele.
 */

const MEDIAPIPE_PATH = `${import.meta.env.BASE_URL}mediapipe`;
/** Modelo de pontos da mão (MediaPipe Hand Landmarker), servido pelo próprio site. */
const MODEL_URL = `${MEDIAPIPE_PATH}/hand_landmarker.task`;

export interface HandReading {
  /** Altura da palma no quadro: 0 no topo, 1 embaixo. `null` sem mão à vista. */
  y: number | null;
  fist: boolean;
  peace: boolean;
}

export interface HandTracker {
  stop: () => void;
}

export type HandError = 'denied' | 'unavailable' | 'failed';

export class HandTrackingError extends Error {
  constructor(public readonly reason: HandError) {
    super(reason);
  }
}

const MIN_FRAME_MS = 60; // ~16 leituras por segundo bastam para navegar

export async function startHandTracking(
  video: HTMLVideoElement,
  onReading: (reading: HandReading) => void,
): Promise<HandTracker> {
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    throw new HandTrackingError('unavailable');
  }

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30, max: 30 } },
    });
  } catch (error) {
    const name = error instanceof DOMException ? error.name : '';
    throw new HandTrackingError(
      name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable',
    );
  }

  const release = () => {
    stream.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  };

  try {
    video.srcObject = stream;
    await video.play();

    const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
    const files = await FilesetResolver.forVisionTasks(MEDIAPIPE_PATH);
    const create = (delegate: 'GPU' | 'CPU') =>
      HandLandmarker.createFromOptions(files, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    // A GPU costuma ser bem mais rápida; sem WebGL2, volta para a CPU.
    let detector = await create('GPU').catch(() => create('CPU'));
    let usingGpu = true;

    const lock = new HandLock();
    let running = true;
    let fist = false;
    let lastFrame = 0;
    let request = 0;

    const loop = async () => {
      if (!running) return;
      request = requestAnimationFrame(loop);
      const now = performance.now();
      if (document.hidden || video.readyState < 2 || now - lastFrame < MIN_FRAME_MS) return;
      lastFrame = now;

      let result;
      try {
        result = detector.detectForVideo(video, now);
      } catch (error) {
        // Alguns drivers criam o contexto de GPU, mas falham na inferência.
        if (!usingGpu) throw error;
        usingGpu = false;
        detector.close();
        detector = await create('CPU');
        return;
      }

      const points: Point[] = result.landmarks[0] ?? [];
      const handedness = result.handedness?.[0]?.[0]?.categoryName ?? null;
      const accepted = points.length === 21 && lock.accept(points, handedness, now / 1000);
      if (!accepted) {
        fist = false;
        onReading({ y: null, fist: false, peace: false });
        return;
      }
      const aspectRatio = video.videoWidth / video.videoHeight || 1;
      fist = isFistClosed(points, aspectRatio, fist);
      const peace = !fist && isPeaceSign(points, aspectRatio);
      onReading({ y: palmCenter(points)?.y ?? null, fist, peace });
    };
    request = requestAnimationFrame(loop);

    const onEnded = () => onReading({ y: null, fist: false, peace: true });
    stream.getVideoTracks()[0]?.addEventListener('ended', onEnded);

    return {
      stop: () => {
        running = false;
        cancelAnimationFrame(request);
        detector.close();
        release();
      },
    };
  } catch (error) {
    release();
    if (error instanceof HandTrackingError) throw error;
    throw new HandTrackingError('failed');
  }
}
