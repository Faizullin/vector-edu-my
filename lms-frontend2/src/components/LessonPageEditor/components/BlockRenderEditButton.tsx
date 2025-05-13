import { Box } from "@chakra-ui/react"
import { FiEdit2 } from "react-icons/fi"


interface BlockRenderEditButtonProps {
    onClick: () => void
    staticNotEditable?: boolean
}
const BlockRenderEditButton = (props: BlockRenderEditButtonProps) => {
    return (
        <Box
            position="absolute"
            top="0"
            right="0"
            bg="blackAlpha.700"
            p="2"
            m="2"
            borderRadius="md"
            cursor="pointer"
            onClick={props.onClick}
            _hover={{ bg: props.staticNotEditable ? "blackAlpha.500" : "blackAlpha.800" }}
        >
            <FiEdit2 size={16} color="white" />
        </Box>
    )
}
export default BlockRenderEditButton