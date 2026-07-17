const SW_BOOTSTRAP = `
(function () {
  if (!('serviceWorker' in navigator)) return;
  try {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function () {
      // Silent fallback: the app still works without offline support.
    });
  } catch (error) {
    // no-op
  }
})();
`;

export function PwaRegister() {
  return <script dangerouslySetInnerHTML={{ __html: SW_BOOTSTRAP }} />;
}
