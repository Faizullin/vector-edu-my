import {
  Box,
  Drawer,
  DrawerBody,
  Flex,
  IconButton,
  Text,
  useDisclosure
} from "@chakra-ui/react";
import { FaBars } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import SidebarItems from "./SidebarItems";
import { useQueryClient } from "@tanstack/react-query";
import { AuthUser } from "@/client/types.gen";
import useAuth from "@/hooks/useAuth";
import { useColorModeValue } from "../ui/color-mode";

export default function Sidebar() {
  const { open, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<AuthUser>(["currentUser"]);
  const { logoutMutation } = useAuth();

  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.100", "gray.700");

  const handleLogout = () => logoutMutation.mutate();

  return (
    <>
      {/* Mobile hamburger */}
      <IconButton
        aria-label="Open menu"
        variant="ghost"
        position="fixed"
        top={4}
        left={4}
        zIndex={100}
        display={{ base: "inline-flex", md: "none" }}
        onClick={onOpen}
      >
        <FaBars />
      </IconButton>

      <Drawer.Root open={open} placement="start" onOpenChange={onOpen}>
        <Drawer.Backdrop />
        <Drawer.Content maxW="xs" bg={bg}>
          <Drawer.CloseTrigger />
          <DrawerBody p={0}>
            <Flex direction="column" h="full">
              <Box flex={1} p={4}>
                <SidebarItems onNavigate={onClose} />
                <Flex
                  as="button"
                  onClick={handleLogout}
                  align="center"
                  gap={3}
                  mt={6}
                  px={3}
                  py={2}
                  borderRadius="md"
                  _hover={{ bg: hoverBg }}
                >
                  <FiLogOut />
                  <Text>Log out</Text>
                </Flex>
              </Box>
              {currentUser?.email && (
                <Text fontSize="sm" p={4} truncate>
                  Logged in as {currentUser.email}
                </Text>
              )}
            </Flex>
          </DrawerBody>
        </Drawer.Content>
      </Drawer.Root>

      {/* Desktop */}
      <Box
        display={{ base: "none", md: "flex" }}
        flexDir="column"
        w={{ md: 60, lg: 72 }}
        h="100vh"
        bg={bg}
        borderRightWidth="1px"
        borderRightColor={border}
        p={4}
      >
        <SidebarItems />

        <Flex mt="auto" pt={4}>
          <Flex
            as="button"
            onClick={handleLogout}
            align="center"
            gap={3}
            px={3}
            py={2}
            borderRadius="md"
            _hover={{ bg: hoverBg }}
            w="full"
          >
            <FiLogOut />
            <Text>Log out</Text>
          </Flex>
        </Flex>

        {currentUser?.email && (
          <Text fontSize="sm" mt={4} truncate>
            Logged in as {currentUser.email}
          </Text>
        )}
      </Box>
    </>
  );
}