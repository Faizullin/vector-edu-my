import { LessonPageDocument } from "@/client/types.gen";
import NiceModal, { NiceModalHocProps } from "@/components/NiceModal/NiceModal";
import { Button } from "@/components/ui/button";
import { Code, Dialog, Portal } from "@chakra-ui/react";
import { useRef } from "react";


export default NiceModal.create((props: {
    lesson_page_data: LessonPageDocument;
} & NiceModalHocProps) => {
    const ref = useRef<HTMLInputElement>(null)
    const modal = NiceModal.useModal();
    return (
        <Dialog.Root initialFocusEl={() => ref.current} open={modal.visible}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Lesson #{props.lesson_page_data?.id}</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body pb="4">
                            <Code lang="json">
                                {JSON.stringify(props.lesson_page_data, null, 2)}
                            </Code>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline" size={"xs"} onClick={modal.hide}>Cancel</Button>
                            </Dialog.ActionTrigger>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
})