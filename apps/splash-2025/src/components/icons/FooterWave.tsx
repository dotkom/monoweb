export const FooterWave = ({ color, className }: { color: string; className?: string }) => {
  return (
    <svg
      width="639"
      height="63"
      viewBox="0 0 639 63"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="desc"
      className={className}
    >
      <desc id="desc">A decorative wave pattern</desc>
      <path
        d="M232.697 1.68998C167.796 -9.50865 50.5235 37.6856 0 62.6825V192H639V38.6854C588.922 14.6884 534.503 42.685 479.417 54.6835C424.331 66.682 313.824 15.6883 232.697 1.68998Z"
        fill={color}
      />
    </svg>
  )
}
