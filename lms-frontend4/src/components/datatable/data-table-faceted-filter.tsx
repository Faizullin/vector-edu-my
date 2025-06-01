/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { simpleRequest } from "@/lib/simpleRequest";
import { cn } from "@/lib/utils";
import type { MyColumnMeta } from "@/types";
import { useQuery } from "@tanstack/react-query";
import type { Column } from "@tanstack/react-table";
import { CheckIcon, PlusCircleIcon, SearchIcon, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "../ui/input";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const filter = (column?.columnDef.meta as MyColumnMeta)!.filter!;

  // ✅ Track filter value in local state for proper re-renders
  const [filterValue, setFilterValue] = useState<any>(column?.getFilterValue());

  // ✅ Sync local state with column filter value
  useEffect(() => {
    const currentValue = column?.getFilterValue();
    if (currentValue !== filterValue) {
      setFilterValue(currentValue);
    }
  }, [column, filterValue]);

  // ✅ Update both local state and column filter
  const updateFilter = useCallback(
    (value: any) => {
      setFilterValue(value);
      column?.setFilterValue(value);
    },
    [column]
  );

  if (filter.type === "select") {
    const renderMode = filter.renderMode || "select";

    const optionsQuery = useQuery({
      queryKey: filter.query?.key || [],
      queryFn: () =>
        simpleRequest({
          url: filter.query!.fetchOptionsUrl,
          method: "GET",
          params: {
            disablePagination: `${true}`,
          },
        }),
      enabled: !!filter.query,
    });

    // ✅ Memoize options to prevent unnecessary re-renders
    const options = useMemo(() => {
      if (filter.query) {
        return filter.query.transformResponse(optionsQuery.data || []);
      }
      return filter.options || [];
    }, [optionsQuery.data, filter.query, filter.options]);

    // ✅ Simple Select Mode with proper state management
    if (renderMode === "select") {
      const currentValue = filterValue as string;
      const selectedOption = options.find(
        (option) => option.value === currentValue
      );

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const handleValueChange = useCallback(
        (value: string) => {
          const newValue = value === "" ? undefined : value;
          updateFilter(newValue);
        },
        [updateFilter]
      );

      const handleClear = useCallback(() => {
        updateFilter(undefined);
      }, [updateFilter]);

      return (
        <div className="flex items-center gap-2">
          <Select value={currentValue || ""} onValueChange={handleValueChange}>
            <SelectTrigger className="h-8 w-[180px] border-dashed">
              <div className="flex items-center gap-2">
                <PlusCircleIcon className="h-4 w-4" />
                <SelectValue placeholder={title}>
                  {selectedOption?.label || title}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({facets.get(option.value)})
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear button */}
          {currentValue && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    }

    // ✅ Checkbox Mode with proper state management
    if (renderMode === "checkbox") {
      const selectedValues = useMemo(() => {
        const values = filterValue as string[] | undefined;
        return new Set(values || []);
      }, [filterValue]);

      const handleItemSelect = useCallback(
        (optionValue: string) => {
          const newSelectedValues = new Set(selectedValues);

          if (newSelectedValues.has(optionValue)) {
            newSelectedValues.delete(optionValue);
          } else {
            newSelectedValues.add(optionValue);
          }

          const filterValues = Array.from(newSelectedValues);
          updateFilter(filterValues.length ? filterValues : undefined);
        },
        [selectedValues, updateFilter]
      );

      const handleClearAll = useCallback(() => {
        updateFilter(undefined);
      }, [updateFilter]);

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-dashed">
              <PlusCircleIcon className="h-4 w-4" />
              {title}
              {selectedValues.size > 0 && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal lg:hidden"
                  >
                    {selectedValues.size}
                  </Badge>
                  <div className="hidden space-x-1 lg:flex">
                    {selectedValues.size > 2 ? (
                      <Badge
                        variant="secondary"
                        className="rounded-sm px-1 font-normal"
                      >
                        {selectedValues.size} selected
                      </Badge>
                    ) : (
                      options
                        .filter((option) => selectedValues.has(option.value))
                        .map((option) => (
                          <Badge
                            key={option.value}
                            variant="secondary"
                            className="rounded-sm px-1 font-normal"
                          >
                            {option.label}
                          </Badge>
                        ))
                    )}
                  </div>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder={title} />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = selectedValues.has(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() => handleItemSelect(option.value)}
                      >
                        <div
                          className={cn(
                            "border-primary flex h-4 w-4 items-center justify-center rounded-sm border",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible"
                          )}
                        >
                          <CheckIcon className="h-4 w-4" />
                        </div>
                        <span>{option.label}</span>
                        {facets?.get(option.value) && (
                          <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                            {facets.get(option.value)}
                          </span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                {selectedValues.size > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={handleClearAll}
                        className="justify-center text-center"
                      >
                        Clear filters
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      );
    }
  }

  // ✅ Text filter mode with proper state management
  else if (filter.type === "text") {
    const [input, setInput] = useState("");
    const currentValue = filterValue as string;

    // ✅ Sync input with filter value
    useEffect(() => {
      if (currentValue !== input) {
        setInput(currentValue || "");
      }
    }, [currentValue]);

    const debounced = useDebouncedCallback((value: string) => {
      updateFilter(value || undefined);
    }, 500);

    useEffect(() => {
      debounced(input);
    }, [input, debounced]);

    const handleClear = useCallback(() => {
      setInput("");
      updateFilter(undefined);
    }, [updateFilter]);

    return (
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-dashed">
              <SearchIcon className="h-4 w-4" />
              {title}
              {currentValue && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    "{currentValue}"
                  </Badge>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Input
              placeholder={`Filter ${title?.toLowerCase()}...`}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="h-8 w-full border-0 focus-visible:ring-0"
              autoFocus
            />
          </PopoverContent>
        </Popover>

        {/* Clear button for text mode */}
        {currentValue && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return null;
}
