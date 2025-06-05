"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { JwtAuthService } from "@/lib/jwt-auth";
import { SettingsService } from "@/lib/settings-service";
import { showToast } from "@/utils/handle-server-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(20, {
      message: "Username must not be longer than 20 characters.",
    }),
  description: z
    .string()
    .min(2, {
      message: "Description must be at least 2 characters.",
    })
    .max(80, {
      message: "Description must not be longer than 80 characters.",
    }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const defaultValues: Partial<ProfileFormValues> = {
  name: "",
  description: "",
};

export default function ProfileForm() {
  const queryClient = useQueryClient();
  const { updateUserData } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const userProfileQuery = useQuery({
    queryKey: ["userProfile"],
    queryFn: JwtAuthService.getUser,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormValues) => {
      return SettingsService.updateUserSettingsProfile(data);
    },
    onSuccess: (data) => {
      showToast("success", {
        message: "Profile updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      updateUserData(data);
    },
    onError: (error: Error) => {
      showToast("error", {
        message: error.message || "Failed to update profile",
      });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("photo", file);
      const response = await SettingsService.updateUserSettingsAvatar(formData);
      return response;
    },
    onSuccess: (data) => {
      showToast("success", {
        message: "Avatar updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      updateUserData(data);
      setAvatarPreview(null);
      setSelectedFile(null);
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      showToast("error", {
        message: error.message || "Failed to upload avatar",
      });
      setAvatarPreview(null);
      setSelectedFile(null);
    },
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = form.handleSubmit((data) => {
    updateProfileMutation.mutate(data);
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showToast("error", {
          message: "Please select a valid image file",
        });
        return;
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast("error", {
          message: "File size must be less than 5MB",
        });
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadConfirm = () => {
    if (selectedFile) {
      uploadAvatarMutation.mutate(selectedFile);
    }
  };

  const handleDialogCancel = () => {
    setAvatarPreview(null);
    setSelectedFile(null);
    setIsDialogOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (userProfileQuery.data) {
      form.setValue("name", userProfileQuery.data.name);
      form.setValue("description", userProfileQuery.data.description);
    }
  }, [form, userProfileQuery.data]);

  // Open dialog when file is selected
  useEffect(() => {
    if (selectedFile && avatarPreview) {
      setIsDialogOpen(true);
    }
  }, [selectedFile, avatarPreview]);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Avatar Upload Section */}
        <div className="space-y-4">
          <FormLabel>Profile Picture</FormLabel>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userProfileQuery.data?.photo} />
                <AvatarFallback>
                  {userProfileQuery.data?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAvatarClick}
              >
                <Camera className="w-4 h-4 mr-2" />
                Change Avatar
              </Button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <FormDescription>
            Upload a profile picture. Max file size: 5MB. Supported formats:
            JPG, PNG, GIF.
          </FormDescription>
        </div>

        {/* Photo Upload Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload Profile Picture</DialogTitle>
              <DialogDescription>
                Preview your new profile picture before uploading.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-4">
              {avatarPreview && (
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={avatarPreview} className="object-cover"/>
                    <AvatarFallback>Preview</AvatarFallback>
                  </Avatar>
                  {uploadAvatarMutation.isPending && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {selectedFile && (
              <div className="text-sm text-muted-foreground text-center">
                <p>File: {selectedFile.name}</p>
                <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleDialogCancel}
                disabled={uploadAvatarMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUploadConfirm}
                disabled={uploadAvatarMutation.isPending || !selectedFile}
              >
                {uploadAvatarMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name. It can be your real name or a
                pseudonym.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A short description of yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is a short description of yourself that will be displayed
                on your profile page.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="sm"
          disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? "Updating..." : "Update profile"}
        </Button>
      </form>
    </Form>
  );
}
