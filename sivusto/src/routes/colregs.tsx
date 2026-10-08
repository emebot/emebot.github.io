import { createFileRoute } from "@tanstack/react-router";
import { ColregsPage } from "../features/colregs";

export const Route = createFileRoute("/colregs")({
  component: ColregsPage,
  head: () => ({ meta: [{ title: "Kulkuvalot – Majakka" }] }),
});
