() => {
  if (navigator.maxTouchPoints < 1) throw new Error('Not a touch-capable context');
  return { maxTouchPoints: navigator.maxTouchPoints, width: window.innerWidth };
}
