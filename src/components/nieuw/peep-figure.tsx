export function PeepFigure({
  src,
  rol,
  className = "h-[230px]",
}: {
  src: string;
  rol: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={`Illustratie: ${rol}`}
      className={`w-auto max-w-none object-contain object-bottom drop-shadow-[0_8px_10px_rgba(0,0,0,0.16)] ${className}`}
      draggable={false}
      decoding="async"
    />
  );
}
