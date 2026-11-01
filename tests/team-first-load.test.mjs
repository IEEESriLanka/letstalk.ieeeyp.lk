import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import ts from "typescript";
import { defaultSiteContent, getDisplayYearTeams } from "../src/lib/site-content.ts";

test("a fresh team visit preserves server-loaded members without hidden cards", async () => {
  const source = await readFile(new URL("../src/routes/team.tsx", import.meta.url), "utf8");
  let loaderData;
  const content = {
    ...defaultSiteContent,
    teamPage: {
      ...defaultSiteContent.teamPage,
      yearlyTeams: [{ year: "2099", members: [
        { name: "Published Chair", role: "Chair", initials: "PC", track: "Leadership" },
        { name: "Published Vice Chair", role: "Vice Chair", initials: "PV", track: "Leadership" },
        { name: "Published Member", role: "Committee Member", initials: "PM", track: "Committee" },
      ] }],
    },
  };
  const serverClient = new QueryClient();
  const browserClient = new QueryClient();
  globalThis.__teamFirstLoad = {
    React, useQuery, motion, defaultSiteContent, getDisplayYearTeams,
    getSiteContent: async () => content,
    createFileRoute: () => (options) => ({ ...options, useLoaderData: () => loaderData }),
  };
  try {
    const isolated = source.replace(/^import .*;\r?\n/gm, "");
    const compiled = ts.transpileModule(`
      const { React, useQuery, motion, defaultSiteContent, getDisplayYearTeams, getSiteContent, createFileRoute } = globalThis.__teamFirstLoad;
      const { useState } = React;
      const SiteNav = () => null;
      const SiteFooter = () => null;
      const ArrowRight = () => null;
      const Linkedin = () => null;
      const Mail = () => null;
      const Phone = () => null;
      const Reveal = ({ children }) => React.createElement('div', null, children);
      const RevealGroup = ({ children }) => React.createElement(motion.div, { initial: 'hidden' }, children);
      const fadeUp = { hidden: { opacity: 0, y: 28, filter: 'blur(8px)' } };
      const getOptimizedTeamImage = () => undefined;
      ${isolated}
    `, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React } }).outputText;
    const { Route } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
    loaderData = await Route.loader({ context: { queryClient: serverClient } });
    assert.deepEqual(loaderData, content, "Loader must serialize the fetched content to the browser");
    const render = (client) => renderToStaticMarkup(React.createElement(QueryClientProvider, { client }, React.createElement(Route.component)));
    const serverHtml = render(serverClient);
    const browserHtml = render(browserClient);
    assert.equal(browserHtml, serverHtml, "An empty browser cache must render the same members as SSR");
    for (const member of content.teamPage.yearlyTeams[0].members) {
      assert.ok(browserHtml.includes(member.name), `Missing ${member.name}`);
    }
    const cards = browserHtml.match(/<article\b[^>]*>/g) ?? [];
    assert.equal(cards.length, 3);
    for (const card of cards) assert.doesNotMatch(card, /opacity:\s*0|visibility:\s*hidden|display:\s*none/);
  } finally {
    serverClient.clear();
    browserClient.clear();
    delete globalThis.__teamFirstLoad;
  }
});
