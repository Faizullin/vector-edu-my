import { Box, Flex } from "@chakra-ui/react"
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import Navbar from "@/components/Common/Navbar"
import Sidebar from "@/components/Common/Sidebar"
import { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      })
    }
  },
})

function Layout() {
  return (
    <Flex h="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
      <Sidebar />
      <Flex direction="column" flex={1} overflow="hidden">
        <Navbar />
        <Box as="main" p={6} overflowY="auto" flex={1}>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  )
}

export default Layout
