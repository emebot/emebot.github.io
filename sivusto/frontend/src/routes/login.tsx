import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "../features/login";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});
