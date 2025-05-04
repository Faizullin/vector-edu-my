import { simpleRequest } from "@/client/core/simpleRequest";
import { PaginatedData } from "@/client/types.gen";
import debounce from "@/utils/debounce";
import { AsyncSelect } from "chakra-react-select";
import {
    ComponentProps,
    forwardRef,
    Ref,
    RefAttributes,
    useCallback,
} from "react";

interface ItemValue {
    label: string;
    value: string;
}

interface Props<T> {
    isMulti?: boolean;
    parseParams?: (value: string) => Record<string, any>;
    url: string;
    parseResponse: (response: PaginatedData<T>) => ItemValue[];
    value?: ItemValue[];
    onChange: (value: ComponentProps<typeof AsyncSelect>["onChange"]) => void;
}
// ---cut---
function fixedForwardRef<T, P = {}>(
    render: (props: P, ref: Ref<T>) => React.ReactNode
): (props: P & RefAttributes<T>) => React.ReactNode {
    return forwardRef(render as any) as any;
}

// Use forwardRef here
const MultiselectLinkInputComp = <T,>(
    props: Props<T>,
    ref: React.Ref<any> // You can type this more strictly if needed
) => {
    const fetchOptions = useCallback((inputValue: string) => {
        const parseParams = props.parseParams || ((value) => ({
            search: value,
        }));
        return simpleRequest<PaginatedData<T>>({
            method: "GET",
            url: props.url,
            query: parseParams(inputValue),
        });
    }, [props.parseParams, props.url]);

    const loadOptionsDebounced = useCallback(
        debounce((inputValue: string, callback: (options: any) => void) => {
            fetchOptions(inputValue).then((response) => {
                const parsedResponse = props.parseResponse(response);
                callback(parsedResponse);
            });
        }, 500),
        []
    );

    const selectedValue = props.value || [];

    return (
        <AsyncSelect
            ref={ref}
            isMulti={props.isMulti}
            placeholder="Select"
            onChange={(newValue) => {
                props.onChange(newValue as any);
            }}
            loadOptions={loadOptionsDebounced}
            value={selectedValue}
        />
    );
};

const MultiselectLinkInput = fixedForwardRef(MultiselectLinkInputComp);

export default MultiselectLinkInput;
