// Microphone helpers. Audio is processed in the browser and kept in memory only.
// Nothing is saved to the device or sent anywhere.
import { useCallback, useEffect, useRef, useState } from 'react';

export type MicStatus = 'off' | 'starting' | 'on' | 'blocked' | 'unsupported';

/** Converts the mic's loudness to 0–100 (about -60 dB → 0, 0 dB → 100). Not calibrated SPL. */
export function levelFromRms(rms: number): number {
  if (rms <= 0) return 0;
  const db = 20 * Math.log10(rms);
  return Math.max(0, Math.min(100, Math.round(((db + 60) / 60) * 100)));
}

/** Live loudness from the microphone, about 15 updates a second. */
export function useMicLevel() {
  const [status, setStatus] = useState<MicStatus>('off');
  const [level, setLevel] = useState(0);
  const stopRef = useRef<() => void>(() => {});

  const stop = useCallback(() => {
    stopRef.current();
    stopRef.current = () => {};
    setStatus('off');
    setLevel(0);
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext) {
      setStatus('unsupported');
      return;
    }
    setStatus('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Float32Array(analyser.fftSize);
      let raf = 0;
      let last = 0;
      const tick = (t: number) => {
        raf = requestAnimationFrame(tick);
        if (t - last < 66) return;
        last = t;
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += v * v;
        setLevel(levelFromRms(Math.sqrt(sum / buf.length)));
      };
      raf = requestAnimationFrame(tick);
      stopRef.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((tr) => tr.stop());
        void ctx.close();
      };
      setStatus('on');
    } catch {
      setStatus('blocked');
    }
  }, []);

  useEffect(() => () => stopRef.current(), []);
  return { status, level, start, stop };
}

/** Record one take and play it back. The recording lives only in memory until the next take. */
export function useRecorder() {
  const [recording, setRecording] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const urlRef = useRef<string | null>(null);

  const setTake = useCallback((next: string | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = next;
    setUrl(next);
  }, []);
  const clear = useCallback(() => setTake(null), [setTake]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Recording does not work in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        setTake(URL.createObjectURL(blob));
        setRecording(false);
      };
      recRef.current = rec;
      rec.start();
      setError(null);
      setRecording(true);
    } catch {
      setError('The microphone is blocked. Allow it in the browser to record.');
    }
  }, [setTake]);

  const stop = useCallback(() => recRef.current?.state === 'recording' && recRef.current.stop(), []);

  useEffect(
    () => () => {
      if (recRef.current?.state === 'recording') recRef.current.stop();
    },
    [],
  );
  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  return { recording, url, error, start, stop, clear };
}
