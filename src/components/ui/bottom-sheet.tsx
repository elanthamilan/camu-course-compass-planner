import * as React from "react"
import { motion, AnimatePresence, PanInfo } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
  showHandle?: boolean
  snapPoints?: number[] // Percentage heights: [50, 80, 100]
  defaultSnap?: number // Index of default snap point
}

const BottomSheet = React.forwardRef<HTMLDivElement, BottomSheetProps>(
  ({ 
    open, 
    onOpenChange, 
    children, 
    title, 
    description, 
    className,
    showHandle = true,
    snapPoints = [50, 80, 100],
    defaultSnap = 1,
    ...props 
  }, ref) => {
    const [currentSnap, setCurrentSnap] = React.useState(defaultSnap)
    const [isDragging, setIsDragging] = React.useState(false)

    const handleClose = () => {
      onOpenChange(false)
    }

    const handleDragEnd = (event: any, info: PanInfo) => {
      setIsDragging(false)
      const velocity = info.velocity.y
      const offset = info.offset.y

      // Close if dragged down significantly or with high velocity
      if (offset > 100 || velocity > 500) {
        handleClose()
        return
      }

      // Snap to nearest snap point based on drag distance
      if (snapPoints.length > 1) {
        const currentHeight = snapPoints[currentSnap]
        const dragPercentage = (offset / window.innerHeight) * 100

        if (dragPercentage > 10 && currentSnap < snapPoints.length - 1) {
          setCurrentSnap(currentSnap + 1)
        } else if (dragPercentage < -10 && currentSnap > 0) {
          setCurrentSnap(currentSnap - 1)
        }
      }
    }

    const currentHeight = snapPoints[currentSnap]

    return (
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            {/* Bottom Sheet */}
            <motion.div
              ref={ref}
              className={cn(
                "fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl z-50 flex flex-col",
                className
              )}
              style={{ height: `${currentHeight}vh` }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ 
                type: "spring", 
                damping: 30, 
                stiffness: 300,
                duration: isDragging ? 0 : undefined
              }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.2 }}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
              {...props}
            >
              {/* Handle */}
              {showHandle && (
                <div className="flex justify-center py-3 cursor-grab active:cursor-grabbing">
                  <div className="w-12 h-1 bg-gray-300 rounded-full" />
                </div>
              )}

              {/* Header */}
              {(title || description) && (
                <div className="flex-shrink-0 px-4 pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {title && (
                        <h2 className="text-lg font-semibold text-gray-900">
                          {title}
                        </h2>
                      )}
                      {description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClose}
                      className="h-8 w-8 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }
)

BottomSheet.displayName = "BottomSheet"

export { BottomSheet }
