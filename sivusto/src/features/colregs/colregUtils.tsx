import type { ReactElement } from "react";

/* ===========================================================================
 * Domain model
 * ========================================================================== */

export type Rule = 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30;
export type Color = "white" | "red" | "green" | "yellow";
/** Illustrative fixture position: x to starboard, y forward, z upward. */
export type Vec3 = readonly [x: number, y: number, z: number];
export type Side = "port" | "starboard";
export type State = "making-way" | "stopped" | "anchored";

export type Shape =
  | "ball"
  | "diamond"
  | "cone-up"
  | "cone-down"
  | "cones-apexes-together"
  | "cylinder"
  | "alpha-flag";

/** Bearing sector in degrees clockwise from the bow, centred on `center`. */
export type Sector = Readonly<{ center: number; width: number }>;

export interface Light {
  readonly id: string;
  readonly color: Color;
  readonly position: Vec3;
  readonly sector: Sector;
  readonly flash?: { readonly periodMs: number; readonly onMs: number; readonly phaseMs: number };
  readonly highIntensity?: boolean;
}

export interface DayShape {
  readonly id: string;
  readonly shape: Shape;
  readonly position: Vec3;
}

export interface Display {
  readonly rule: Rule;
  readonly lights: readonly Light[];
  readonly shapes: readonly DayShape[];
  readonly notes: readonly string[];
  readonly deckLighting: boolean;
}

/* ---------------------------------------------------------------------------
 * Scenarios
 *
 * Optional fields pick a permitted alternative from the Rules; mandatory
 * lights can never be switched off.
 * ------------------------------------------------------------------------- */

type PowerDrivenOptions = { readonly secondMasthead?: boolean };
type AnchorOptions = { readonly twoAnchorLights?: boolean; readonly illuminateDeck?: boolean };
type SailingRigOptions = { readonly rig?: "separate" | "tricolor" | "red-over-green" };
type TowingOptions = PowerDrivenOptions & { readonly towLengthM: number };
type OrdinaryVessel =
  | ({ readonly propulsion: "power" } & PowerDrivenOptions)
  | ({ readonly propulsion: "sail" } & SailingRigOptions);
type FishingState = { readonly state: State };

export type Scenario = { readonly lengthM: number } & (
  | ({ readonly rule: 23; readonly kind: "power" | "air-cushion" | "wig" } & PowerDrivenOptions)
  | { readonly rule: 23; readonly kind: "under-12-all-round"; readonly offsetWhiteX?: number }
  | {
      readonly rule: 23;
      readonly kind: "under-7-slow";
      readonly maximumSpeedKnots: number;
      readonly sidelightsPracticable: boolean;
    }
  | ({ readonly rule: 24; readonly kind: "towing-astern" } & TowingOptions)
  | ({ readonly rule: 24; readonly kind: "pushing" | "towing-alongside" | "composite" } & PowerDrivenOptions)
  | { readonly rule: 24; readonly kind: "towed"; readonly towLengthM: number }
  | { readonly rule: 24; readonly kind: "pushed" | "towed-alongside" }
  | {
      readonly rule: 24;
      readonly kind: "submerged-tow";
      readonly breadthM: number;
      readonly towLengthM: number;
      readonly dracone?: boolean;
    }
  | { readonly rule: 24; readonly kind: "tow-display-impracticable" }
  | ({ readonly rule: 24; readonly kind: "assistance-tow-impracticable" } & PowerDrivenOptions)
  | ({ readonly rule: 25; readonly kind: "sailing" } & SailingRigOptions)
  | { readonly rule: 25; readonly kind: "small-sail-torch" | "oars-torch" }
  | ({ readonly rule: 25; readonly kind: "oars-sailing-lights" } & SailingRigOptions)
  | ({ readonly rule: 25; readonly kind: "motor-sailing" } & PowerDrivenOptions)
  | ({
      readonly rule: 26;
      readonly kind: "trawling";
      readonly aftMasthead?: boolean;
      /** Set only for fishing in close proximity (26(d), Annex II). */
      readonly netSignal?: "shooting" | "hauling" | "fast";
      readonly pairTrawling?: boolean;
    } & FishingState)
  | ({
      readonly rule: 26;
      readonly kind: "fishing";
      readonly gear?: { readonly extentM: number; readonly bearingDeg: number };
      /** Optional Annex II display; only when hampered by purse-seine gear. */
      readonly purseSeineHampered?: boolean;
    } & FishingState)
  | ({ readonly rule: 26; readonly kind: "not-fishing" } & OrdinaryVessel)
  | { readonly rule: 27; readonly kind: "nuc"; readonly makingWay: boolean }
  | ({ readonly rule: 27; readonly kind: "ram"; readonly state: State } & PowerDrivenOptions & AnchorOptions)
  | ({ readonly rule: 27; readonly kind: "restricted-towing" } & TowingOptions)
  | ({
      readonly rule: 27;
      readonly kind: "dredging";
      readonly state: State;
      readonly obstructionSide?: Side;
    } & PowerDrivenOptions)
  | { readonly rule: 27; readonly kind: "diving-small" }
  | ({ readonly rule: 27; readonly kind: "mine-clearance"; readonly state: State } & PowerDrivenOptions & AnchorOptions)
  | { readonly rule: 27; readonly kind: "under-12-exemption" }
  | ({
      readonly rule: 28;
      readonly kind: "constrained-draught";
      readonly showOptionalSignal?: boolean;
    } & PowerDrivenOptions)
  | ({
      readonly rule: 29;
      readonly kind: "pilot";
      readonly state: "underway" | "anchored";
    } & AnchorOptions)
  | ({ readonly rule: 29; readonly kind: "off-duty" } & OrdinaryVessel)
  | ({ readonly rule: 30; readonly kind: "anchored" } & AnchorOptions)
  | ({
      readonly rule: 30;
      readonly kind: "aground";
      readonly signalsPracticable?: boolean;
      readonly showOptionalUnder12Signals?: boolean;
    } & AnchorOptions)
  | { readonly rule: 30; readonly kind: "under-7-anchor-exemption" }
);

type Rule23Scenario = Extract<Scenario, { rule: 23 }>;
type Rule24Scenario = Extract<Scenario, { rule: 24 }>;
type Rule25Scenario = Extract<Scenario, { rule: 25 }>;
type Rule26Scenario = Extract<Scenario, { rule: 26 }>;
type Rule27Scenario = Extract<Scenario, { rule: 27 }>;
type Rule28Scenario = Extract<Scenario, { rule: 28 }>;
type Rule29Scenario = Extract<Scenario, { rule: 29 }>;
type Rule30Scenario = Extract<Scenario, { rule: 30 }>;

/* ===========================================================================
 * Light arcs and fixture positions
 *
 * Bearings are measured clockwise from the bow. Coordinates are illustrative.
 * ========================================================================== */

const ALL_AROUND: Sector = { center: 0, width: 360 };
const AHEAD: Sector = { center: 0, width: 225 }; // masthead-light arc
const ASTERN: Sector = { center: 180, width: 135 }; // stern-light arc
const PORT: Sector = { center: 303.75, width: 112.5 };
const STARBOARD: Sector = { center: 56.25, width: 112.5 };

const POS = {
  foreMasthead: [0, 20, 34],
  aftMasthead: [0, -20, 46],
  stern: [0, -40, 6],
  signalStack: [0, 0, 26],
  anchorFore: [0, 35, 30],
  anchorAft: [0, -35, 12],
} as const satisfies Record<string, Vec3>;

const STACK_GAP = 6;

/* Length thresholds from the Rules (all in metres). */
const SECOND_MASTHEAD_MIN_LENGTH = 50;
const SINGLE_ANCHOR_LIGHT_MAX_LENGTH = 50; // below this, one anchor light suffices
const DECK_LIGHTING_MIN_LENGTH = 100;
const THREE_MASTHEAD_LIGHTS_MIN_TOW_LENGTH = 200; // strictly greater than
const GEAR_SIGNAL_MIN_EXTENT = 150; // strictly greater than
const SIDE_TOW_LIGHTS_MIN_BREADTH = 25;

/* ===========================================================================
 * Fixture factories and small validation helpers
 * ========================================================================== */

function assertCondition(ok: boolean, message: string): asserts ok {
  if (!ok) throw new RangeError(message);
}
function assertPositiveFinite(value: number, name: string): void {
  assertCondition(Number.isFinite(value) && value > 0, `${name} must be a positive finite number.`);
}
function assertFinite(value: number, name: string): void {
  assertCondition(Number.isFinite(value), `${name} must be finite.`);
}
function assertLengthBelow(lengthM: number, maxExclusive: number, ruleText: string): void {
  assertCondition(lengthM < maxExclusive, `${ruleText} requires length < ${maxExclusive} m.`);
}

const makeLight = (id: string, color: Color, position: Vec3, sector: Sector = ALL_AROUND): Light => ({
  id,
  color,
  position,
  sector,
});
const makeShape = (id: string, kind: Shape, position: Vec3): DayShape => ({ id, shape: kind, position });

/** One light per color, stacked vertically downward from `position`. */
function stackedLights(
  id: string,
  colors: readonly Color[],
  position: Vec3 = POS.signalStack,
  sector: Sector = ALL_AROUND,
): Light[] {
  return colors.map((color, index) =>
    makeLight(`${id}-${index}`, color, [position[0], position[1], position[2] - index * STACK_GAP], sector),
  );
}

function stackedShapes(id: string, kinds: readonly Shape[], position: Vec3 = POS.signalStack): DayShape[] {
  return kinds.map((kind, index) =>
    makeShape(`${id}-${index}`, kind, [position[0], position[1], position[2] - index * STACK_GAP]),
  );
}

/** Sidelights, either as separate fixtures or combined in one lantern. */
function sidelights(forwardY = 10, combinedLantern = false): Light[] {
  const x = combinedLantern ? 0 : 10;
  return [
    makeLight("port", "red", [-x, forwardY, 6], PORT),
    makeLight("starboard", "green", [x, forwardY, 6], STARBOARD),
  ];
}
const sternLight = (): Light => makeLight("stern", "white", POS.stern, ASTERN);
const underwayLights = (): Light[] => [...sidelights(), sternLight()];

/* ===========================================================================
 * Reusable light sets (Rules 23/25 and vessels in ordinary service)
 * ========================================================================== */

function powerDrivenLights(lengthM: number, secondMasthead = false): Light[] {
  const lights = [makeLight("masthead-forward", "white", POS.foreMasthead, AHEAD)];
  if (lengthM >= SECOND_MASTHEAD_MIN_LENGTH || secondMasthead) {
    lights.push(makeLight("masthead-aft", "white", POS.aftMasthead, AHEAD));
  }
  return [...lights, ...underwayLights()];
}

function anchorLights(lengthM: number, twoAnchorLights = false): Light[] {
  if (lengthM < SINGLE_ANCHOR_LIGHT_MAX_LENGTH && !twoAnchorLights) {
    return [makeLight("anchor", "white", POS.anchorFore)];
  }
  return [
    makeLight("anchor-forward", "white", POS.anchorFore),
    makeLight("anchor-aft", "white", POS.anchorAft),
  ];
}

function towingVesselLights(
  lengthM: number,
  towLengthM: number,
  secondMasthead = false,
  showTowLight = true,
): Light[] {
  assertCondition(Number.isFinite(towLengthM) && towLengthM > 0, "towLengthM must be positive.");
  // Long tows (> 200 m) add a third white masthead light.
  const mastheadStack: readonly Color[] =
    towLengthM > THREE_MASTHEAD_LIGHTS_MIN_TOW_LENGTH
      ? ["white", "white", "white"]
      : ["white", "white"];
  const lights = stackedLights("towing-masthead", mastheadStack, POS.foreMasthead, AHEAD);

  if (lengthM >= SECOND_MASTHEAD_MIN_LENGTH || secondMasthead) {
    lights.push(makeLight("masthead-aft", "white", POS.aftMasthead, AHEAD));
  }
  lights.push(...underwayLights());
  if (showTowLight) lights.push(makeLight("towing", "yellow", [0, -40, 12], ASTERN));
  return lights;
}

function sailingLights(lengthM: number, rig: SailingRigOptions["rig"] = "separate"): Light[] {
  if (rig === "tricolor") {
    assertCondition(lengthM < 20, "The combined mast-top lantern requires length < 20 m.");
    const position: Vec3 = [0, 0, 34];
    return [
      makeLight("port", "red", position, PORT),
      makeLight("starboard", "green", position, STARBOARD),
      makeLight("stern", "white", position, ASTERN),
    ];
  }
  return [
    ...underwayLights(),
    ...(rig === "red-over-green" ? stackedLights("sailing", ["red", "green"], [0, 0, 34]) : []),
  ];
}

function ordinaryVesselLights(lengthM: number, vessel: OrdinaryVessel): Light[] {
  return vessel.propulsion === "power"
    ? powerDrivenLights(lengthM, vessel.secondMasthead)
    : sailingLights(lengthM, vessel.rig);
}

/* ===========================================================================
 * Display accumulator shared by all rule builders
 * ========================================================================== */

class DisplayBuilder {
  private readonly lights: Light[] = [];
  private readonly dayShapes: DayShape[] = [];
  private readonly notes: string[] = [];
  private deckLighting = false;

  addLight(...args: Parameters<typeof makeLight>): this {
    this.lights.push(makeLight(...args));
    return this;
  }
  addLights(...items: readonly Light[]): this {
    this.lights.push(...items);
    return this;
  }
  addShape(...args: Parameters<typeof makeShape>): this {
    this.dayShapes.push(makeShape(...args));
    return this;
  }
  addShapes(...items: readonly DayShape[]): this {
    this.dayShapes.push(...items);
    return this;
  }
  note(text: string): this {
    this.notes.push(text);
    return this;
  }
  setDeckLighting(value: boolean): this {
    this.deckLighting = value;
    return this;
  }

  toDisplay(rule: Rule): Display {
    return {
      rule,
      lights: this.lights,
      shapes: this.dayShapes,
      notes: this.notes,
      deckLighting: this.deckLighting,
    };
  }
}

/* ---------------------------------------------------------------------------
 * Composite signal groups reused across rules
 * ------------------------------------------------------------------------- */

/** Rule 30 anchor signals; the day ball may be suppressed (vessel aground). */
function addAnchorSignals(
  builder: DisplayBuilder,
  lengthM: number,
  options: AnchorOptions,
  { withBall = true } = {},
): void {
  builder.addLights(...anchorLights(lengthM, options.twoAnchorLights));
  if (withBall) builder.addShape("anchor-ball", "ball", POS.anchorFore);
  builder.setDeckLighting(lengthM >= DECK_LIGHTING_MIN_LENGTH || !!options.illuminateDeck);
}

/** Rule 27(c) rigid-restricted-ability lights and shapes. */
function addRamSignals(builder: DisplayBuilder): void {
  builder
    .addLights(...stackedLights("ram", ["red", "white", "red"]))
    .addShapes(...stackedShapes("ram", ["ball", "diamond", "ball"]));
}

/** Rule 24(a)/(e) towing lights plus the > 200 m day diamond. */
function addTowingSignals(builder: DisplayBuilder, lengthM: number, tow: TowingOptions): void {
  builder.addLights(...towingVesselLights(lengthM, tow.towLengthM, tow.secondMasthead));
  if (tow.towLengthM > THREE_MASTHEAD_LIGHTS_MIN_TOW_LENGTH) {
    builder.addShape("tow-diamond", "diamond", [0, 20, 26]);
  }
}

/* ---------------------------------------------------------------------------
 * Per-kind handler maps. One handler per scenario kind, so each rule reads as
 * a flat list of labelled cases instead of a nested switch.
 * ------------------------------------------------------------------------- */

type HandlerMap<T extends { kind: string }> = {
  // Intersection also narrows union-valued kinds, e.g. "power" | "wig".
  [K in T["kind"]]: (scenario: T & { kind: K }, builder: DisplayBuilder) => void;
};
type Handler<T extends { kind: string }> = (scenario: T, builder: DisplayBuilder) => void;

function dispatch<T extends { kind: string }>(
  handlers: HandlerMap<T>,
  scenario: T,
  builder: DisplayBuilder,
): void {
  const lookup = handlers as unknown as Partial<Record<string, Handler<T>>>;
  const handler = lookup[scenario.kind];

  if (handler === undefined) {
    throw new RangeError(`Unknown scenario kind: ${scenario.kind}`);
  }

  handler(scenario, builder);
}

/* ===========================================================================
 * Rule 23 — power-driven vessels
 * ========================================================================== */

const WIG_FLASH = { periodMs: 500, onMs: 250, phaseMs: 0 } as const;

/** Rule 23(b)/(c) high-intensity flashing light for air-cushion vessels and WIG craft. */
function specialCraftLight(color: "yellow" | "red"): Light {
  return {
    ...makeLight("special-flash", color, [0, -12, 54]),
    flash: { ...WIG_FLASH },
    highIntensity: color === "red", // WIG craft
  };
}

const RULE_23_HANDLERS: HandlerMap<Rule23Scenario> = {
  power: (s, b) => b.addLights(...powerDrivenLights(s.lengthM, s.secondMasthead)),

  "air-cushion": (s, b) => {
    b.addLights(...powerDrivenLights(s.lengthM, s.secondMasthead), specialCraftLight("yellow"));
    b.note("23(b): air-cushion vessel in non-displacement mode only.");
  },

  wig: (s, b) => {
    b.addLights(...powerDrivenLights(s.lengthM, s.secondMasthead), specialCraftLight("red"));
    b.note("23(c): take-off, landing or flight near the surface only.");
  },

  "under-12-all-round": (s, b) => {
    assertLengthBelow(s.lengthM, 12, "23(d)(i)");
    const offsetWhiteX = s.offsetWhiteX ?? 0;
    assertFinite(offsetWhiteX, "offsetWhiteX");
    b.addLights(
      makeLight("all-round-white", "white", [offsetWhiteX, 20, 34]),
      ...sidelights(10, offsetWhiteX !== 0),
    );
    if (offsetWhiteX !== 0) {
      b.note(
        "23(d)(iii): offset fitting only if centreline fitting is impracticable; use combined sidelights.",
      );
    }
  },

  "under-7-slow": (s, b) => {
    assertCondition(
      s.lengthM < 7 && s.maximumSpeedKnots >= 0 && s.maximumSpeedKnots <= 7,
      "23(d)(ii) requires length < 7 m and maximum speed <= 7 knots.",
    );
    b.addLights(makeLight("all-round-white", "white", POS.foreMasthead));
    if (s.sidelightsPracticable) b.addLights(...sidelights());
    b.note("Sidelights must also be shown if practicable.");
  },
};

function buildRule23(scenario: Rule23Scenario, builder: DisplayBuilder): void {
  dispatch(RULE_23_HANDLERS, scenario, builder);
}

/* ===========================================================================
 * Rule 24 — towing and pushing
 * ========================================================================== */

const RULE_24_HANDLERS: HandlerMap<Rule24Scenario> = {
  "towing-astern": (s, b) => addTowingSignals(b, s.lengthM, s),

  // Pushing and towing alongside: same masthead stack as towing astern, but no yellow tow light.
  pushing: (s, b) => b.addLights(...towingVesselLights(s.lengthM, 200, s.secondMasthead, false)),
  "towing-alongside": (s, b) => b.addLights(...towingVesselLights(s.lengthM, 200, s.secondMasthead, false)),

  composite: (s, b) => {
    b.addLights(...powerDrivenLights(s.lengthM, s.secondMasthead));
    b.note("24(b): rigid composite unit; lengthM is the length of the unit.");
  },

  towed: (s, b) => {
    assertCondition(Number.isFinite(s.towLengthM) && s.towLengthM > 0, "towLengthM must be positive.");
    b.addLights(...underwayLights());
    if (s.towLengthM > THREE_MASTHEAD_LIGHTS_MIN_TOW_LENGTH) {
      b.addShape("tow-diamond", "diamond", POS.signalStack);
    }
  },

  pushed: (_, b) => b.addLights(...sidelights(38)),
  "towed-alongside": (_, b) => b.addLights(...sidelights(38), sternLight()),

  "submerged-tow": (s, b) => {
    assertCondition(
      Number.isFinite(s.breadthM) && s.breadthM > 0 && Number.isFinite(s.towLengthM) && s.towLengthM > 0,
      "Breadth and tow length must be positive.",
    );
    // Compress physical dimensions to a common drawing frame. Longitudinal
    // marker count is derived from metres; intermediate gaps are <= 100 m.
    const segmentCount = Math.ceil(s.lengthM / 100);
    for (let index = 0; index <= segmentCount; index++) {
      if (index === 0 && s.dracone) continue;
      b.addLight(`tow-end-${index}`, "white", [0, 40 - (80 * index) / segmentCount, 6]);
    }
    if (s.breadthM >= SIDE_TOW_LIGHTS_MIN_BREADTH) {
      b.addLights(
        makeLight("tow-port", "white", [-16, 0, 6]),
        makeLight("tow-starboard", "white", [16, 0, 6]),
      );
    }
    b.addShape("tow-aft-diamond", "diamond", [0, -40, 14]);
    if (s.towLengthM > THREE_MASTHEAD_LIGHTS_MIN_TOW_LENGTH) {
      b.addShape("tow-forward-diamond", "diamond", [0, 40, 14]);
    }
    b.note(
      "24(g): represents the last object or the combined tow; dimensions refer to that object/group.",
    );
  },

  "tow-display-impracticable": (_, b) => {
    b.note(
      "24(h): take all possible measures to light the tow or indicate its presence; no fixed substitute light pattern.",
    );
  },

  "assistance-tow-impracticable": (s, b) => {
    b.addLights(...powerDrivenLights(s.lengthM, s.secondMasthead));
    b.note(
      "24(i): only for a vessel not normally towing, assisting a vessel in distress/need, when towing lights are impracticable. Indicate the relationship, particularly by illuminating the towline.",
    );
  },
};

function buildRule24(scenario: Rule24Scenario, builder: DisplayBuilder): void {
  dispatch(RULE_24_HANDLERS, scenario, builder);
  builder.note(
    "24(f): vessels pushed/towed alongside in a group are lighted as one vessel. Tow length is measured from towing vessel stern to the far end of the tow.",
  );
}

/* ===========================================================================
 * Rule 25 — sailing vessels and vessels under oars
 * ========================================================================== */

const RULE_25_HANDLERS: HandlerMap<Rule25Scenario> = {
  sailing: (s, b) => b.addLights(...sailingLights(s.lengthM, s.rig)),
  "oars-sailing-lights": (s, b) => b.addLights(...sailingLights(s.lengthM, s.rig)),

  "small-sail-torch": (s, b) => {
    assertLengthBelow(s.lengthM, 7, "25(d)(i)");
    b.note("Use the normal sailing lights if practicable.");
    b.note(
      "Keep a white torch/lantern ready; exhibit in time to prevent collision. Not a permanent all-round light.",
    );
  },

  "oars-torch": (_, b) => {
    b.note(
      "25(d)(ii): keep a white torch/lantern ready; exhibit in time to prevent collision.",
    );
  },

  "motor-sailing": (s, b) => {
    b.addLights(...powerDrivenLights(s.lengthM, s.secondMasthead));
    b.addShape("motoring-cone", "cone-down", [0, 25, 26]);
    b.note(
      "25(e): cone forward by day; propulsion by machinery means Rule 23 lights at night.",
    );
  },
};

function buildRule25(scenario: Rule25Scenario, builder: DisplayBuilder): void {
  dispatch(RULE_25_HANDLERS, scenario, builder);
}

/* ===========================================================================
 * Rule 26 — fishing vessels
 * ========================================================================== */

const NET_SIGNAL_STACKS = {
  shooting: ["white", "white"],
  hauling: ["white", "red"],
  fast: ["red", "red"],
} as const satisfies Record<"shooting" | "hauling" | "fast", readonly Color[]>;

const PURSE_SEINE_FLASH_PERIOD_MS = 2000;

const RULE_26_HANDLERS: HandlerMap<Rule26Scenario> = {
  trawling: (s, b) => {
    b.addLights(...stackedLights("fishing", ["green", "white"]));
    b.addShape("fishing-cones", "cones-apexes-together", POS.signalStack);
    if (s.state === "making-way") b.addLights(...underwayLights());
    if (s.lengthM >= SECOND_MASTHEAD_MIN_LENGTH || s.aftMasthead) {
      b.addLight("trawling-masthead", "white", POS.aftMasthead, AHEAD);
    }
    if (s.netSignal) {
      b.addLights(...stackedLights("net", NET_SIGNAL_STACKS[s.netSignal], [12, 0, 14]));
      b.note(
        "26(d), Annex II: additional net signals in close proximity; compulsory at >= 20 m, permitted below 20 m. Range >= 1 mile and less than the main fishing lights.",
      );
    }
    if (s.pairTrawling) {
      b.note(
        "Annex II: night searchlight forward and toward the other trawler; compulsory at >= 20 m, permitted below 20 m. Not represented as an all-round light.",
      );
    }
  },

  fishing: (s, b) => {
    b.addLights(...stackedLights("fishing", ["red", "white"]));
    b.addShape("fishing-cones", "cones-apexes-together", POS.signalStack);
    if (s.state === "making-way") b.addLights(...underwayLights());
    if (s.gear) {
      assertCondition(
        Number.isFinite(s.gear.extentM) &&
          s.gear.extentM >= 0 &&
          Number.isFinite(s.gear.bearingDeg),
        "Invalid gear extent/bearing.",
      );
      if (s.gear.extentM > GEAR_SIGNAL_MIN_EXTENT) {
        const bearingRad = (s.gear.bearingDeg * Math.PI) / 180;
        const position: Vec3 = [20 * Math.sin(bearingRad), 20 * Math.cos(bearingRad), 14];
        b.addLight("gear", "white", position);
        b.addShape("gear-cone", "cone-up", position);
      }
    }
    if (s.purseSeineHampered) {
      const signals = stackedLights("purse-seine", ["yellow", "yellow"], [12, 0, 14]).map(
        (light, index) => ({
          ...light,
          flash: { periodMs: PURSE_SEINE_FLASH_PERIOD_MS, onMs: 1000, phaseMs: index * 1000 },
        }),
      );
      b.addLights(...signals);
      b.note(
        "26(d), Annex II: optional alternating yellow signals, only while hampered by purse-seine gear; range >= 1 mile and less than main fishing lights.",
      );
    }
  },

  "not-fishing": (s, b) => {
    b.addLights(...ordinaryVesselLights(s.lengthM, s));
    b.note(
      "26(e): ordinary underway display, with no fishing signals. For anchor/grounded state use Rule 30.",
    );
  },
};

function buildRule26(scenario: Rule26Scenario, builder: DisplayBuilder): void {
  dispatch(RULE_26_HANDLERS, scenario, builder);
  if (scenario.kind !== "not-fishing") {
    builder.note(
      "26(a): these fishing signals also apply at anchor; do not add ordinary anchor lights.",
    );
  }
}

/* ===========================================================================
 * Rule 27 — vessels restricted in their ability to manoeuvre
 * ========================================================================== */

const MINE_SIGNAL_POSITIONS = [
  [0, 20, 54],
  [-16, 20, 46],
  [16, 20, 46],
] as const satisfies readonly Vec3[];

const RULE_27_HANDLERS: HandlerMap<Rule27Scenario> = {
  nuc: (s, b) => {
    b.addLights(...stackedLights("nuc", ["red", "red"]));
    b.addShapes(...stackedShapes("nuc", ["ball", "ball"]));
    if (s.makingWay) b.addLights(...underwayLights());
  },

  ram: (s, b) => {
    addRamSignals(b);
    if (s.state === "making-way") {
      b.addLights(...powerDrivenLights(s.lengthM, s.secondMasthead));
    }
    if (s.state === "anchored") addAnchorSignals(b, s.lengthM, s);
  },

  "restricted-towing": (s, b) => {
    addRamSignals(b);
    addTowingSignals(b, s.lengthM, s);
  },

  dredging: (s, b) => {
    addRamSignals(b);
    if (s.state === "making-way") {
      b.addLights(...powerDrivenLights(s.lengthM, s.secondMasthead));
    }
    if (s.obstructionSide) {
      // Red balls mark the side with the obstruction; green diamonds mark the clear side.
      const obstructionX = s.obstructionSide === "starboard" ? 16 : -16;
      const passageX = -obstructionX;
      b.addLights(
        ...stackedLights("obstruction", ["red", "red"], [obstructionX, 0, 14]),
        ...stackedLights("passage", ["green", "green"], [passageX, 0, 14]),
      );
      b.addShapes(
        ...stackedShapes("obstruction", ["ball", "ball"], [obstructionX, 0, 14]),
        ...stackedShapes("passage", ["diamond", "diamond"], [passageX, 0, 14]),
      );
    }
    b.note("27(d): at anchor this display replaces the Rule 30 anchor signals.");
  },

  "diving-small": (_, b) => {
    b.addLights(...stackedLights("diving", ["red", "white", "red"]));
    b.addShape("diving-flag", "alpha-flag", POS.signalStack);
    b.note(
      "27(e): only when vessel size makes the full 27(d) display impracticable. Rigid Alpha flag >= 1 m high, visible all round.",
    );
  },

  "mine-clearance": (s, b) => {
    if (s.state === "anchored") addAnchorSignals(b, s.lengthM, s);
    else b.addLights(...powerDrivenLights(s.lengthM, s.secondMasthead));
    MINE_SIGNAL_POSITIONS.forEach((position, index) => {
      b.addLight(`mine-${index}`, "green", position);
      b.addShape(`mine-${index}`, "ball", position);
    });
    b.note("27(f): danger within 1000 m.");
  },

  "under-12-exemption": (s, b) => {
    assertLengthBelow(s.lengthM, 12, "27(g)");
    b.note(
      "27(g): Rule 27 lights/shapes are not required below 12 m, except when diving. This empty display encodes only that exemption, not duties under other rules.",
    );
  },
};

function buildRule27(scenario: Rule27Scenario, builder: DisplayBuilder): void {
  dispatch(RULE_27_HANDLERS, scenario, builder);
  if (scenario.lengthM < 12 && scenario.kind !== "diving-small") {
    builder.note("27(g): below 12 m these signals are optional unless engaged in diving.");
  }
  builder.note("27(h): these are not distress signals.");
}

/* ===========================================================================
 * Rule 28 — vessels constrained by their draught
 * ========================================================================== */

function buildRule28(scenario: Rule28Scenario, builder: DisplayBuilder): void {
  builder.addLights(...powerDrivenLights(scenario.lengthM, scenario.secondMasthead));
  if (scenario.showOptionalSignal !== false) {
    builder
      .addLights(...stackedLights("draught", ["red", "red", "red"]))
      .addShape("draught-cylinder", "cylinder", POS.signalStack);
  }
  builder.note(
    "28: additional draught signals are optional; applies to a vessel constrained by her draught.",
  );
}

/* ===========================================================================
 * Rule 29 — pilot vessels
 * ========================================================================== */

const RULE_29_HANDLERS: HandlerMap<Rule29Scenario> = {
  pilot: (s, b) => {
    b.addLights(...stackedLights("pilot", ["white", "red"], [0, 0, 34]));
    if (s.state === "underway") b.addLights(...underwayLights());
    else addAnchorSignals(b, s.lengthM, s);
  },

  "off-duty": (s, b) => {
    b.addLights(...ordinaryVesselLights(s.lengthM, s));
    b.note("29(b): ordinary underway display; for anchor/grounded state use Rule 30.");
  },
};

function buildRule29(scenario: Rule29Scenario, builder: DisplayBuilder): void {
  dispatch(RULE_29_HANDLERS, scenario, builder);
}

/* ===========================================================================
 * Rule 30 — anchored and aground
 * ========================================================================== */

const RULE_30_HANDLERS: HandlerMap<Rule30Scenario> = {
  anchored: (s, b) => addAnchorSignals(b, s.lengthM, s),

  aground: (s, b) => {
    addAnchorSignals(b, s.lengthM, s, { withBall: false }); // three balls replace the anchor ball
    // 30(d) incorporates (a)/(b), not the deck-illumination duty in (c).
    b.setDeckLighting(!!s.illuminateDeck);
    if ((s.lengthM >= 12 || s.showOptionalUnder12Signals) && s.signalsPracticable !== false) {
      b.addLights(...stackedLights("aground", ["red", "red"]));
      b.addShapes(...stackedShapes("aground", ["ball", "ball", "ball"]));
    }
    b.note(
      "30(d),(f): additional aground signals if practicable; not required below 12 m. Anchor lights remain.",
    );
  },

  "under-7-anchor-exemption": (s, b) => {
    assertLengthBelow(s.lengthM, 7, "30(e)");
    b.note(
      "30(e): only away from narrow channels, fairways and places where vessels normally navigate.",
    );
  },
};

function buildRule30(scenario: Rule30Scenario, builder: DisplayBuilder): void {
  dispatch(RULE_30_HANDLERS, scenario, builder);
}

/* ===========================================================================
 * Entry point
 * ========================================================================== */

 const ruleBuilders = {
   23: buildRule23,
   24: buildRule24,
   25: buildRule25,
   26: buildRule26,
   27: buildRule27,
   28: buildRule28,
   29: buildRule29,
   30: buildRule30,
 } satisfies {
   [R in Rule]: (
     scenario: Extract<Scenario, { rule: R }>,
     builder: DisplayBuilder,
   ) => void;
 };

 function runRuleBuilder(scenario: Scenario, builder: DisplayBuilder): void {
   const run = ruleBuilders[scenario.rule] as (
     scenario: Scenario,
     builder: DisplayBuilder,
   ) => void;

   run(scenario, builder);
 }
export function buildDisplay(scenario: Scenario): Display {
  assertPositiveFinite(scenario.lengthM, "lengthM");
  const builder = new DisplayBuilder();

  runRuleBuilder(scenario, builder);

  return builder.toDisplay(scenario.rule);
}


/* ===========================================================================
 * Geometry and animation
 * ========================================================================== */

/** Ideal nominal sectors, including shared endpoints; no real-world cutoff falloff. */
export function isVisible(sector: Sector, bearingDeg: number): boolean {
  assertFinite(bearingDeg, "bearingDeg");
  const angularDifference = ((((bearingDeg - sector.center) % 360) + 540) % 360) - 180;
  return Math.abs(angularDifference) <= sector.width / 2 + 1e-9;
}

export function isLit(light: Light, timeMs: number): boolean {
  assertFinite(timeMs, "timeMs");
  if (!light.flash) return true;
  const { periodMs, phaseMs, onMs } = light.flash;
  return (((timeMs + phaseMs) % periodMs) + periodMs) % periodMs < onMs;
}

export interface ProjectedPoint {
  readonly x: number;
  readonly y: number;
  readonly depth: number;
}

/** Sea-level orthographic view; SVG y increases downward. */
export function project([x, y, z]: Vec3, bearingDeg: number): ProjectedPoint {
  assertFinite(bearingDeg, "bearingDeg");
  const angleRad = (bearingDeg * Math.PI) / 180;
  return {
    x: -x * Math.cos(angleRad) + y * Math.sin(angleRad),
    y: -z,
    depth: x * Math.sin(angleRad) + y * Math.cos(angleRad),
  };
}

export function projectDisplay(display: Display, bearingDeg: number, timeMs = 0) {
  assertCondition(
    Number.isFinite(bearingDeg) && Number.isFinite(timeMs),
    "Bearing/time must be finite.",
  );
  return {
    ...display,
    lights: display.lights
      .filter((light) => isVisible(light.sector, bearingDeg))
      .map((light) => ({
        ...light,
        ...project(light.position, bearingDeg),
        on: isLit(light, timeMs),
      }))
      .sort((a, b) => a.depth - b.depth),
    shapes: display.shapes
      .map((shape) => ({ ...shape, ...project(shape.position, bearingDeg) }))
      .sort((a, b) => a.depth - b.depth),
  };
}

/* ===========================================================================
 * Rendering
 * ========================================================================== */

const COLORS: Record<Color, string> = {
  white: "#fff9e8",
  red: "#ff4545",
  green: "#36ef86",
  yellow: "#ffd84d",
};

const samePosition = (a: Vec3, b: Vec3): boolean =>
  a.every((coordinate, index) => coordinate === b[index]);

type ProjectedLight = ReturnType<typeof projectDisplay>["lights"][number];

/**
 * Combined sidelights share one fixture position. At the exact bow boundary
 * show both halves: green to the observer's left, red to the right.
 */
function renderLight(light: ProjectedLight, litLights: readonly ProjectedLight[]): ReactElement {
  const oppositeId =
    light.id === "port" ? "starboard" : light.id === "starboard" ? "port" : undefined;
  const isCombined =
    oppositeId !== undefined &&
    litLights.some(
      (other) => other.id === oppositeId && samePosition(other.position, light.position),
    );

  if (isCombined) {
    const sweep = light.id === "port" ? 1 : 0;
    return (
      <path
        key={light.id}
        transform={`translate(${light.x} ${light.y})`}
        d={`M 0 -1.6 A 1.6 1.6 0 0 ${sweep} 0 1.6 Z`}
        fill={COLORS[light.color]}
      >
        <title>{light.id}</title>
      </path>
    );
  }
  return (
    <circle key={light.id} cx={light.x} cy={light.y} r="1.6" fill={COLORS[light.color]}>
      <title>{light.id}</title>
    </circle>
  );
}

/** React SVG elements; wrap the result in an <svg> with an appropriate viewBox. */
export function renderSvg(scenario: Scenario, bearingDeg: number, timeMs = 0): ReactElement {
  const view = projectDisplay(buildDisplay(scenario), bearingDeg, timeMs);
  const litLights = view.lights.filter((light) => light.on);
  return (
    <>
      <rect x="-60" y="-65" width="120" height="80" fill="#080f1d" />
      {litLights.map((light) => renderLight(light, litLights))}
    </>
  );
}

/* ===========================================================================
 * Starter catalogue. Change length/state/options to generate further variants.
 * ========================================================================== */

export const EXAMPLES = [
  { rule: 23, kind: "power", lengthM: 30 },
  { rule: 23, kind: "power", lengthM: 60 },
  { rule: 23, kind: "air-cushion", lengthM: 30 },
  { rule: 23, kind: "wig", lengthM: 30 },
  { rule: 23, kind: "under-12-all-round", lengthM: 10 },
  {
    rule: 23,
    kind: "under-7-slow",
    lengthM: 6,
    maximumSpeedKnots: 7,
    sidelightsPracticable: false,
  },
  { rule: 24, kind: "towing-astern", lengthM: 30, towLengthM: 200 },
  { rule: 24, kind: "towing-astern", lengthM: 60, towLengthM: 201 },
  { rule: 24, kind: "pushing", lengthM: 30 },
  { rule: 24, kind: "towing-alongside", lengthM: 30 },
  { rule: 24, kind: "composite", lengthM: 80 },
  { rule: 24, kind: "towed", lengthM: 30, towLengthM: 201 },
  { rule: 24, kind: "pushed", lengthM: 30 },
  { rule: 24, kind: "towed-alongside", lengthM: 30 },
  { rule: 24, kind: "submerged-tow", lengthM: 250, breadthM: 30, towLengthM: 300 },
  { rule: 24, kind: "submerged-tow", lengthM: 50, breadthM: 10, towLengthM: 150, dracone: true },
  { rule: 24, kind: "tow-display-impracticable", lengthM: 10 },
  { rule: 24, kind: "assistance-tow-impracticable", lengthM: 10 },
  { rule: 25, kind: "sailing", lengthM: 15 },
  { rule: 25, kind: "sailing", lengthM: 15, rig: "tricolor" },
  { rule: 25, kind: "sailing", lengthM: 15, rig: "red-over-green" },
  { rule: 25, kind: "small-sail-torch", lengthM: 6 },
  { rule: 25, kind: "oars-torch", lengthM: 6 },
  { rule: 25, kind: "oars-sailing-lights", lengthM: 6 },
  { rule: 25, kind: "motor-sailing", lengthM: 15 },
  { rule: 26, kind: "trawling", lengthM: 30, state: "stopped" },
  {
    rule: 26,
    kind: "trawling",
    lengthM: 60,
    state: "making-way",
    netSignal: "shooting",
    pairTrawling: true,
  },
  { rule: 26, kind: "fishing", lengthM: 30, state: "anchored" },
  {
    rule: 26,
    kind: "fishing",
    lengthM: 30,
    state: "making-way",
    gear: { extentM: 151, bearingDeg: 90 },
  },
  { rule: 26, kind: "fishing", lengthM: 30, state: "stopped", purseSeineHampered: true },
  { rule: 26, kind: "not-fishing", lengthM: 30, propulsion: "power" },
  { rule: 27, kind: "nuc", lengthM: 30, makingWay: true },
  { rule: 27, kind: "ram", lengthM: 60, state: "making-way" },
  { rule: 27, kind: "ram", lengthM: 60, state: "anchored" },
  { rule: 27, kind: "restricted-towing", lengthM: 60, towLengthM: 201 },
  { rule: 27, kind: "dredging", lengthM: 60, state: "anchored", obstructionSide: "port" },
  { rule: 27, kind: "diving-small", lengthM: 8 },
  { rule: 27, kind: "mine-clearance", lengthM: 60, state: "making-way" },
  { rule: 27, kind: "under-12-exemption", lengthM: 10 },
  { rule: 28, kind: "constrained-draught", lengthM: 150 },
  { rule: 29, kind: "pilot", lengthM: 20, state: "underway" },
  { rule: 29, kind: "pilot", lengthM: 20, state: "anchored" },
  { rule: 29, kind: "off-duty", lengthM: 20, propulsion: "power" },
  { rule: 30, kind: "anchored", lengthM: 30 },
  { rule: 30, kind: "anchored", lengthM: 100 },
  { rule: 30, kind: "aground", lengthM: 60 },
  { rule: 30, kind: "aground", lengthM: 10 },
  { rule: 30, kind: "under-7-anchor-exemption", lengthM: 6 },
] as const satisfies readonly Scenario[];
