import NiceModal, { NiceModalHocProps } from "@/components/NiceModal/NiceModal";
import { Button } from "@/components/ui/button";
import { Log } from "@/utils/log";
import { Block } from "@blocknote/core";
import {
    Alert,
    Badge,
    Box,
    Code,
    Dialog,
    Portal,
    Text,
    VStack,
} from "@chakra-ui/react";
import { useEffect } from "react";

type DataField<T = Record<string, any>> = {
    obj?: T;
    values?: Partial<T>
    staticNotEditable?: boolean;
};

type BlockWithData<T = Record<string, any>> = Omit<Block, "props"> & {
    props?: {
        data?: DataField<T>;
    };
};

type ViewDataNiceDialogProps = {
    content: BlockWithData[];
} & NiceModalHocProps;

const ViewDataNiceDialog = NiceModal.create((props: ViewDataNiceDialogProps) => {
    const modal = NiceModal.useModal();

    useEffect(() => {
        Log.info("ViewDataNiceDialog: content => ", props.content);
    }, [props.content]);

    const blocks = props.content ?? [];

    return (
        <Dialog.Root open={modal.visible} scrollBehavior="inside" onOpenChange={modal.hide}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Body pb="4">
                            <VStack spaceY={4} align="stretch">
                                {blocks.map((block) => {
                                    const dataField: DataField | undefined = block?.props?.data;
                                    const obj = dataField?.obj;
                                    const values = dataField?.values;

                                    const renderDataContent = () => {
                                        if (obj && values) {
                                            return (
                                                <>
                                                    <Box bg="blue.50" p={3} rounded="md" mb={3}>
                                                        <Text fontSize="sm" fontWeight="bold" mb={1}>
                                                            Object Data:
                                                        </Text>
                                                        <Code
                                                            display="block"
                                                            whiteSpace="pre-wrap"
                                                            colorScheme="blue"
                                                            fontSize="xs"
                                                        >
                                                            {JSON.stringify(obj, null, 2)}
                                                        </Code>
                                                        {dataField.staticNotEditable && (
                                                            <Badge size="xs" colorPalette="blue">
                                                                static and not editable
                                                            </Badge>
                                                        )}
                                                    </Box>
                                                    <Box bg="green.50" p={3} rounded="md">
                                                        <Text fontSize="sm" fontWeight="bold" mb={1}>
                                                            Values:
                                                        </Text>
                                                        <VStack align="start" spaceX={1} spaceY={1}>
                                                            {JSON.stringify(values, null, 2)}
                                                        </VStack>
                                                    </Box>
                                                </>
                                            );
                                        } else if (obj) {
                                            return (
                                                <Box bg="blue.50" p={3} rounded="md">
                                                    <Text fontSize="sm" fontWeight="bold" mb={1}>
                                                        Object Data:
                                                    </Text>
                                                    <Code
                                                        display="block"
                                                        whiteSpace="pre-wrap"
                                                        colorScheme="blue"
                                                        fontSize="xs"
                                                    >
                                                        {JSON.stringify(obj, null, 2)}
                                                    </Code>
                                                    {dataField.staticNotEditable && (
                                                        <Badge size="xs" colorPalette="blue">
                                                            static and not editable
                                                        </Badge>
                                                    )}
                                                </Box>
                                            );
                                        } else if (values) {
                                            return (
                                                <Box bg="green.50" p={3} rounded="md">
                                                    <Text fontSize="sm" fontWeight="bold" mb={1}>
                                                        Values:
                                                    </Text>
                                                    <VStack align="start" spaceX={1} spaceY={1}>
                                                        {JSON.stringify(values, null, 2)}
                                                    </VStack>
                                                </Box>
                                            );
                                        }
                                        return (
                                            <Alert.Root status="error" size="sm">
                                                <Alert.Indicator />
                                                <Alert.Content>
                                                    <Alert.Title>
                                                        No valid `obj` or `values` in data field.
                                                    </Alert.Title>
                                                </Alert.Content>
                                            </Alert.Root>
                                        );
                                    };

                                    const isDataBlock = !!block?.props?.data;

                                    return (
                                        <Box
                                            key={block.id}
                                            p={4}
                                            border="1px solid"
                                            borderColor="gray.200"
                                            bg={isDataBlock ? "gray.100" : "gray.50"}
                                            borderRadius="md"
                                        >
                                            <Text fontSize="sm" mb={2} color="gray.700">
                                                Block Type: {block.type} | ID: {block.id}
                                            </Text>
                                            {isDataBlock && renderDataContent()}
                                        </Box>
                                    );
                                })}
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline" size="xs" onClick={modal.hide}>
                                    Cancel
                                </Button>
                            </Dialog.ActionTrigger>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
});

export default ViewDataNiceDialog;
