import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NiceModal, {
    NiceModalHocPropsExtended,
} from "@/context/nice-modal-context";
import { getAuthHeaders } from "@/lib/simpleRequest";
import { DocumentId } from "@/types";
import { showToast } from "@/utils/handle-server-error";
import { Log } from "@/utils/log";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Download,
    Eye,
    File,
    FileAudio,
    FileImage,
    FileVideo,
    Filter,
    Library,
    Search,
    Trash2,
    Upload,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EditorApiService } from "../EditorApiService";
import { AttachmentDocument, Block } from "../types";

// Add interface for media with blob URL
interface MediaWithBlobUrl extends AttachmentDocument {
    blobUrl?: string;
}

const MediaViewNiceDialog = NiceModal.create<
    NiceModalHocPropsExtended<{
        post_id: DocumentId;
        block: Block
    }>
>((props) => {
    const modal = NiceModal.useModal();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("library");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFileType, setSelectedFileType] = useState<string>("all");
    const [filteredMedia, setFilteredMedia] = useState<MediaWithBlobUrl[]>([]);
    const [fileTypes, setFileTypes] = useState<string[]>([]);
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const [mediaBlobs, setMediaBlobs] = useState<Map<number, string>>(new Map());

    // File upload states - Updated for single file
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState(false);

    // Static file type filters
    const staticFileTypeFilters: Array<{ label: string, value: string }> = [
        { label: "All Types", value: "all" },
        { label: "Images", value: "image" },
        { label: "Audio", value: "audio" }
    ];

    // Function to load media with authentication
    const loadMediaWithAuth = useCallback(async (mediaUrl: string): Promise<string> => {
        try {
            const newHeaders = await getAuthHeaders({});
            const response = await fetch(mediaUrl, {
                method: 'GET',
                headers: {
                    ...newHeaders,
                    'Accept': 'image/*,video/*,audio/*,application/*',
                },
            });
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            Log.error(`Error loading media ${mediaUrl}:`, error);
            throw error;
        }
    }, []);

    // Function to preload media URLs
    const preloadMediaUrls = useCallback(async (mediaItems: AttachmentDocument[]) => {
        const newBlobUrls = new Map<number, string>();

        // Only preload images for preview
        const imagesToPreload = mediaItems.filter(item =>
            item.file_type === 'image' && item.url
        );

        const loadPromises = imagesToPreload.map(async (item) => {
            try {
                const blobUrl = await loadMediaWithAuth(item.url!);
                newBlobUrls.set(item.id, blobUrl);
                return { id: item.id, blobUrl };
            } catch (error) {
                console.warn(`Failed to preload media ${item.id}:`, error);
                return null;
            }
        });

        const results = await Promise.allSettled(loadPromises);

        // Update state with successfully loaded blob URLs
        setMediaBlobs(prev => {
            const updated = new Map(prev);
            results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value) {
                    updated.set(result.value.id, result.value.blobUrl);
                }
            });
            return updated;
        });
    }, [loadMediaWithAuth]);

    // Fetch media using TanStack Query with better error handling
    const mediaListQuery = useQuery({
        queryKey: ['media-library', props.post_id],
        queryFn: async () => {
            if (!props.post_id) {
                throw new Error('Post ID is required');
            }
            return await EditorApiService.fetchMediaList(props.post_id, {});
        },
        enabled: !!props.post_id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    // Delete media mutation - Fixed to include attachment_id
    const deleteMediaMutation = useMutation({
        mutationFn: async (mediaId: number) => {
            if (!props.post_id) {
                throw new Error('Post ID is required');
            }
            return await EditorApiService.fileControl(props.post_id, {
                file_action: "remove",
                attachment_id: mediaId,
            });
        },
        onSuccess: (_, mediaId) => {
            // Clean up blob URL when media is deleted
            const blobUrl = mediaBlobs.get(mediaId);
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
                setMediaBlobs(prev => {
                    const updated = new Map(prev);
                    updated.delete(mediaId);
                    return updated;
                });
            }

            showToast("success", {
                message: "Media deleted successfully",
            });
            queryClient.invalidateQueries({ queryKey: ['media-library', props.post_id] });
        },
        onError: (error) => {
            showToast("error", {
                message: "Failed to delete media",
                data: {
                    description: error instanceof Error ? error.message : "Unknown error",
                },
            });
        },
    });

    // Upload media mutation - Updated for single file
    const uploadMediaMutation = useMutation({
        mutationFn: async (file: File) => {
            if (!props.post_id) {
                throw new Error('Post ID is required');
            }

            return await EditorApiService.fileControl(props.post_id, {
                file_action: "upload",
                file: file
            });
        },
        onSuccess: () => {
            showToast("success", {
                message: "File uploaded successfully",
            });
            queryClient.invalidateQueries({ queryKey: ['media-library', props.post_id] });
            setSelectedFile(null);
            setActiveTab("library");
        },
        onError: (error) => {
            showToast("error", {
                message: "Failed to upload file",
                data: {
                    description: error instanceof Error ? error.message : "Unknown error",
                },
            });
        },
        onSettled: () => {
            setIsUploading(false);
            setUploadProgress(0);
        },
    });

    // Process media data when response changes
    useEffect(() => {
        if (!mediaListQuery.data) return;

        if (mediaListQuery.data.success === 0) {
            setFilteredMedia([]);
            setFileTypes([]);
            return;
        }

        if (mediaListQuery.data.data?.results) {
            const mediaItems = mediaListQuery.data.data.results;
            const types = Array.from(new Set(
                mediaItems.map((item: AttachmentDocument) =>
                    item.file_type || 'file'
                )
            )).sort();
            setFileTypes(types);

            // Preload media URLs for images
            preloadMediaUrls(mediaItems);
        }
    }, [mediaListQuery.data, preloadMediaUrls]);

    // Cleanup blob URLs on unmount
    useEffect(() => {
        return () => {
            mediaBlobs.forEach((blobUrl) => {
                URL.revokeObjectURL(blobUrl);
            });
        };
    }, [mediaBlobs]);

    // Apply filters
    const applyFilters = useCallback(() => {
        if (!mediaListQuery.data?.success || !mediaListQuery.data?.data?.results) {
            setFilteredMedia([]);
            return;
        }

        let filtered = [...mediaListQuery.data.data.results];

        // Filter by file type using static filters
        if (selectedFileType !== "all") {
            if (selectedFileType === "image") {
                filtered = filtered.filter(item =>
                    (item.file_type === 'image')
                );
            } else if (selectedFileType === "audio") {
                filtered = filtered.filter(item =>
                    (item.file_type === 'audio')
                );
            } else {
                filtered = filtered.filter(item =>
                    (item.file_type || 'file') === selectedFileType
                );
            }
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.name?.toLowerCase().includes(query) ||
                item.extension?.toLowerCase().includes(query) ||
                item.file_type?.toLowerCase().includes(query)
            );
        }

        // Add blob URLs to filtered media
        const filteredWithBlobs = filtered.map(item => ({
            ...item,
            blobUrl: mediaBlobs.get(item.id)
        }));

        setFilteredMedia(filteredWithBlobs);
    }, [mediaListQuery.data, selectedFileType, searchQuery, mediaBlobs]);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const handleFileTypeChange = useCallback((value: string) => {
        setSelectedFileType(value);
    }, []);

    useEffect(() => {
        setSelectedFileType(props.block.type);
    }, [props.block]);

    const onSelectMedia = (media: AttachmentDocument) => {
        modal.resolve({
            result: {
                record: media,
            },
        });
        modal.hide();
    }

    const handleSelectMedia = useCallback((media: AttachmentDocument) => {
        onSelectMedia(media);
    }, [modal]);

    const handleDeleteMedia = useCallback(async (mediaId: number) => {
        if (!confirm("Are you sure you want to delete this media file?")) {
            return;
        }
        deleteMediaMutation.mutate(mediaId);
    }, [deleteMediaMutation]);

    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]); // Only take the first file
        }
    }, []);

    const handleUpload = useCallback(async () => {
        if (!selectedFile) {
            showToast("error", { message: "Please select a file to upload" });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return prev;
                }
                return prev + 10;
            });
        }, 200);

        uploadMediaMutation.mutate(selectedFile);
    }, [selectedFile, uploadMediaMutation]);

    // Enhanced view/download handlers that use authenticated requests
    const handleViewMedia = useCallback(async (media: MediaWithBlobUrl) => {
        try {
            let urlToOpen = media.blobUrl;

            if (!urlToOpen && media.url) {
                // Load the media with auth if blob URL not available
                urlToOpen = await loadMediaWithAuth(media.url);
            }

            if (urlToOpen) {
                window.open(urlToOpen, '_blank');
            } else {
                throw new Error('Media URL not available');
            }
        } catch (error) {
            showToast("error", {
                message: "Failed to load media",
                data: {
                    description: error instanceof Error ? error.message : "Unknown error",
                },
            });
        }
    }, [loadMediaWithAuth]);

    const handleDownloadMedia = useCallback(async (media: MediaWithBlobUrl) => {
        try {
            let urlToDownload = media.blobUrl;

            if (!urlToDownload && media.url) {
                // Load the media with auth if blob URL not available
                urlToDownload = await loadMediaWithAuth(media.url);
            }

            if (urlToDownload) {
                const link = document.createElement('a');
                link.href = urlToDownload;
                link.download = media.name || media.original_name || 'download';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                throw new Error('Media URL not available');
            }
        } catch (error) {
            showToast("error", {
                message: "Failed to download media",
                data: {
                    description: error instanceof Error ? error.message : "Unknown error",
                },
            });
        }
    }, [loadMediaWithAuth]);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (attachmentType: string) => {
        switch (attachmentType) {
            case 'image':
            case 'thumbnail_image':
                return <FileImage className="h-4 w-4" />;
            case 'video':
                return <FileVideo className="h-4 w-4" />;
            case 'audio':
                return <FileAudio className="h-4 w-4" />;
            default:
                return <File className="h-4 w-4" />;
        }
    };

    const getFileTypeFromMimeType = (file_type: AttachmentDocument["file_type"]): string => {
        if (file_type === "image") return 'image';
        else if (file_type === "video") return 'video';
        else if (file_type === "audio") return 'audio';
        return 'document';
    };

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const renderMediaContent = () => {
        if (mediaListQuery.isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <div className="text-sm text-muted-foreground">Loading media library...</div>
                </div>
            );
        }

        if (mediaListQuery.isError) {
            return (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="text-red-500">
                        <File className="h-12 w-12 mx-auto mb-2" />
                    </div>
                    <div className="text-sm text-center">
                        <div className="font-medium text-red-600 mb-1">Failed to load media</div>
                        <div className="text-muted-foreground">
                            {mediaListQuery.error instanceof Error
                                ? mediaListQuery.error.message
                                : "Something went wrong while loading your media files"}
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => mediaListQuery.refetch()}
                        disabled={mediaListQuery.isFetching}
                    >
                        {mediaListQuery.isFetching ? "Retrying..." : "Try Again"}
                    </Button>
                </div>
            );
        }

        if (filteredMedia.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="text-gray-400">
                        <Library className="h-12 w-12 mx-auto mb-2" />
                    </div>
                    <div className="text-sm text-center">
                        <div className="font-medium text-gray-600 mb-1">
                            {searchQuery || selectedFileType !== "all"
                                ? "No media found matching your filters"
                                : "No media files available"
                            }
                        </div>
                        {(!searchQuery && selectedFileType === "all") && (
                            <div className="text-muted-foreground">
                                Upload your first file to get started
                            </div>
                        )}
                    </div>
                    {(!searchQuery && selectedFileType === "all") && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab("upload")}
                        >
                            Upload File
                        </Button>
                    )}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMedia.map((media) => {
                    const fileType = getFileTypeFromMimeType(media.file_type || '');

                    return (
                        <div
                            key={media.id}
                            className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer ${selectedItems.has(media.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                                }`}
                            onClick={() => handleSelectMedia(media)}
                        >
                            {/* Media Preview */}
                            <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                                {fileType === 'image' && media.blobUrl ? (
                                    <img
                                        src={media.blobUrl}
                                        alt={media.name || 'Media file'}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const fallback = target.nextElementSibling as HTMLElement;
                                            if (fallback) {
                                                fallback.style.display = 'flex';
                                            }
                                        }}
                                    />
                                ) : null}
                                <div
                                    className="flex items-center justify-center w-full h-full text-gray-400"
                                    style={{ display: (fileType === 'image' && media.blobUrl) ? 'none' : 'flex' }}
                                >
                                    {getFileIcon(fileType)}
                                    <span className="ml-2 text-sm">{media.file_type}</span>
                                </div>
                            </div>

                            {/* Media Info */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-sm truncate flex-1">
                                        {media.name || media.original_name || 'Unnamed file'}
                                    </h3>
                                    <Badge variant="outline" className="text-xs">
                                        #{media.id}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                        {fileType}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {formatFileSize(media.size)}
                                    </span>
                                </div>

                                <div className="text-xs text-muted-foreground">
                                    {media.file_type}
                                </div>

                                {media.uploaded_at && (
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(media.uploaded_at).toLocaleDateString()}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewMedia(media);
                                        }}
                                        title="View file"
                                        className="flex-1"
                                        disabled={!media.url}
                                    >
                                        <Eye className="h-3 w-3 mr-1" />
                                        View
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownloadMedia(media);
                                        }}
                                        title="Download file"
                                        disabled={!media.url}
                                    >
                                        <Download className="h-3 w-3" />
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteMedia(media.id);
                                        }}
                                        title="Delete file"
                                        className="text-red-600 hover:text-red-700"
                                        disabled={deleteMediaMutation.isPending}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <Dialog open={modal.visible} onOpenChange={(v) => !v && modal.hide()}>
            <DialogContent className="!max-w-[1200px] max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>
                            Media Library
                            {activeTab === "library" && !mediaListQuery.isLoading && (
                                <>
                                    <Badge variant="outline" className="ml-2">
                                        {filteredMedia.length} files
                                    </Badge>
                                </>
                            )}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="library" className="flex items-center gap-2">
                            <Library className="h-4 w-4" />
                            Media Library
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Upload File
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="library" className="space-y-4 mt-4">
                        {/* Filters - Only show when not loading */}
                        {!mediaListQuery.isLoading && (
                            <div className="flex gap-4">
                                {/* Search Bar */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search media by filename or MIME type..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                {/* File Type Filter */}
                                <div className="w-48">
                                    <Select value={selectedFileType} onValueChange={handleFileTypeChange}>
                                        <SelectTrigger>
                                            <Filter className="h-4 w-4 mr-2" />
                                            <SelectValue placeholder="Filter" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {staticFileTypeFilters.map((filter) => (
                                                <SelectItem key={filter.value} value={filter.value}>
                                                    <div className="flex items-center gap-2">
                                                        {filter.value === "image" && <FileImage className="h-4 w-4" />}
                                                        {filter.value === "audio" && <FileAudio className="h-4 w-4" />}
                                                        {filter.value === "all" && <Filter className="h-4 w-4" />}
                                                        <span>{filter.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                            {/* Dynamic types */}
                                            {fileTypes.length > 0 && fileTypes.some(type => !['image', 'audio'].includes(type)) && (
                                                <>
                                                    <div className="border-t my-1" />
                                                    {fileTypes.filter(type => !['image', 'audio'].includes(type)).map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            <div className="flex items-center gap-2">
                                                                {getFileIcon(type)}
                                                                <span className="capitalize">{type}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* Media Content */}
                        <ScrollArea className="h-[500px] w-full">
                            {renderMediaContent()}
                        </ScrollArea>
                    </TabsContent>

                    {/* Upload tab remains the same */}
                    <TabsContent value="upload" className="space-y-4 mt-4">
                        <div className="space-y-6 p-4">
                            <div className="text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium mb-2">Upload Media File</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Select a single file to upload to your media library
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="file-upload" className="block text-sm font-medium mb-2">
                                        Choose File
                                    </Label>
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        onChange={handleFileSelect}
                                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                                        className="cursor-pointer"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Supported formats: Images, Videos, Audio, Documents (PDF, DOC, TXT), Archives (ZIP, RAR)
                                    </p>
                                </div>

                                {selectedFile && (
                                    <div className="border rounded-lg p-4 bg-gray-50">
                                        <h4 className="font-medium mb-2">Selected File</h4>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="truncate flex-1 mr-2">{selectedFile.name}</span>
                                            <span className="text-muted-foreground">
                                                {formatFileSize(selectedFile.size)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {isUploading && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Uploading...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleUpload}
                                        disabled={!selectedFile || isUploading}
                                        className="flex-1"
                                    >
                                        {isUploading ? (
                                            <>
                                                <Upload className="h-4 w-4 mr-2 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload File
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setUploadProgress(0);
                                            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                                            if (fileInput) fileInput.value = '';
                                        }}
                                        disabled={isUploading}
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
});

export default MediaViewNiceDialog;

