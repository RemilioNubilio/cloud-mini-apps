import * as React from "react";

import { cn } from "@/lib/utils";

export interface SectionProps extends React.ComponentProps<"section"> {}

function Section({ className, ...props }: SectionProps) {
  return (
    <section
      data-slot="section"
      className={cn("line-b px-4 py-12 sm:py-24 md:py-32", className)}
      {...props}
    />
  );
}

export { Section };

