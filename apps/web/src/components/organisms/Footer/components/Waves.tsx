export const Waves = () => (
    <svg preserveAspectRatio="none" shapeRendering="auto" viewBox="0 25 100 35">
        <defs>
            <path d="M-0 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" id="gentle-wave"></path>
        </defs>
        <div className="parallax">
            <use fill="rgba(13, 37, 70, 0.4)" href="#gentle-wave" x="0" y="0"></use>
            <use fill="rgba(13, 37, 70, 0.4)" href="#gentle-wave" x="-10" y="5"></use>
            <use fill="rgba(13, 37, 70, 0.4)" href="#gentle-wave" x="-20" y="10"></use>
            <use fill="rgba(13, 37, 70, 1)" href="#gentle-wave" x="-30" y="15"></use>
        </div>
    </svg>
);
