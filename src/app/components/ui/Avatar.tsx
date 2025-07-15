import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: unknown[]) {
    return twMerge(clsx(inputs));
}

// --- Root ---
type AvatarRootProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>;

const Avatar = React.forwardRef<HTMLSpanElement, AvatarRootProps>(
    (props, ref: React.ForwardedRef<HTMLSpanElement>) => {
        const { className, ...rest } = props;
        return (
            <AvatarPrimitive.Root
                ref={ref}
                className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
                {...rest}
            />
        );
    }
);
Avatar.displayName = "Avatar";

// --- Image ---
type AvatarImageProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>;

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
    (props, ref: React.ForwardedRef<HTMLImageElement>) => {
        const { className, ...rest } = props;
        return (
            <AvatarPrimitive.Image
                ref={ref}
                className={cn("aspect-square h-full w-full", className)}
                {...rest}
            />
        );
    }
);
AvatarImage.displayName = "AvatarImage";

// --- Fallback ---
type AvatarFallbackProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>;

const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
    (props, ref: React.ForwardedRef<HTMLSpanElement>) => {
        const { className, ...rest } = props;
        return (
            <AvatarPrimitive.Fallback
                ref={ref}
                className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}
                {...rest}
            />
        );
    }
);
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
