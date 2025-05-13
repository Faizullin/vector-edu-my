import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import NiceModal from "./components/nice-modal/NiceModal.tsx";
import { FontProvider } from "./context/font-context.tsx";
import { ThemeProvider } from "./context/theme-context.tsx";
import "./index.css";
import { routeTree } from "./routeTree.gen.ts";
import { Log } from "./utils/log.ts";

const handleApiError = (error: any) => {
  Log.error("queryClient:", error);
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleApiError,
  }),
  mutationCache: new MutationCache({
    onError: handleApiError,
  }),
});

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  basepath: import.meta.env.VITE_APP_BASE_URL,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <FontProvider>
          <NiceModal.Provider>
            <RouterProvider router={router} />
          </NiceModal.Provider>
        </FontProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
