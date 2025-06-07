import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronRight,
  Edit,
  ImageIcon,
  Link2,
  PlusCircle,
  X,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useMatchingQuestions } from "./context";
import { getElementFileKey } from "./utils";

const formSchema = z.object({
  text: z.string().min(1, "Text is required"),
  image: z.instanceof(File).optional().nullable(),
});

type ElementFormValues = z.infer<typeof formSchema>;

export function ElementEditor() {
  const {
    elements,
    editingElementId,
    updateElementText,
    handleFileChange,
    removeImage,
    triggerFileInput,
    fileInputRefs,
    getCoupleCount,
    getElementCouples,
    setActiveSection,
    setActiveCoupleTab,
    addElement,
  } = useMatchingQuestions();

  const editingElement = useMemo(() => {
    return editingElementId
      ? elements.find((e) => e.uid === editingElementId)
      : null;
  }, [editingElementId, elements]);

  const form = useForm<ElementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: editingElement?.text || "",
      image: null,
    },
  });

  const imageFile = form.watch("image");

  const onSubmit = (data: any) => {
    updateElementText(editingElement!.uid, data.text);
    if (data.image instanceof File) {
      const fakeEvent = {
        target: {
          files: [data.image],
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      handleFileChange(fakeEvent, editingElement!.uid);
    }
    form.setValue("image", null);
  };

  useEffect(() => {
    if (editingElement) {
      form.setValue("text", editingElement.text);
      form.setValue("image", null);
    }
  }, [editingElement]);

  const previewImageUrl = useMemo(() => {
    if (editingElement?.image) {
      return editingElement.image.url;
    }
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
    return "";
  }, [editingElement, imageFile]);
  if (!editingElement) {
    return (
      <div className="h-full flex items-center justify-center border border-dashed rounded-lg p-8 bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Edit className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Element Selected</h3>
          <p className="text-gray-500 mb-4">
            Select an element from the list to edit or create a new one.
          </p>
          <Button onClick={addElement} size={"sm"} type="button">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Element
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-medium">Edit Element</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              ID: {editingElement.uid.replace("elem", "")}
            </Badge>
            {getCoupleCount(editingElement.uid) > 0 && (
              <Badge variant="secondary">
                <Link2 className="h-3 w-3 mr-1" />
                {getCoupleCount(editingElement.uid)} couples
              </Badge>
            )}
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Element Text:
            </label>
            <Input
              {...form.register("text")}
              placeholder="Enter element text..."
            />
            {form.formState.errors.text && (
              <p className="text-sm text-red-500">
                {form.formState.errors.text.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image:</label>
            <Controller
              name="image"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id={getElementFileKey(editingElement)}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          field.onChange(file);
                        }
                      }}
                      ref={(el) =>
                        (fileInputRefs.current[
                          getElementFileKey(editingElement)
                        ] = el) as any
                      }
                    />
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        className="flex-1 justify-start"
                        onClick={() =>
                          triggerFileInput(getElementFileKey(editingElement))
                        }
                        size={"sm"}
                        type="button"
                      >
                        Choose File
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          triggerFileInput(getElementFileKey(editingElement))
                        }
                        size={"sm"}
                        type="button"
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  </div>

                  {previewImageUrl && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="cursor-pointer border rounded p-1 inline-block transition-all duration-200 hover:scale-105 hover:shadow-md">
                          <img
                            src={previewImageUrl}
                            alt="Preview thumbnail"
                            className="h-16 w-16 object-cover"
                          />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <div className="relative">
                          <img
                            src={previewImageUrl}
                            alt="Preview"
                            className="max-w-[300px] max-h-[300px] object-contain"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => {
                              removeImage(editingElement.uid);
                              form.setValue("image", null);
                            }}
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              )}
            />
          </div>

          <Button type="submit" size={"sm"}>
            Save
          </Button>
        </form>

        {/* Element Couples */}
        {getCoupleCount(editingElement.uid) > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Element Couples:</h4>
            <div className="space-y-2">
              {getElementCouples(editingElement.uid).map((couple) => {
                const isFirst = couple.first_element === editingElement.uid;
                const otherElement = useMemo(() => {
                  return elements.find((el) =>
                    isFirst
                      ? el.uid === couple.second_element
                      : el.uid === couple.first_element
                  );
                }, [
                  elements,
                  couple.first_element,
                  couple.second_element,
                  isFirst,
                ]);

                if (!otherElement) {
                  return "Something went wrong. Element not found.";
                }

                return (
                  <div
                    key={couple.trackUid}
                    className="flex items-center p-2 border rounded-md bg-slate-50"
                  >
                    <div className="flex items-center flex-1">
                      <Badge variant="outline" className="mr-2">
                        {couple.trackUid.replace("couple", "#")}
                      </Badge>
                      {isFirst ? (
                        <div className="flex items-center">
                          <span className="text-sm font-medium">
                            This element
                          </span>
                          <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
                          <span className="text-sm">
                            {otherElement.text ||
                              `Element ${otherElement.uid.replace("elem", "")}`}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="text-sm">
                            {otherElement.text ||
                              `Element ${otherElement.uid.replace("elem", "")}`}
                          </span>
                          <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
                          <span className="text-sm font-medium">
                            This element
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-blue-600"
                      onClick={() => {
                        setActiveSection("couples");
                        setActiveCoupleTab(couple.trackUid);
                      }}
                      type="button"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
