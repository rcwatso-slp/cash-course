import { useEffect, useRef, useState } from 'react';
import { useMicLevel } from '../../lib/audio';
import { useSettings } from '../../lib/settings';

/** Notice shown when the clinician hasn't turned the microphone on for this patient. */
export function MicOffNote() {
  return (
    <p className="notice">
      The microphone is off for this patient, so there’s no meter or recording. You can still practice and mark each one. To turn it on: 🔒
      Clinician → Settings → Speech.
    </p>
  );
}

/**
 * Live loudness meter with a target line. Starts when the patient presses the button.
 * Nothing is recorded or saved.
 */
export function MicMeter({ onLevel, onLive }: { onLevel?: (level: number) => void; onLive?: (live: boolean) => void }) {
  const { settings, update } = useSettings();
  const mic = useMicLevel();
  const [calibrating, setCalibrating] = useState(false);
  const samples = useRef<number[]>([]);
  const target = settings.loudTarget;

  useEffect(() => onLive?.(mic.status === 'on'), [mic.status, onLive]);

  useEffect(() => {
    if (mic.status !== 'on') return;
    onLevel?.(mic.level);
    if (calibrating) samples.current.push(mic.level);
  }, [mic.level, mic.status, onLevel, calibrating]);

  function calibrate() {
    samples.current = [];
    setCalibrating(true);
    setTimeout(() => {
      setCalibrating(false);
      const top = [...samples.current].sort((a, b) => b - a).slice(0, Math.max(3, Math.floor(samples.current.length / 3)));
      if (top.length) update({ loudTarget: Math.max(20, Math.min(95, Math.round(top.reduce((a, b) => a + b, 0) / top.length) - 3)) });
    }, 3000);
  }

  if (mic.status !== 'on') {
    return (
      <div className="meter-start">
        <button className="primary" onClick={() => void mic.start()} disabled={mic.status === 'starting'}>
          🎤 Turn on the voice meter
        </button>
        {mic.status === 'blocked' && <p className="feedback bad">The microphone is blocked. Allow it in the browser’s address bar, then try again.</p>}
        {mic.status === 'unsupported' && <p className="feedback info">This browser can’t use the microphone.</p>}
        <p className="muted small">Sound stays on this device. Nothing is recorded or saved.</p>
      </div>
    );
  }

  const hit = mic.level >= target;
  return (
    <div className="meter-wrap">
      <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={mic.level} aria-label="Voice loudness">
        <div className={`meter-fill ${hit ? 'hit' : ''}`} style={{ width: `${mic.level}%` }} />
        <div className="meter-target" style={{ left: `${target}%` }} aria-hidden="true" />
      </div>
      <p className={`meter-label ${hit ? 'hit' : ''}`}>{hit ? '✓ Strong voice' : 'Louder — reach the line'}</p>
      <div className="button-row small-buttons">
        <button className="button" onClick={calibrate} disabled={calibrating}>
          {calibrating ? 'Listening for 3 seconds…' : 'Clinician: set the line from this voice'}
        </button>
        <button className="button" onClick={mic.stop}>
          Turn the meter off
        </button>
      </div>
    </div>
  );
}
