// "use client";

import NextTopLoader from "nextjs-toploader";

/**
 *
 * @returns A component that displays a loading bar during navigation.
 * This component uses the `react-top-loading-bar` library to show a progress bar
 * at the top of the page when navigating between routes in a Next.js application.
 * It listens to route change events from the Next.js router and starts or completes
 * the loading bar accordingly.
 */
export function NavigationProgress() {
  return (
    // <LoadingBar
    //   color="var(--muted-foreground)"
    //   ref={ref}
    //   shadow={true}
    //   height={2}
    // />
    <>
      <NextTopLoader
        color="#2299DD"
        initialPosition={0.08}
        crawlSpeed={200}
        height={3}
        crawl={true}
        showSpinner={true}
        easing="ease"
        speed={200}
        shadow="0 0 10px #2299DD,0 0 5px #2299DD"
      />
    </>
  );
}
