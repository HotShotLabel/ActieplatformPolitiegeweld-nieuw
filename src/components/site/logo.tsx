export function Logo({
  className = "h-6 w-auto",
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  return (
    <img
      src="/logo-actieplatform.png"
      alt="Actieplatform Politiegeweld"
      className={className}
      style={
        variant === "dark"
          ? { filter: "invert(1) hue-rotate(180deg)" }
          : undefined
      }
    />
  );
}
