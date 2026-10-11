// Read-aloud uses the browser's built-in voice. Nothing is sent anywhere.
export function speak(text: string): void {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    synth.speak(utterance);
  } catch {
    // speech not available
  }
}

// Calculator use is recorded with each problem.
let lastCalculatorUse = 0;
export const markCalculatorUsed = () => {
  lastCalculatorUse = Date.now();
};
export const calculatorUsedSince = (time: number) => lastCalculatorUse >= time;
