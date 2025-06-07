import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Link2, PlusCircle, Search, Trash2 } from "lucide-react";
import { useMatchingQuestions } from "./context";

export function ElementsList() {
  const {
    elements,
    searchQuery,
    editingElementId,
    setSearchQuery,
    setEditingElementId,
    addElement,
    removeElement,
    getCoupleCount,
  } = useMatchingQuestions();

  // Filter elements based on search query
  const filteredElements = elements.filter((element) =>
    element.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="border rounded-lg bg-slate-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-md font-medium">All Elements</h2>
        <Button variant="outline" size="sm" type="button" onClick={addElement}>
          <PlusCircle className="h-4 w-4" />
          New Element
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search elements..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="space-y-2">
          {filteredElements.length > 0 ? (
            filteredElements.map((element) => (
              <div
                key={element.uid}
                className={cn(
                  "p-3 border rounded-md cursor-pointer transition-all",
                  editingElementId === element.uid
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/50"
                )}
                onClick={() => setEditingElementId(element.uid)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {element.image && (
                      <div className="h-10 w-10 border rounded overflow-hidden flex-shrink-0">
                        <img
                          src={element.image.url || "/placeholder.svg"}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {element.text || (
                          <span className="text-gray-400">
                            Untitled Element
                          </span>
                        )}
                      </p>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="text-xs">
                          ID: {element.uid.replace("elem", "")}
                        </Badge>
                        {getCoupleCount(element.uid) > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            <Link2 className="h-3 w-3 mr-1" />
                            {getCoupleCount(element.uid)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeElement(element.uid);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchQuery
                ? "No elements match your search"
                : "No elements created yet"}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
