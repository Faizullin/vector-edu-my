import MultiselectLinkInput from "@/components/form/MultiselectLinkInput";
import NiceModal, { NiceModalHocProps } from "@/components/NiceModal/NiceModal";
import { Button } from "@/components/ui/button";
import { Dialog, Portal, Stack } from "@chakra-ui/react";
import { ComponentProps, useCallback, useRef, useState } from "react";
import { EditorApiService } from "../EditorApiService";


export default NiceModal.create((props: {
    title: string;
    type: string;
    parseResponse: ComponentProps<typeof MultiselectLinkInput>["parseResponse"];
} & NiceModalHocProps) => {
    const ref = useRef<HTMLInputElement>(null)
    const modal = NiceModal.useModal();
    const [value, setValue] = useState<any | null>(null);
    const handleSave = useCallback(() => {
        if (value) {
            EditorApiService.fetchComponentDetail<any>(props.type, value.value).then((response) => {
                modal.resolve({
                    modal,
                    result: {
                        record: response,
                    }
                })
            })
        }
    }, [modal, value])
    return (
        <Dialog.Root initialFocusEl={() => ref.current} open={modal.visible}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>{props.title}</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body pb="4">
                            <Stack>
                                <MultiselectLinkInput
                                    ref={ref}
                                    isMulti={false}
                                    url={`/resources/component/${props.type}`}
                                    parseResponse={props.parseResponse}
                                    value={value}
                                    onChange={(newValue) => {
                                        setValue(newValue)
                                    }}
                                />
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline" onClick={modal.hide}>Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Button onClick={handleSave}>Save</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
})