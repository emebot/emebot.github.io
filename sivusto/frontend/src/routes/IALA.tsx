import { createFileRoute } from "@tanstack/react-router";
import { IALA } from "../features/iala";

export const Route = createFileRoute("/IALA")({
  component: IALA,
  head: () => ({ meta: [{ title: "IALA-loistot – Majakka" }] }),
});
