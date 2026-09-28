import { useState } from "react";
import { Topbar } from "../Navigation/Topbar";
import { OverlayMenu } from "../Navigation/OverlayMenu";
import { Rail } from "../Navigation/Rail";
import { GatewayVeil } from "../Common/GatewayVeil";

interface ShellLayoutProps {
  children: React.ReactNode;
  activeSection?: "gateway" | "case-study" | "works" | "about" | "contact";
  railMode?: "standard" | "work";
  topbarVariant?: "home" | "default";
}

export function ShellLayout({
  children,
  activeSection = "case-study",
  railMode = "standard",
  topbarVariant = "default",
}: ShellLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <GatewayVeil />
      <Topbar
        variant={topbarVariant}
        isOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
      />
      <OverlayMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
      <div className="shell">
        <Rail mode={railMode} activeSection={activeSection} />
        <div className="room">{children}</div>
      </div>
    </>
  );
}
