export const Waves = () => (
  <svg viewBox="0 25 100 35" preserveAspectRatio="none" shapeRendering="auto">
    <title>Waves graphic</title>
    <defs>
      <path id="gentle-wave" d="M-0 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
    </defs>
    <div className="parallax">
      <use href="#gentle-wave" x="0" y="0" fill="rgba(13, 37, 70, 0.4)" />
      <use href="#gentle-wave" x="-10" y="5" fill="rgba(13, 37, 70, 0.4)" />
      <use href="#gentle-wave" x="-20" y="10" fill="rgba(13, 37, 70, 0.4)" />
      <use href="#gentle-wave" x="-30" y="15" fill="rgba(13, 37, 70, 1)" />
    </div>
  </svg>
)
