export function GatewayVeil({ isActive = false }: { isActive?: boolean }) {
  return (
    <div className={`gateway-veil ${isActive ? "is-active" : ""}`} aria-hidden="true">
      <img src="/assets/gateway-icon.png" alt="" />
    </div>
  );
}
