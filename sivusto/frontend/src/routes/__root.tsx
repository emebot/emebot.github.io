import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import Footer from "../components/Footer";
import Header from "../components/Header";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Majakka – opi yönavigoinnin valot",
      },
      {
        name: "description",
        content:
          "Opi tunnistamaan veneiden kulkuvalot, majakoiden ja väylämerkkien loistot sekä alusten siluetit pimeän ajan navigointia varten.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const isLoginRoute = useRouterState({
    select: (state) => state.location.pathname === "/login",
  });

  return (
    <html lang="fi">
      <head>
        <HeadContent />
      </head>
      <body
        className={`bg-navy-950 font-sans text-white ${isLoginRoute ? "" : "flex min-h-dvh flex-col"}`}
      >
        {!isLoginRoute && <Header />}
        {isLoginRoute ? (
          children
        ) : (
          <main className="flex flex-1 flex-col">{children}</main>
        )}
        {!isLoginRoute && <Footer />}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
        404
      </p>
      <h1 className="mt-4 font-serif text-4xl font-semibold">
        Sivua ei löytynyt
      </h1>
      <p className="mt-4 text-slate-300">
        Hakemaasi sivua ei ole olemassa tai se on siirretty.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-navy-950 transition hover:bg-amber-200"
      >
        Takaisin etusivulle
      </Link>
    </section>
  );
}
