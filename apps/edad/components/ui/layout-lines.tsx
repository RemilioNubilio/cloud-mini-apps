import * as React from "react";

import { cn } from "@/lib/utils";

export interface LayoutLinesProps extends React.ComponentProps<"section"> {}

function LayoutLines({ className, ...props }: LayoutLinesProps) {
  return (
    <section
      className={cn("pointer-events-none fixed inset-0 top-0", className)}
      {...props}
    >
      <div className="max-w-container line-y line-dashed mx-auto flex h-full flex-col"></div>
    </section>
  );
}

export { LayoutLines };

