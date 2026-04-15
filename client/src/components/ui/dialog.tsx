"use client"

import * as React from "react"
import { Modal, ModalBody, ModalHeader, ModalFooter } from "@heroui/react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = Modal
const DialogTrigger = Modal as any

const DialogContent = React.forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode; onClose?: () => void }
>(({ className, children, onClose, ...props }, ref) => (
  <Modal
    ref={ref}
    isOpen={true}
    onClose={onClose || (() => {})}
    className={cn("bg-gray-900 border border-gray-800 text-gray-100", className)}
    {...props}
  >
    <ModalHeader className="flex flex-col gap-1">
      {children}
    </ModalHeader>
    <button
      onClick={onClose}
      className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
    >
      <X className="h-4 w-4" />
    </button>
  </Modal>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2", className)} {...props} />
)
DialogFooter.displayName = "DialogFooter"

const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <ModalBody className={cn("py-4", className)} {...props} />
)
DialogBody.displayName = "DialogBody"

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-lg font-semibold text-white", className)} {...props} />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-gray-400", className)} {...props} />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogBody,
  DialogTitle,
  DialogDescription,
}
