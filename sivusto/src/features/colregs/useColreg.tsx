import { useState } from "react";
import { renderSvg } from "./colregUtils";
import type { Scenario } from "./colregUtils";

export default function useColreg() {
  const [scenario, setScenario] = useState<Scenario>({ rule: 23, kind: "power", lengthM: 30 });
  const [bearingDeg, setBearingDeg] = useState(0);

  const view = renderSvg(scenario, bearingDeg);

  return { view, scenario, bearingDeg, setScenario, setBearingDeg };
}
