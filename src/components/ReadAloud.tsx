import { speak } from '../lib/speech';
import { useSettings } from '../lib/settings';

export function ReadAloud({ text }: { text: string }) {
  const { settings } = useSettings();
  if (!settings.readAloud) return null;
  return (
    <button type="button" className="read-aloud" aria-label="Read aloud" title="Read aloud" onClick={() => speak(text)}>
      🔊
    </button>
  );
}
