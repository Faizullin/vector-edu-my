import { Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";

type ValueType = string | number | undefined | null;

function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 200,
    ...props
}: {
    value: ValueType;
    onChange: (value: ValueType) => void;
    debounce?: number;
} & Record<string, any>) {
    const [currentDebouncedValue, setCurrentDebouncedValue] = useState<ValueType>(initialValue || "");
    const [value, setValue] = useState<ValueType>(initialValue || "");

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (currentDebouncedValue !== value) {
                setCurrentDebouncedValue(value);
                onChange(value);
            }
        }, debounce);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, currentDebouncedValue]);

    return (
        <Input
            size={"sm"}
            value={value ?? ""}
            onChange={(e) => {
                if (e.target.value === "") return setValue("");
                if (props.type === "number") {
                    setValue(e.target.valueAsNumber);
                } else {
                    setValue(e.target.value);
                }
            }}
            {...props}
        />
    );
}

export default DebouncedInput;