import { AuthUser } from "@/client/types.gen"
import { IconButton } from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu"

interface UserActionsMenuProps {
  user: AuthUser
  disabled?: boolean
}

export const UserActionsMenu = ({ disabled }: UserActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" color="inherit" disabled={disabled}>
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        {/* <EditUser user={user} />
        <DeleteUser id={user.id} /> */}
      </MenuContent>
    </MenuRoot>
  )
}
