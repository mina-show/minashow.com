/** Minashow logo mark */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/mina-show-logo.png"
      alt="Minashow"
      width={size}
      height={size}
      className="py-5"
    />
  );
}
