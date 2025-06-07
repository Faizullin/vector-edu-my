import { simpleRequest } from "@/lib/simpleRequest";
import type { FieldItem, PaginatedData } from "@/types";
import debounce from "@/utils/debounce";
import { useCallback, type ComponentProps } from "react";
import AsyncSelect from "react-select/async";

interface MultiselectLinkInputFieldProps<T> {
  isMulti?: boolean;
  parseParams?: (value: string) => Record<string, any>;
  url?: string;
  parseResponse: (response: PaginatedData<T>) => FieldItem[];
  value?: FieldItem[];
  onChange: (value: ComponentProps<typeof AsyncSelect>["onChange"]) => void;
  // New props for custom query function
  customQueryFn?: (inputValue: string) => Promise<PaginatedData<T>>;
  placeholder?: string;
  isDisabled?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  debounceMs?: number;
  className?: string;
  styles?: ComponentProps<typeof AsyncSelect>["styles"];
}

export const MultiselectLinkInputField = <T,>(
  props: MultiselectLinkInputFieldProps<T>
) => {
  const fetchOptions = useCallback(
    (inputValue: string) => {
      // Use custom query function if provided, otherwise use URL-based request
      if (props.customQueryFn) {
        return props.customQueryFn(inputValue);
      }

      if (!props.url) {
        throw new Error("Either 'url' or 'customQueryFn' must be provided");
      }

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
    [props.customQueryFn, props.parseParams, props.url]
  );

  const loadOptionsDebounced = useCallback(
    debounce(
      (inputValue: string, callback: (options: unknown) => void) => {
        fetchOptions(inputValue)
          .then((response) => {
            const parsedResponse = props.parseResponse(response!);
            callback(parsedResponse);
          })
          .catch((error) => {
            console.error("Error loading options:", error);
            callback([]);
          });
      },
      props.debounceMs ?? 500
    ),
    [fetchOptions, props.parseResponse, props.debounceMs]
  );

  const selectedValue = props.value || [];

  const defaultStyles = {
    control: (base: any) => ({ ...base, minHeight: "38px" }),
    menu: (base: any) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <AsyncSelect
      isMulti={props.isMulti}
      cacheOptions
      defaultOptions
      loadOptions={loadOptionsDebounced}
      value={selectedValue}
      placeholder={props.placeholder || "Select"}
      isDisabled={props.isDisabled}
      isClearable={props.isClearable}
      isSearchable={props.isSearchable ?? true}
      onChange={(newValue) => {
        props.onChange(newValue as any);
      }}
      classNamePrefix="react-select"
      className={props.className}
      styles={{
        control: (base) => ({ ...base, minHeight: "38px" }),
        menu: (base) => ({ ...base, zIndex: 9999 }),
      }}
    />
  );
};
