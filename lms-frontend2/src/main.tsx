import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import NiceModal from './components/NiceModal/NiceModal.tsx'
import { Provider } from './components/ui/provider.tsx'
import { routeTree } from './routeTree.gen.ts'
import { Log } from './utils/log.ts'


const handleApiError = (error: any) => {
  Log.error('queryClient:', error)
}


const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleApiError,
  }),
  mutationCache: new MutationCache({
    onError: handleApiError,
  }),
})



const router = createRouter({
  routeTree,
  basepath: import.meta.env.VITE_APP_BASE_URL,
})
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <NiceModal.Provider>
          <ReactQueryDevtools />
          <RouterProvider router={router} />
        </NiceModal.Provider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
)
