import type React from "react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeIcon, type HugeIconProps } from "@/components/ui/huge-icon";
import { cn } from "@/lib/utils";

export function Spinner({
  className,
  size = 18,
  ...props
}: Omit<HugeIconProps, "icon">): React.ReactElement {
  return (
    <HugeIcon
      icon={Loading03Icon}
      size={size}
      aria-label="Loading"
      className={cn("animate-spin", className)}
      role="status"
      {...props}
    />
  );
}

