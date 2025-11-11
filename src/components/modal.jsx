"use client";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

function Modal({ ...props }) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <Drawer {...props} />;
    }

    return <Dialog {...props} />;
}

function ModalTrigger({ ...props }) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <DrawerTrigger {...props} />;
    }

    return <DialogTrigger {...props} />;
}

function ModalClose({ ...props }) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <DrawerClose {...props} />;
    }

    return <DialogClose {...props} />;
}

function ModalContent({ className, children, showCloseButton = true, ...props }) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <DrawerContent className={className} {...props}>
                {children}
            </DrawerContent>
        );
    }

    return (
        <DialogContent className={className} showCloseButton={showCloseButton} {...props}>
            {children}
        </DialogContent>
    );
}

function ModalHeader({ ...props }) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <DrawerHeader {...props} />;
    }

    return <DialogHeader {...props} />;
}

function ModalFooter({ ...props }) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <DrawerFooter {...props} />;
    }

    return <DialogFooter {...props} />;
}

function ModalTitle({ ...props }) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <DrawerTitle {...props} />;
    }

    return <DialogTitle {...props} />;
}

function ModalDescription({ ...props }) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <DrawerDescription {...props} />;
    }

    return <DialogDescription {...props} />;
}

export {
    Modal,
    ModalTrigger,
    ModalClose,
    ModalContent,
    ModalDescription,
    ModalFooter,
    ModalHeader,
    ModalTitle,
};
