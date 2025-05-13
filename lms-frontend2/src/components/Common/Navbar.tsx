// import { Flex, Image, useBreakpointValue } from "@chakra-ui/react"
// import { Link } from "@tanstack/react-router"

// import Logo from "@/assets/react.svg"
// import UserMenu from "./UserMenu"

// function Navbar() {
//   const display = useBreakpointValue({ base: "none", md: "flex" })

//   return (
//     <Flex
//       display={display}
//       justify="space-between"
//       position="sticky"
//       color="white"
//       align="center"
//       bg="bg.muted"
//       w="100%"
//       top={0}
//       p={4}
//     >
//       <Link to="/">
//         <Image src={Logo} alt="Logo" maxW="3xs" p={2} />
//       </Link>
//       <Flex gap={2} alignItems="center">
//         <UserMenu />
//       </Flex>
//     </Flex>
//   )
// }

// export default Navbar
import {
  Flex,
  Heading,
  IconButton,
  Spacer,
} from "@chakra-ui/react";
import { FiMenu, FiMoon, FiSun } from "react-icons/fi";
import { useColorMode, useColorModeValue } from "../ui/color-mode";

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");

  // TODO: mobile sidebar toggle – integrate later
  return (
    <Flex
      as="header"
      w="full"
      align="center"
      px={4}
      py={2}
      bg={bg}
      borderBottomWidth="1px"
      borderBottomColor={border}
      gap={2}
    >
      <IconButton
        aria-label="Open menu"
        display={{ base: "inline-flex", lg: "none" }}
        variant="ghost"
        size="md"
      >
        <FiMenu />
      </IconButton>

      <Heading as="h1" fontSize="lg">
        Dashboard
      </Heading>

      <Spacer />

      <IconButton
        aria-label="Toggle color mode"
        variant="ghost"
        size="md"
        onClick={toggleColorMode}
      >
        {colorMode === "light" ? <FiMoon /> : <FiSun />}
      </IconButton>
    </Flex >
  );
}