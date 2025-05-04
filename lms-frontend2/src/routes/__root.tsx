import { Outlet, createRootRoute } from "@tanstack/react-router"
import React, { Suspense } from "react"


// import NotFound from "@/components/Common/NotFound"
const NotFound = () => {
    return <div>Not Found</div>
}

const loadDevtools = () =>
    Promise.all([
        import("@tanstack/router-devtools"),
        import("@tanstack/react-query-devtools"),
    ]).then(([routerDevtools, reactQueryDevtools]) => {
        return {
            default: () => (
                <>
                    <routerDevtools.TanStackRouterDevtools />
                    <reactQueryDevtools.ReactQueryDevtools />
                </>
            ),
        }
    })

const TanStackDevtools = import.meta.env.DEV
    ? React.lazy(loadDevtools) : () => <></>;


export const Route = createRootRoute({
    component: () => (
        <>
            <Outlet />
            <Suspense>
                <TanStackDevtools />
            </Suspense>
        </>
    ),
    notFoundComponent: () => <NotFound />,
})
