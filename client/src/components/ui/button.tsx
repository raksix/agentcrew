"use client"

import * as React from "react"
import { Button as HeroUIButton, ButtonProps as HeroUIButtonProps } from "@heroui/react"
import { cn } from "@/lib/utils"

// HeroUI variants map to our existing variants
const heroUIVariantMap: Record<string, HeroUIButtonProps["variant"]> = {
  default: "solid",
  destructive: "solid",
  outline: "bordered",
  secondary: "light",
  ghost: "flat",
  link: "light",
}

const heroUISizeMap: Record<string, HeroUIButtonProps["size"]> = {
  default: "md",
  sm: "sm",
  lg: "lg",
  icon: "md",
  "icon-sm": "sm",
  "icon-lg": "lg",
}

export type ButtonProps = {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"
  asChild?: boolean
} & Omit<HeroUIButtonProps, "variant" | "size" | "isDisabled">

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild, isDisabled, children, ...props }, ref) => {
    const isIconOnly = size?.includes("icon")
    const heroVariant = heroUIVariantMap[variant] || "solid"
    const variantClassName = variant === "destructive" ? "bg-red-500 text-white hover:bg-red-600" : ""

    return (
      <HeroUIButton
        ref={ref}
        variant={heroVariant}
        size={heroUISizeMap[size || "default"] || "md"}
        isDisabled={isDisabled}
        isIconOnly={isIconOnly}
        className={cn(
          variantClassName,
          variant === "destructive" && "data-[hover=true]:bg-red-600",
          className
        )}
        {...props}
      >
        {children}
      </HeroUIButton>
    )
  }
)
Button.displayName = "Button"

// Export buttonVariants for use in other components (like MenuItem)
const buttonVariants = {
  variants: {
    default: "bg-cyan-500 text-white hover:bg-cyan-600",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-gray-600 bg-transparent hover:bg-gray-800",
    secondary: "bg-gray-700 text-white hover:bg-gray-600",
    ghost: "hover:bg-gray-800",
    link: "text-cyan-500 underline-offset-4 hover:underline",
  },
  sizes: {
    default: "h-9 px-4 py-2",
    sm: "h-8 px-3",
    lg: "h-10 px-6",
    icon: "h-9 w-9",
    "icon-sm": "h-8 w-8",
    "icon-lg": "h-10 w-10",
  },
}

export { Button, buttonVariants }
