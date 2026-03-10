/** Minashow logo mark */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/mina-show-logo.png"
      alt="Minashow"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
