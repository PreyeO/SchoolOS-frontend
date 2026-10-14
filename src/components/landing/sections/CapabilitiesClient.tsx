"use client";

import { useState } from "react";
import { CAPABILITY_WEDGES } from "@/data/capabilities";
import { CapabilityWedge } from "./CapabilityWedge";
import { CapabilityGrid } from "./CapabilityGrid";

export function CapabilitiesClient() {
  const [active, setActive] = useState<string>(CAPABILITY_WEDGES[0].id);

  return (
    <div>
      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        role="tablist"
        aria-label="Capabilities"
      >
        {CAPABILITY_WEDGES.map((wedge) => (
          <CapabilityWedge
            key={wedge.id}
            wedge={wedge}
            active={active === wedge.id}
            onClick={() => setActive(wedge.id)}
          />
        ))}
      </div>
      <CapabilityGrid />
    </div>
  );
}
