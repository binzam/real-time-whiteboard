import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info, XCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-12 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4 shadow-sm transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-5",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "border-destructive/50 bg-destructive/90 text-white *:data-[slot=alert-description]:text-white *:[svg]:text-current",
        success:
          "border-green-500/50 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 *:data-[slot=alert-description]:text-green-700/90 *:[svg]:text-current",
        info: "border-blue-500/50 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 *:data-[slot=alert-description]:text-blue-700/90 *:[svg]:text-current",
      },
      layout: {
        default: "",
        fixed: "fixed top-16 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full",
        "fixed-bottom":
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full",
        sticky: "sticky top-4 z-50 mb-4 mx-auto max-w-md w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      layout: "default",
    },
  },
);

function Alert({
  className,
  variant,
  layout,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant, layout }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-heading font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className,
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2 right-2", className)}
      {...props}
    />
  );
}

// --- Composed Dynamic Alert for the Hook ---
const icons = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle2,
  info: AlertCircle,
};

export function DynamicAlert({
  variant = "default",
  layout = "default",
  title,
  message,
  onClose,
  className,
}: {
  variant?: "default" | "destructive" | "success" | "info";
  layout?: "default" | "fixed" | "fixed-bottom" | "sticky";
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}) {
  const Icon = icons[variant];

  return (
    <Alert variant={variant} layout={layout} className={className}>
      <Icon />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
      {onClose && (
        <AlertAction>
          <button
            onClick={onClose}
            className="inline-flex size-6 items-center justify-center rounded-md opacity-70 transition-opacity hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Close alert"
          >
            <X className="size-4" />
          </button>
        </AlertAction>
      )}
    </Alert>
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
