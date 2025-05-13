import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";
import NiceModal, { NiceModalHocProps } from "../NiceModal/NiceModal";

export default NiceModal.create<{
    title?: string;
    description?: string;
} & NiceModalHocProps>(
    (props) => {
        const modal = NiceModal.useModal();
        const title = props.title || "Delete Confirm";
        const description = props.description || "Are you sure you want to delete this record?";
        return (
            <Dialog.Root role="alertdialog" size={"sm"} open={modal.visible}>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title>{title}</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                {description}
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" size={"xs"}>Cancel</Button>
                                </Dialog.ActionTrigger>
                                <Button colorPalette="red" size={"xs"}>Delete</Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="xs" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        );
    }
);