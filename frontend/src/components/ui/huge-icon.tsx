import React from "react";
import { HugeiconsIcon, type HugeiconsProps } from "@hugeicons/react";

export interface HugeIconProps extends Omit<HugeiconsProps, "icon"> {
  icon: any;
  size?: number | string;
  className?: string;
  strokeWidth?: number;
}

export const HugeIcon = React.forwardRef<SVGSVGElement, HugeIconProps>(
  ({ icon, size = 20, className = "", strokeWidth = 1.5, ...props }, ref) => {
    return (
      <HugeiconsIcon
        ref={ref}
        icon={icon}
        size={size}
        className={className}
        strokeWidth={strokeWidth}
        {...props}
      />
    );
  }
);

HugeIcon.displayName = "HugeIcon";

export default HugeIcon;
