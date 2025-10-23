"use client";
import { cn } from "@/lib/utils";
import { Button } from "@components/ui/button";
import { CropIcon, RotateCcwIcon } from "lucide-react";
import { Slot } from "radix-ui";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";

import "react-image-crop/dist/ReactCrop.css";

const centerAspectCrop = (mediaWidth, mediaHeight, aspect) =>
    centerCrop(
        aspect
            ? makeAspectCrop(
                  {
                      unit: "%",
                      width: 90,
                  },
                  aspect,
                  mediaWidth,
                  mediaHeight
              )
            : { x: 0, y: 0, width: 90, height: 90, unit: "%" },
        mediaWidth,
        mediaHeight
    );

const getCroppedPngImage = async (
    imageSrc,
    scaleFactor,
    pixelCrop,
    maxImageSize
) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Context is null, this should never happen.");
    }

    const scaleX = imageSrc.naturalWidth / imageSrc.width;
    const scaleY = imageSrc.naturalHeight / imageSrc.height;

    ctx.imageSmoothingEnabled = false;
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        imageSrc,
        pixelCrop.x * scaleX,
        pixelCrop.y * scaleY,
        pixelCrop.width * scaleX,
        pixelCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
    );

    const croppedImageUrl = canvas.toDataURL("image/png");
    const response = await fetch(croppedImageUrl);
    const blob = await response.blob();

    if (blob.size > maxImageSize) {
        return await getCroppedPngImage(
            imageSrc,
            scaleFactor * 0.9,
            pixelCrop,
            maxImageSize
        );
    }

    return croppedImageUrl;
};

const ImageCropContext = createContext(null);

const useImageCrop = () => {
    const context = useContext(ImageCropContext);
    if (!context) {
        throw new Error("ImageCrop components must be used within ImageCrop");
    }
    return context;
};

export const ImageCrop = ({
    file,
    maxImageSize = 1024 * 1024 * 5,
    onCrop,
    children,
    onChange,
    onComplete,
    ...reactCropProps
}) => {
    const imgRef = useRef(null);
    const [imgSrc, setImgSrc] = useState("");
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [initialCrop, setInitialCrop] = useState();

    useEffect(() => {
        const reader = new FileReader();
        reader.addEventListener("load", () =>
            setImgSrc(reader.result?.toString() || "")
        );
        reader.readAsDataURL(file);
    }, [file]);

    const onImageLoad = useCallback(
        e => {
            const { width, height } = e.currentTarget;
            const newCrop = centerAspectCrop(
                width,
                height,
                reactCropProps.aspect
            );
            setCrop(newCrop);
            setInitialCrop(newCrop);
        },
        [reactCropProps.aspect]
    );

    const handleChange = (pixelCrop, percentCrop) => {
        setCrop(percentCrop);
        onChange?.(pixelCrop, percentCrop);
    };

    // biome-ignore lint/suspicious/useAwait: "onComplete is async"
    const handleComplete = async (pixelCrop, percentCrop) => {
        setCompletedCrop(pixelCrop);
        onComplete?.(pixelCrop, percentCrop);
    };

    const applyCrop = async () => {
        if (!(imgRef.current && completedCrop)) {
            return null;
        }

        const croppedImage = await getCroppedPngImage(
            imgRef.current,
            1,
            completedCrop,
            maxImageSize
        );

        onCrop?.(croppedImage);
        return croppedImage;
    };

    const resetCrop = () => {
        if (initialCrop) {
            setCrop(initialCrop);
            setCompletedCrop(null);
        }
    };

    const contextValue = {
        file,
        maxImageSize,
        imgSrc,
        crop,
        completedCrop,
        imgRef,
        onCrop,
        reactCropProps,
        handleChange,
        handleComplete,
        onImageLoad,
        applyCrop,
        resetCrop,
    };

    return (
        <ImageCropContext.Provider value={contextValue}>
            {children}
        </ImageCropContext.Provider>
    );
};

export const ImageCropContent = ({ style, className }) => {
    const {
        imgSrc,
        crop,
        handleChange,
        handleComplete,
        onImageLoad,
        imgRef,
        reactCropProps,
    } = useImageCrop();

    const shadcnStyle = {
        "--rc-border-color": "var(--color-border)",
        "--rc-focus-color": "var(--color-primary)",
    };

    return (
        <div className="flex justify-center">
            <ReactCrop
                className={cn("max-h-[500px] max-w-full", className)}
                crop={crop}
                onChange={handleChange}
                onComplete={handleComplete}
                style={{ ...shadcnStyle, ...style }}
                keepSelection
                {...reactCropProps}
            >
                {imgSrc && (
                    // eslint-disable-next-line @next/next/no-img-element -- react-image-crop requires a direct <img> element
                    <img
                        alt="crop"
                        className="h-auto max-w-full"
                        onLoad={onImageLoad}
                        ref={imgRef}
                        src={imgSrc}
                    />
                )}
            </ReactCrop>
        </div>
    );
};

export const ImageCropPreview = ({ style, className }) => {
    const { imgSrc, completedCrop, imgRef, reactCropProps } = useImageCrop();
    const previewCanvasRef = useRef(null);

    useEffect(() => {
        if (
            !completedCrop ||
            !imgRef.current ||
            !previewCanvasRef.current ||
            !imgSrc
        ) {
            return;
        }

        const image = imgRef.current;
        const canvas = previewCanvasRef.current;
        const crop = completedCrop;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            return;
        }

        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = crop.width * pixelRatio;
        canvas.height = crop.height * pixelRatio;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );
    }, [completedCrop, imgSrc, imgRef]);

    if (!completedCrop || !imgSrc) {
        return null;
    }

    return (
        <div
            className={cn(
                "overflow-hidden",
                reactCropProps?.circularCrop && "rounded-full",
                className
            )}
            style={style}
        >
            <canvas
                ref={previewCanvasRef}
                className="h-full w-full object-cover"
                style={{
                    width: "100%",
                    height: "100%",
                }}
            />
        </div>
    );
};

export const ImageCropApply = ({
    asChild = false,
    children,
    onClick,
    ...props
}) => {
    const { applyCrop } = useImageCrop();

    const handleClick = async () => {
        const croppedImage = await applyCrop();
        onClick?.(croppedImage);
    };

    if (asChild) {
        return (
            <Slot.Root onClick={handleClick} {...props}>
                {children}
            </Slot.Root>
        );
    }

    return (
        <Button onClick={handleClick} size="icon" variant="ghost" {...props}>
            {children ?? <CropIcon />}
        </Button>
    );
};

export const ImageCropReset = ({
    asChild = false,
    children,
    onClick,
    ...props
}) => {
    const { resetCrop } = useImageCrop();

    const handleClick = e => {
        resetCrop();
        onClick?.(e);
    };

    if (asChild) {
        return (
            <Slot.Root onClick={handleClick} {...props}>
                {children}
            </Slot.Root>
        );
    }

    return (
        <Button onClick={handleClick} size="icon" variant="ghost" {...props}>
            {children ?? <RotateCcwIcon />}
        </Button>
    );
};

export const Cropper = ({
    onChange,
    onComplete,
    onCrop,
    style,
    className,
    file,
    maxImageSize,
    ...props
}) => (
    <ImageCrop
        file={file}
        maxImageSize={maxImageSize}
        onChange={onChange}
        onComplete={onComplete}
        onCrop={onCrop}
        {...props}
    >
        <ImageCropContent className={className} style={style} />
    </ImageCrop>
);
