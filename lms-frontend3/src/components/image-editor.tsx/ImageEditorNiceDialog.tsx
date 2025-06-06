import { CropIcon, Trash2Icon } from "lucide-react";
import { useCallback, useRef, useState, type SyntheticEvent } from "react";
import { type FileWithPath } from "react-dropzone";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import NiceModal, {
  type NiceModalHocPropsExtended,
} from "../nice-modal/NiceModal";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "../ui/dialog";

type FileWithPreview = FileWithPath & {
  preview: string;
};

interface ImageCropperProps {
  selectedFile: FileWithPreview | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<FileWithPreview | null>>;
}

interface ImageCropperResult {
  croppedImage: string;
  croppedImageUrl: string;
}

export const ImageEditorNiceDialog = NiceModal.create<
  NiceModalHocPropsExtended<ImageCropperProps>
>(({ selectedFile, setSelectedFile }) => {
  const modal = NiceModal.useModal();
  const aspect = 1;

  const imgRef = useRef<HTMLImageElement | null>(null);

  const [crop, setCrop] = useState<Crop>();
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");
  const [croppedImage, setCroppedImage] = useState<string>("");

  function onImageLoad(e: SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  function onCropComplete(crop: PixelCrop) {
    if (imgRef.current && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, crop);
      setCroppedImageUrl(croppedImageUrl);
    }
  }

  function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): string {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      );
    }

    return canvas.toDataURL("image/png", 1.0);
  }

  async function onCrop() {
    try {
      setCroppedImage(croppedImageUrl);
      modal.hide();
    } catch (error) {
      alert("Something went wrong!");
    }
  }

  return (
    <Dialog
      open={modal.visible}
      onOpenChange={(v) => {
        if (!v) {
          modal.hide();
        }
      }}
    >
      <DialogTrigger>
        <Avatar className="size-36 cursor-pointer ring-offset-2 ring-2 ring-slate-200">
          <AvatarImage
            src={croppedImage ? croppedImage : selectedFile?.preview}
            alt="@shadcn"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </DialogTrigger>
      <DialogContent className="p-0 gap-0">
        <div className="p-6 size-full">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => onCropComplete(c)}
            aspect={aspect}
            className="w-full"
          >
            <Avatar className="size-full rounded-none">
              <AvatarImage
                ref={imgRef}
                className="size-full rounded-none "
                alt="Image Cropper Shell"
                src={selectedFile?.preview}
                onLoad={onImageLoad}
              />
              <AvatarFallback className="size-full min-h-[460px] rounded-none">
                Loading...
              </AvatarFallback>
            </Avatar>
          </ReactCrop>
        </div>
        <DialogFooter className="p-6 pt-0 justify-center ">
          <DialogClose asChild>
            <Button
              size={"sm"}
              type="reset"
              className="w-fit"
              variant={"outline"}
              onClick={() => {
                setSelectedFile(null);
              }}
            >
              <Trash2Icon className="mr-1.5 size-4" />
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" size={"sm"} className="w-fit" onClick={onCrop}>
            <CropIcon className="mr-1.5 size-4" />
            Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 50,
        height: 50,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export const useImageEditorNiceDialog = ({
  selectedFile,
  setSelectedFile,
}: ImageCropperProps) => {
  const openDialog = useCallback(() => {
    return NiceModal.show(ImageEditorNiceDialog, {
      selectedFile,
      setSelectedFile,
    }).then((result_) => {
      const result = result_ as ImageCropperResult;
      console.log("Cropped Image URL: ", result?.croppedImageUrl);
    });
  }, [selectedFile, setSelectedFile]);
  return {
    openDialog,
  };
};
