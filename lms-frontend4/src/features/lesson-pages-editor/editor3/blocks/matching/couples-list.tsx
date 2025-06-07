import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Edit, Link2, Plus, PlusCircle, X } from "lucide-react";
import { useMemo } from "react";
import { getTruncatedText } from "../../utils";
import { useMatchingQuestions } from "./context";

export function CouplesList() {
  const {
    matchingComponent,
    elements,
    activeCoupleTab,
    setActiveCoupleTab,
    addCouple,
    removeCouple,
    updateCouple,
    setActiveSection,
    setEditingElementId,
  } = useMatchingQuestions();

  if (matchingComponent.couples.length === 0) {
    return (
      <div className="text-center py-4 border border-dashed rounded-lg">
        <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <Link2 className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Couples Created</h3>
        <p className="text-gray-500 mb-4">
          Create couples to connect elements together.
        </p>
        <Button onClick={addCouple}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create First Couple
        </Button>
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const tabs = useMemo(() => {
    return matchingComponent.couples.map((couple) => {
      const firstElement = matchingComponent.elements.find(
        (el) => el.uid === couple.first_element
      );
      const secondElement = matchingComponent.elements.find(
        (el) => el.uid === couple.second_element
      );
      // if (!firstElement || !secondElement) {
      //   throw new Error(
      //     `Couple ${couple.trackUid} has invalid elements. Please check the data.`
      //   );
      // }
      return {
        value: couple.trackUid,
        label: `${getTruncatedText(
          firstElement?.text || "None",
          14
        )} - ${getTruncatedText(secondElement?.text || "None", 14)}`,
      };
    });
  }, [matchingComponent.couples, matchingComponent.elements]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-md font-medium">Manage Couples</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={addCouple}
          className="flex items-center gap-1"
          type="button"
        >
          <PlusCircle className="h-4 w-4" />
          New Couple
        </Button>
      </div>

      <Tabs
        value={activeCoupleTab || matchingComponent.couples[0].trackUid}
        onValueChange={setActiveCoupleTab}
        className="w-full"
        // style={{
        //   flex: "0 0 auto !important",
        //   width: "auto !important",
        //   maxWidth: "none !important",
        // }}
      >
        <TabsList className="flex flex-wrap h-auto py-1 gap-1 justify-start">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={`my-1 inline-flex items-center gap-2 px-3 flex-shrink-0 grow-0 w-auto ${tab.value === activeCoupleTab ? "" : "cursor-pointer"}`}
            >
              <span>{tab.label}</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  removeCouple(tab.value);
                }}
                className="ml-1 rounded-full p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-label={`Remove ${tab.label} tab`}
              >
                <X className="h-3 w-3" />
              </span>
            </TabsTrigger>
          ))}

          {/* Add new tab button - now inside the TabsList */}
          <button
            onClick={addCouple}
            className="my-1 flex-shrink-0 p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Add new tab"
            type="button"
          >
            <Plus className="h-4 w-4" />
          </button>
        </TabsList>

        {matchingComponent.couples.map((couple) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const { firstElement, secondElement } = useMemo(() => {
            return {
              firstElement: matchingComponent.elements.find(
                (el) => el.uid === couple.first_element
              ),
              secondElement: matchingComponent.elements.find(
                (el) => el.uid === couple.second_element
              ),
            };
          }, [matchingComponent.elements, couple]);
          if (!firstElement || !secondElement) {
            return "Something wen wrong. Please check the data.";
          }
          return (
            <TabsContent key={couple.trackUid} value={couple.trackUid}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                    <div className="flex-1 space-y-2">
                      <label className="block text-sm font-medium">
                        First Element:
                      </label>
                      <Select
                        value={couple.first_element}
                        onValueChange={(value) =>
                          updateCouple(couple.trackUid, "first_element", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an element" />
                        </SelectTrigger>
                        <SelectContent>
                          {elements.map((element) => (
                            <SelectItem key={element.uid} value={element.uid}>
                              {element.text ||
                                `Element ${element.uid.replace("elem", "")}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <ArrowRight className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="block text-sm font-medium">
                        Second Element:
                      </label>
                      <Select
                        value={couple.second_element}
                        onValueChange={(value) =>
                          updateCouple(couple.trackUid, "second_element", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an element" />
                        </SelectTrigger>
                        <SelectContent>
                          {elements.map((element) => (
                            <SelectItem key={element.uid} value={element.uid}>
                              {element.text ||
                                `Element ${element.uid.replace("elem", "")}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* First Element Preview */}
                    <div className="border rounded-lg p-4 bg-slate-50">
                      <h3 className="text-sm font-medium mb-3 text-gray-500">
                        First Element Preview
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          {firstElement.image && (
                            <div className="h-16 w-16 border rounded overflow-hidden flex-shrink-0">
                              <img
                                src={
                                  firstElement.image.url || "/placeholder.svg"
                                }
                                alt="Element preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium">
                              {firstElement.text || (
                                <span className="text-gray-400">
                                  No text content
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              ID: {couple.first_element.replace("elem", "")}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setActiveSection("elements");
                            setEditingElementId(couple.first_element);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-2" />
                          Edit This Element
                        </Button>
                      </div>
                    </div>

                    {/* Second Element Preview */}
                    <div className="border rounded-lg p-4 bg-slate-50">
                      <h3 className="text-sm font-medium mb-3 text-gray-500">
                        Second Element Preview
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          {secondElement.image && (
                            <div className="h-16 w-16 border rounded overflow-hidden flex-shrink-0">
                              <img
                                src={
                                  secondElement.image.url || "/placeholder.svg"
                                }
                                alt="Element preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium">
                              {secondElement.text || (
                                <span className="text-gray-400">
                                  No text content
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              ID: {couple.second_element.replace("elem", "")}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setActiveSection("elements");
                            setEditingElementId(couple.second_element);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-2" />
                          Edit This Element
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Self-connection note */}
                  {couple.first_element === couple.second_element && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm flex items-start">
                      <div className="mr-2 mt-0.5">
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Self-Connection</p>
                        <p className="mt-1">
                          You've connected an element to itself. This creates a
                          self-reference.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
