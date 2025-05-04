import { simpleRequest } from "@/client/core/simpleRequest";
import { FilterChangeFn, ItemsFieldFiltersState } from "@/client/types.gen";
import debounce from "@/utils/debounce";
import { createListCollection, Select } from "@chakra-ui/react";
import { ColumnMeta } from "@tanstack/react-table";
import { AsyncSelect } from "chakra-react-select";
import { useCallback, useMemo } from "react";
import DebouncedInput from "../form/DebouncedInput";

function SimpleSelect<T>({
    filterData,
    filters,
    onFilterChange,
}: {
    filterData: ColumnMeta<T, unknown>["filter"];
    filters: ItemsFieldFiltersState;
    onFilterChange: FilterChangeFn<T>;
}) {
    const frameworks = useMemo(() => {
        return createListCollection({
            items: filterData!.selectOptions!,
        });
    }, [filterData,]);
    return (
        <Select.Root
            collection={frameworks}
            defaultValue={filters[filterData!.key as string]}
            onValueChange={(value) => {
                onFilterChange({
                    [filterData!.key]: value.value[0],
                } as Partial<T>);
            }}
            size="sm">
            <Select.HiddenSelect />
            <Select.Label>Publication</Select.Label>
            <Select.Control>
                <Select.Trigger>
                    <Select.ValueText placeholder="Select" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                    <Select.ClearTrigger />
                    <Select.Indicator />
                </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
                <Select.Content>
                    {frameworks.items.map((framework) => (
                        <Select.Item item={framework} key={framework.value}>
                            {framework.label}
                            <Select.ItemIndicator />
                        </Select.Item>
                    ))}
                </Select.Content>
            </Select.Positioner>
        </Select.Root>
    )
}


export function FilterField<T>({
    variant,
    onFilterChange,
    fieldMeta,
    filters,
}: {
    variant: "text" | "number" | "select";
    onFilterChange: FilterChangeFn<T>;
    fieldMeta: ColumnMeta<T, unknown>;
    filters: ItemsFieldFiltersState;
}) {
    const filterData = fieldMeta.filter;
    if (!filterData) {
        return null
    } else if (variant === "text") {
        return (
            <DebouncedInput
                onChange={(value) => {
                    onFilterChange({
                        [filterData?.key]: value,
                    } as Partial<T>);
                }}
                placeholder="Search..."
                type={variant}
                value={String(filters[filterData.key as string] || "")}
            />
        )
    } else if (variant === "select") {
        if (!filterData) {
            throw new Error("Filter in meta is required for select filter type")
        }
        if (!filterData.selectSearchApi) {
            if (!filterData.selectOptions) {
                throw new Error("Select options are required for select filter type")
            }
            return (<SimpleSelect<T> filterData={filterData} filters={filters} onFilterChange={onFilterChange} />)
        }
        const fetchOptions = (inputValue: string) => {
            const parseParams = filterData.selectSearchApi?.parseParams || ((value) => ({
                search: value,
            }));
            return simpleRequest({
                method: "GET",
                url: filterData.selectSearchApi!.url,
                query: parseParams(inputValue),
            })
        }
        const loadOptionsDebounced = useCallback(
            debounce((inputValue: string, callback: (options: any) => void) => {
                fetchOptions(inputValue).then((response) => {
                    const parsedResponse = filterData.selectSearchApi!.parseResponse!(response);
                    callback(parsedResponse);
                })
            }, 500),
            []
        );
        const selectedValue = filters[filterData.key as string] || []
        return (
            <AsyncSelect
                isMulti
                placeholder="Select"
                // components={asyncComponents}
                onChange={(value) => {
                    onFilterChange({
                        [filterData.key]: value?.map((item: any) => item),
                    } as Partial<T>);
                }}
                loadOptions={loadOptionsDebounced}
                value={selectedValue}
            />
        )
    }
}

