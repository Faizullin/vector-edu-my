import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import type { Table } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";

interface GlobalSearchFieldProps<TData> {
  table: Table<TData>;
}
export const GlobalSearchField = <TData,>({
  table,
}: GlobalSearchFieldProps<TData>) => {
  const [input, setInput] = useState("");

  const debounced = useDebouncedCallback((value: string) => {
    table.setGlobalFilter(value);
  }, 1000);

  useEffect(() => {
    debounced(input);
  }, [input, debounced]);

  return (
    <Input
      placeholder="Search..."
      value={input}
      onChange={(event) => setInput(event.target.value)}
      className="h-8 w-[150px] lg:w-[250px]"
    />
  );
};
