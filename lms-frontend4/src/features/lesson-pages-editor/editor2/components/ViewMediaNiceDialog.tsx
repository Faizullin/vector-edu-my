// import type { FieldItem, PaginatedData } from "@/client";
// import NiceModal, {
//   type NiceModalHocPropsExtended,
// } from "@/components/nice-modal/NiceModal";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import debounce from "@/utils/debounce";
// import {
//   File,
//   FileText,
//   ImageIcon,
//   Loader2,
//   Music,
//   Search,
//   Upload,
//   Video,
//   X,
// } from "lucide-react";
// import { useCallback, useEffect, useRef, useState } from "react";
// import type { ComponentBase } from "../../editor/types";
// import { EditorApiService } from "../EditorApiService";
// import type { Block } from "../types";

// // Mock data for media items
// const mockMediaItems = [
//   {
//     id: 1,
//     name: "Image 1.jpg",
//     type: "image",
//     url: "/placeholder.svg?height=200&width=300",
//   },
//   {
//     id: 2,
//     name: "Document 1.pdf",
//     type: "document",
//     url: "/placeholder.svg?height=200&width=300",
//   },
//   {
//     id: 3,
//     name: "Video 1.mp4",
//     type: "video",
//     url: "/placeholder.svg?height=200&width=300",
//   },
//   {
//     id: 4,
//     name: "Image 2.png",
//     type: "image",
//     url: "/placeholder.svg?height=200&width=300",
//   },
//   {
//     id: 5,
//     name: "Audio 1.mp3",
//     type: "audio",
//     url: "/placeholder.svg?height=200&width=300",
//   },
//   {
//     id: 6,
//     name: "Image 3.jpg",
//     type: "image",
//     url: "/placeholder.svg?height=200&width=300",
//   },
//   {
//     id: 7,
//     name: "Document 2.docx",
//     type: "document",
//     url: "/placeholder.svg?height=200&width=300",
//   },
//   {
//     id: 8,
//     name: "Image 4.jpg",
//     type: "image",
//     url: "/placeholder.svg?height=200&width=300",
//   },
//   {
//     id: 9,
//     name: "Video 2.mp4",
//     type: "video",
//     url: "/placeholder.svg?height=200&width=300",
//   },
//   {
//     id: 10,
//     name: "Image 5.png",
//     type: "image",
//     url: "/placeholder.svg?height=200&width=300",
//   },
//   {
//     id: 11,
//     name: "Audio 2.wav",
//     type: "audio",
//     url: "/placeholder.svg?height=200&width=300",
//   },
//   {
//     id: 12,
//     name: "Document 3.pdf",
//     type: "document",
//     url: "/placeholder.svg?height=200&width=300",
//   },
// ];
// const getFileIcon = (type: string) => {
//   switch (type) {
//     case "image":
//       return <ImageIcon className="h-5 w-5" />;
//     case "document":
//       return <FileText className="h-5 w-5" />;
//     case "video":
//       return <Video className="h-5 w-5" />;
//     case "audio":
//       return <Music className="h-5 w-5" />;
//     default:
//       return <File className="h-5 w-5" />;
//   }
// };
// export const ViewMediaNiceDialog = NiceModal.create<
//   NiceModalHocPropsExtended<{
//     defaultTab: string;
//     block: Block;
//     parseSearchResponse: (response: PaginatedData<any>) => FieldItem[];
//   }>
// >(({ defaultTab = "browse", block, parseSearchResponse }) => {
//   const modal = NiceModal.useModal();
//   const [activeTab, setActiveTab] = useState("browse");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [fileType, setFileType] = useState("all");
//   const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
//     {}
//   );

//   useEffect(() => {
//     setActiveTab(defaultTab);
//   }, [defaultTab]);

//   useEffect(() => {
//     if (block) {
//       setFileType(block.type);
//     }
//   }, [block]);

//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Filter media items based on search query and file type
//   const filteredMedia = mockMediaItems.filter((item) => {
//     const matchesSearch = item.name
//       .toLowerCase()
//       .includes(searchQuery.toLowerCase());
//     const matchesType = fileType === "all" || item.type === fileType;
//     return matchesSearch && matchesType;
//   });

//   const handleFileSelect = () => {
//     fileInputRef.current?.click();
//   };

//   const handleFileChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       if (e.target.files) {
//         const newFiles = Array.from(e.target.files);
//         setUploadingFiles((prev) => [...prev, ...newFiles]);

//         // Initialize progress for each file
//         const newProgress: Record<string, number> = {};
//         newFiles.forEach((file) => {
//           newProgress[file.name] = 0;
//         });
//         setUploadProgress((prev) => ({ ...prev, ...newProgress }));
//       }
//     },
//     []
//   );

//   const handleDrop = useCallback((e: React.DragEvent) => {
//     e.preventDefault();

//     if (e.dataTransfer.files) {
//       const newFiles = Array.from(e.dataTransfer.files);
//       setUploadingFiles((prev) => [...prev, ...newFiles]);

//       // Initialize progress for each file
//       const newProgress: Record<string, number> = {};
//       newFiles.forEach((file) => {
//         newProgress[file.name] = 0;
//       });
//       setUploadProgress((prev) => ({ ...prev, ...newProgress }));
//     }
//   }, []);

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//   };

//   const removeUploadingFile = useCallback(
//     (fileName: string) => {
//       setUploadingFiles((prev) =>
//         prev.filter((file) => file.name !== fileName)
//       );

//       // Remove from progress tracking
//       const newProgress = { ...uploadProgress };
//       delete newProgress[fileName];
//       setUploadProgress(newProgress);
//     },
//     [uploadProgress]
//   );

//   const startUpload = useCallback(() => {
//     if (uploadingFiles.length === 0) return;

//     setIsUploading(true);

//     // Simulate upload progress for each file
//     uploadingFiles.forEach((file) => {
//       let progress = 0;
//       const interval = setInterval(() => {
//         progress += Math.random() * 10;
//         if (progress >= 100) {
//           progress = 100;
//           clearInterval(interval);

//           // Check if all files are done
//           const allDone = Object.values({
//             ...uploadProgress,
//             [file.name]: 100,
//           }).every((p) => p === 100);

//           if (
//             allDone &&
//             uploadingFiles.length === Object.keys(uploadProgress).length
//           ) {
//             setTimeout(() => {
//               setIsUploading(false);
//               setUploadingFiles([]);
//               setUploadProgress({});
//               // Switch to browse tab after successful upload
//               setActiveTab("browse");
//             }, 500);
//           }
//         }

//         setUploadProgress((prev) => ({
//           ...prev,
//           [file.name]: progress,
//         }));
//       }, 200);
//     });
//   }, [uploadingFiles, uploadProgress]);

//   const [value, setValue] = useState<any | null>(null);
//   const handleSave = useCallback(() => {
//     if (value) {
//       EditorApiService.fetchComponentDetail<any>(block.type, value.value).then(
//         (response) => {
//           modal.resolve({
//             record: response,
//             modal: modal,
//           });
//         }
//       );
//     }
//   }, [modal, value, block]);

//   const [loading, setLoading] = useState(false);
//   const fetchOptions = (inputValue: string) => {
//     return EditorApiService.fetchComponentListPaginated<ComponentBase>(block.type, {
//       search: inputValue,
//     });
//   };
//   const [data, setData] = useState<ComponentBase[]>([]);
//   const [fieldItems, setFieldItems] = useState<FieldItem[]>([]);
//   const loadOptionsDebounced = useCallback(
//     debounce((inputValue: string, callback: (options: any) => void) => {
//       setLoading(true);
//       fetchOptions(inputValue).then((response) => {
//         const parsedResponse = parseSearchResponse(response);
//         callback(parsedResponse);
//         setLoading(false);
//         setData(response.results);
//         setFieldItems(parsedResponse);
//       });
//     }, 500),
//     []
//   );
//   useEffect(() => {
//     loadOptionsDebounced(searchQuery);
//   }, [loadOptionsDebounced, searchQuery]);
//   return (
//     <Dialog open={modal.visible} onOpenChange={(v) => !v && modal.hide()}>
//       <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
//         <DialogHeader>
//           <DialogTitle>Media Library</DialogTitle>
//         </DialogHeader>

//         <Tabs
//           value={activeTab}
//           onValueChange={setActiveTab}
//           className="flex-1 flex flex-col"
//         >
//           <div className="flex justify-between items-center mb-4">
//             <TabsList>
//               <TabsTrigger value="browse">Browse Media</TabsTrigger>
//               <TabsTrigger value="upload">Upload Files</TabsTrigger>
//             </TabsList>
//           </div>

//           <TabsContent value="browse" className="flex-1 flex flex-col">
//             <div className="flex gap-4 mb-4">
//               <div className="relative flex-1">
//                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder="Search media..."
//                   className="pl-8"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>

//               <Select value={fileType} onValueChange={setFileType}>
//                 <SelectTrigger className="w-[180px]">
//                   <SelectValue placeholder="File type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Files</SelectItem>
//                   <SelectItem value="image">Images</SelectItem>
//                   <SelectItem value="document">Documents</SelectItem>
//                   <SelectItem value="video">Videos</SelectItem>
//                   <SelectItem value="audio">Audio</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <ScrollArea className="flex-1 border rounded-md">
//               {fieldItems.length > 0 ? (
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
//                   {fieldItems.map((item) => (
//                     <div
//                       key={item.id}
//                       className="group relative cursor-pointer border rounded-md overflow-hidden hover:border-primary transition-colors"
//                       //   onClick={() => handleMediaSelect(item)}
//                     >
//                       <div className="aspect-square bg-muted relative">
//                         {item.type === "image" ? (
//                           <img
//                             src={item.url || "/placeholder.svg"}
//                             alt={item.name}
//                             className="w-full h-full object-cover"
//                           />
//                         ) : (
//                           <div className="w-full h-full flex items-center justify-center">
//                             {getFileIcon(item.type)}
//                           </div>
//                         )}
//                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                           <Button variant="secondary" size="sm">
//                             Select
//                           </Button>
//                         </div>
//                       </div>
//                       <div className="p-2 text-xs truncate">{item.name}</div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-center h-64 text-muted-foreground">
//                   No media found
//                 </div>
//               )}
//             </ScrollArea>
//           </TabsContent>

//           <TabsContent value="upload" className="flex-1 flex flex-col">
//             <div
//               className="border-2 border-dashed rounded-lg p-8 text-center mb-4 flex-1 flex flex-col items-center justify-center"
//               onDrop={handleDrop}
//               onDragOver={handleDragOver}
//             >
//               <Upload className="h-10 w-10 text-muted-foreground mb-4" />
//               <h3 className="text-lg font-medium mb-2">
//                 Drag and drop files here
//               </h3>
//               <p className="text-sm text-muted-foreground mb-4">
//                 Or click the button below to browse files
//               </p>
//               <Button onClick={handleFileSelect}>Select Files</Button>
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 className="hidden"
//                 multiple
//                 onChange={handleFileChange}
//               />
//             </div>

//             {uploadingFiles.length > 0 && (
//               <div className="border rounded-md p-4">
//                 <h4 className="font-medium mb-2">
//                   Files to upload ({uploadingFiles.length})
//                 </h4>
//                 <ScrollArea className="h-[200px]">
//                   <div className="space-y-2">
//                     {uploadingFiles.map((file) => (
//                       <div key={file.name} className="flex items-center gap-2">
//                         <div className="flex-1">
//                           <div className="flex justify-between mb-1">
//                             <span className="text-sm truncate">
//                               {file.name}
//                             </span>
//                             {!isUploading && (
//                               <button
//                                 onClick={() => removeUploadingFile(file.name)}
//                                 className="text-muted-foreground hover:text-destructive"
//                               >
//                                 <X className="h-4 w-4" />
//                               </button>
//                             )}
//                           </div>
//                           <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
//                             <div
//                               className="h-full bg-primary transition-all duration-300"
//                               style={{
//                                 width: `${uploadProgress[file.name] || 0}%`,
//                               }}
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </ScrollArea>
//                 <div className="mt-4 flex justify-end">
//                   {isUploading ? (
//                     <Button disabled>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Uploading...
//                     </Button>
//                   ) : (
//                     <Button onClick={startUpload}>
//                       Upload {uploadingFiles.length}{" "}
//                       {uploadingFiles.length === 1 ? "file" : "files"}
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             )}
//           </TabsContent>
//         </Tabs>

//         <DialogFooter>
//           <Button onClick={handleSave} disabled={!value}>
//             Save changes
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// });
