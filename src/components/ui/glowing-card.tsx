import * as React from "react"
import { cn } from "@/lib/utils"
import { GlowingEffect } from "@/components/ui/glowing-effect"

interface GlowingCardProps extends React.HTMLAttributes<HTMLDivElement> {
    containerClassName?: string
}

const GlowingCard = React.forwardRef<HTMLDivElement, GlowingCardProps>(
    ({ className, containerClassName, children, ...props }, ref) => (
        <div className={cn("relative h-full rounded-[1.25rem] p-2 md:rounded-[1.5rem] md:p-3 transition-transform duration-300 hover:scale-[1.02]", containerClassName)}>
            <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
                borderWidth={3}
            />
            <div
                ref={ref}
                className={cn(
                    "relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border border-gray-300 dark:border-gray-800 bg-gradient-to-br from-background/80 to-muted/20 p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6 backdrop-blur-sm",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </div>
    )
)
GlowingCard.displayName = "GlowingCard"

export { GlowingCard }
