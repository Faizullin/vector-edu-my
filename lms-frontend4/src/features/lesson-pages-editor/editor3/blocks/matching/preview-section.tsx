import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useMatchingQuestions } from "./context";

export function PreviewSection() {
  const { matchingComponent, elements, isCoupled, setActiveSection } =
    useMatchingQuestions();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Question Preview</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveSection("elements")}
          type="button"
        >
          Back to Editing
        </Button>
      </div>

      <Card>
        <CardContent className="p-2">
          <div className="mb-6">
            <h3 className="text-md font-bold mb-2">
              {matchingComponent.title || "Untitled Question"}
            </h3>
          </div>

          <div className="border rounded-lg p-4 bg-slate-50 mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-500">
              Matching Matrix
            </h4>
            {elements.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-slate-100"></th>
                      {elements.map((element) => (
                        <th
                          key={element.uid}
                          className="border p-2 bg-slate-100 min-w-[120px]"
                        >
                          {element.text || (
                            <span className="text-slate-400">
                              Element {element.uid.replace("elem", "")}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {elements.map((rowElement) => (
                      <tr key={rowElement.uid}>
                        <td className="border p-2 bg-slate-100 font-medium">
                          {rowElement.text || (
                            <span className="text-slate-400">
                              Element {rowElement.uid.replace("elem", "")}
                            </span>
                          )}
                        </td>
                        {elements.map((colElement) => (
                          <td
                            key={colElement.uid}
                            className="border p-2 text-center"
                          >
                            {isCoupled(rowElement.uid, colElement.uid) ? (
                              <div className="flex justify-center">
                                <div className="bg-green-100 text-green-700 rounded-full p-1">
                                  <Check className="h-4 w-4" />
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">
                No elements created yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
