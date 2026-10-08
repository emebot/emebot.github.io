import { useState } from "react";
import type { ChangeEvent } from "react";
import PageHero from "../../components/PageHero";
import { EXAMPLES } from "./colregUtils";
import useColreg from "./useColreg";

const rules = [23, 24, 25, 26, 27, 28, 29, 30] as const;

const options = EXAMPLES.map((scenario, index) => ({
  scenario,
  value: String(index),
  label: [
    scenario.kind.replaceAll("-", " "),
    `${scenario.lengthM} m`,
    "state" in scenario && scenario.state.replaceAll("-", " "),
    "rig" in scenario && scenario.rig,
    "towLengthM" in scenario && `tow ${scenario.towLengthM} m`,
    "dracone" in scenario && "dracone",
    "netSignal" in scenario && scenario.netSignal,
    "pairTrawling" in scenario && "pair trawling",
    "gear" in scenario && `gear ${scenario.gear.extentM} m`,
    "purseSeineHampered" in scenario && "purse seine",
    "makingWay" in scenario && "making way",
    "obstructionSide" in scenario && `${scenario.obstructionSide} obstructed`,
  ].filter(Boolean).join(" · "),
}));

export default function ColregsPage() {
  const { view, scenario, bearingDeg, setScenario, setBearingDeg } = useColreg();

  const [selectedOption, setSelectedOption] = useState("");

  const handleScenarioChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const option = options.find((opt) => opt.value === e.currentTarget.value);
    if (!option) return;

    setSelectedOption(option.value);
    setScenario(option.scenario);
  };

  const handleBearingChange = (e: ChangeEvent<HTMLInputElement>) =>
    setBearingDeg(e.currentTarget.valueAsNumber);

  return (
    <>
      <PageHero eyebrow="COLREG-säännöt 23–30" title="Veneiden kulkuvalot">
        Valitse aluksen valokuvio ja käännä katselukulmaa nähdäksesi, miltä
        alus näyttää pimeällä eri suunnista.
      </PageHero>

      <section className="flex-1 border-t border-white/10 bg-navy-900 px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
          <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold uppercase tracking-wide text-amber-300">
                Aluksen valot
              </span>
              <select
                className="w-full rounded-xl border border-white/10 bg-navy-950 px-4 py-3 text-sm text-white focus:border-amber-300/60 focus:outline-none"
                value={selectedOption}
                onChange={handleScenarioChange}
              >
                <option value="" disabled>
                  Valitse valokuvio
                </option>

                {rules.map((rule) => (
                  <optgroup key={rule} label={`Sääntö ${rule}`}>
                    {options
                      .filter((option) => option.scenario.rule === rule)
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide text-amber-300">
                  Katselukulma
                </span>
                <span className="font-mono text-sm text-slate-300">
                  {bearingDeg}°
                </span>
              </div>
              <input
                className="w-full accent-amber-300"
                aria-label="Katselukulma"
                type="range"
                min={0}
                max={360}
                value={bearingDeg}
                onChange={handleBearingChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {["Keula", "Styyrpuuri", "Perä", "Paapuuri"].map((name, i) => {
                const active = bearingDeg === 90 * i;
                return (
                  <button
                    type="button"
                    key={name}
                    aria-pressed={active}
                    className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-amber-300 bg-amber-300 text-navy-950"
                        : "border-white/20 text-white hover:border-white/40"
                    }`}
                    onClick={() => setBearingDeg(90 * i)}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="-60 -65 120 80"
              role="img"
              className="block w-full"
              aria-label={`Rule ${scenario.rule} lights, bearing ${bearingDeg} degrees`}
            >
              {view}
            </svg>
          </div>
        </div>
      </section>
    </>
  );
}
