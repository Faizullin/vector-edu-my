import { simpleRequest } from "@/lib/simpleRequest";
import type { FieldItem, PaginatedData } from "@/types";
import debounce from "@/utils/debounce";
import { useCallback, type ComponentProps } from "react";
import AsyncSelect from "react-select/async";

interface MultiselectLinkInputFieldProps<T> {
  isMulti?: boolean;
  parseParams?: (value: string) => Record<string, any>;
  url: string;
  parseResponse: (response: PaginatedData<T>) => FieldItem[];
  value?: FieldItem[];
  onChange: (value: ComponentProps<typeof AsyncSelect>["onChange"]) => void;
}
export const MultiselectLinkInputField = <T,>(
  props: MultiselectLinkInputFieldProps<T>
) => {
  const fetchOptions = useCallback(
    (inputValue: string) => {
      const parseParams =
        props.parseParams ||
        ((value) => ({
          search: value,
        }));
      return simpleRequest<PaginatedData<T>>({
        method: "GET",
        url: props.url,
        params: parseParams(inputValue),
      });
    },
    [props.parseParams, props.url]
  );
  const loadOptionsDebounced = useCallback(
    debounce((inputValue: string, callback: (options: any) => void) => {
      fetchOptions(inputValue).then((response) => {
        const parsedResponse = props.parseResponse(response!);
        callback(parsedResponse);
      });
    }, 500),
    []
  );
  const selectedValue = props.value || [];

  return (
    <>
      <AsyncSelect
        isMulti={props.isMulti}
        cacheOptions
        defaultOptions
        loadOptions={loadOptionsDebounced}
        value={selectedValue}
        placeholder="Select"
        onChange={(newValue) => {
          props.onChange(newValue as any);
        }}
        classNamePrefix="react-select"
        styles={{
          control: (base) => ({ ...base, minHeight: "38px" }),
          menu: (base) => ({ ...base, zIndex: 9999 }),
        }}
      />
    </>
  );
};
