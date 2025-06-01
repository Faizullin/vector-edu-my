"use client";

import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { useState } from "react";

// /**
//  * Logs any errors encountered by queries or mutations.
//  * @param error - The error object from a query or mutation
//  */
// const handleApiError = (error: any) => {
//   Log.error("queryClient:", error);
// };

// const queryClient = new QueryClient({
//   queryCache: new QueryCache({
//     onError: handleApiError,
//   }),
//   mutationCache: new MutationCache({
//     onError: handleApiError,
//   }),
// });

/**
 * Provides the Tanstack Query Client to the application.
 * This component wraps the children with the QueryClientProvider
 * and includes React Query Devtools in development mode.
 *
 * @param {Object} props - The component props
 * @param {React.ReactNode} props.children - The child components to render
 * @returns {JSX.Element} The QueryClientProvider with children and devtools
 * @example
 * <TanstackProvider>
 *   <YourComponent />
 * </TanstackProvider>
 */
export const TanstackContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
};
