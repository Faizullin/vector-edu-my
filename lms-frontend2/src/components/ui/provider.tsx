"use client"

import { systemTheme } from "@/theme/theme"
import { ChakraProvider } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={systemTheme}>
      <ColorModeProvider {...props} />
      {/* <Toaster /> */}
    </ChakraProvider>
  )
}
