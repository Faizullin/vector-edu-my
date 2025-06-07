import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NiceModal, {
  NiceModalHocPropsExtended,
} from "@/context/nice-modal-context";
import type { DocumentId } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { EditorApiService } from "../EditorApiService";
import { showToast } from "@/utils/handle-server-error";
import { Search, Eye, Edit, Trash2, Filter } from "lucide-react";
import { TemplateDocument } from "../types";

const TemplateListViewNiceDialog = NiceModal.create<
  NiceModalHocPropsExtended<{
    post_id: DocumentId;
    component_type?: string;
    onSelectTemplate?: (template: TemplateDocument) => void;
  }>
>((props) => {
  const modal = NiceModal.useModal();
  const [templates, setTemplates] = useState<TemplateDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComponentType, setSelectedComponentType] = useState<string>(
    props.component_type || "all"
  );
  const [filteredTemplates, setFilteredTemplates] = useState<TemplateDocument[]>(
    []
  );
  const [componentTypes, setComponentTypes] = useState<string[]>([]);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await EditorApiService.fetchTemplateList(props.post_id, {
        search: "",
        // Don't filter by component_type in API call - we'll filter client-side
      });

      if (response.success === 0) {
        showToast("error", {
          message: "Failed to fetch templates",
          data: {
            description: "Error loading template list",
          },
        });
        return;
      }

      setTemplates(response.data.results);

      // Extract unique component types
      const types = [
        ...new Set(response.data.results.map((t) => t.component_type)),
      ].sort();
      setComponentTypes(types);
    } catch (error) {
      showToast("error", {
        message: "Failed to fetch templates",
        data: {
          description: error instanceof Error ? error.message : "Unknown error",
        },
      });
    } finally {
      setLoading(false);
    }
  }, [props.post_id]);

  const applyFilters = useCallback(() => {
    let filtered = [...templates];

    // Filter by component type
    if (selectedComponentType !== "all") {
      filtered = filtered.filter(
        (template) => template.component_type === selectedComponentType
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.component_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, selectedComponentType, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleComponentTypeChange = useCallback((value: string) => {
    setSelectedComponentType(value);
  }, []);

  const handleSelectTemplate = useCallback(
    (template: TemplateDocument) => {
      if (props.onSelectTemplate) {
        props.onSelectTemplate(template);
      }
      modal.hide();
    },
    [props.onSelectTemplate, modal]
  );

  const handleDeleteTemplate = useCallback(
    async (templateId: number) => {
      if (!confirm("Are you sure you want to delete this template?")) {
        return;
      }

      try {
        const response = await EditorApiService.deleteTemplate(
          props.post_id,
          templateId
        );
        if (response.success === 0) {
          showToast("error", {
            message: "Failed to delete template",
            data: {
              description: "Error deleting template",
            },
          });
          return;
        }

        showToast("success", {
          message: "Template deleted successfully",
        });

        // Refresh the list
        fetchTemplates();
      } catch (error) {
        showToast("error", {
          message: "Failed to delete template",
          data: {
            description: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
    },
    [props.post_id, fetchTemplates]
  );

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <Dialog open={modal.visible} onOpenChange={(v) => !v && modal.hide()}>
      <DialogContent className="!max-w-[1000px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Template Library
            <Badge variant="outline" className="ml-2">
              {filteredTemplates.length} templates
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search templates by name or type..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Component Type Filter */}
            <div className="w-64">
              <Select
                value={selectedComponentType}
                onValueChange={handleComponentTypeChange}
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {componentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Template List */}
          <ScrollArea className="h-[500px] w-full">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-sm text-muted-foreground">
                  Loading templates...
                </div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-sm text-muted-foreground">
                  {searchQuery || selectedComponentType !== "all"
                    ? "No templates found matching your filters"
                    : "No templates available"}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          #{template.id}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {template.component_type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Created:{" "}
                        {new Date(template.created_at).toLocaleDateString()}
                        {template.updated_at &&
                          template.updated_at !== template.created_at && (
                            <span className="ml-2">
                              • Updated:{" "}
                              {new Date(template.updated_at).toLocaleDateString()}
                            </span>
                          )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectTemplate(template)}
                        title="Select this template"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Select
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // You can implement edit functionality here
                          // NiceModal.show("edit-template-dialog", { template });
                        }}
                        title="Edit template"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        title="Delete template"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default TemplateListViewNiceDialog;