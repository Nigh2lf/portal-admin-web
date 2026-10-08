import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BATCH_STATUS_LABEL,
  RUN_STATUS_LABEL,
  type BatchStatus,
  type RunStatus,
} from "./types";

const BATCH_STYLES: Record<BatchStatus, string> = {
  QUEUED: "text-muted-foreground",
  RUNNING: "border-warning/40 text-warning",
  CANCELLING: "border-warning/40 text-warning",
  CANCELLED: "text-muted-foreground",
  SUCCESS: "border-success/30 text-success",
  PARTIAL: "border-warning/40 text-warning",
  FAILED: "border-destructive/40 text-destructive",
};

const BATCH_DOTS: Record<BatchStatus, string> = {
  QUEUED: "bg-muted-foreground/50",
  RUNNING: "bg-warning animate-pulse",
  CANCELLING: "bg-warning animate-pulse",
  CANCELLED: "bg-muted-foreground/50",
  SUCCESS: "bg-success",
  PARTIAL: "bg-warning",
  FAILED: "bg-destructive",
};

const RUN_STYLES: Record<RunStatus, string> = {
  RUNNING: "border-warning/40 text-warning",
  SUCCESS: "border-success/30 text-success",
  FAILED: "border-destructive/40 text-destructive",
  CANCELLED: "text-muted-foreground",
  SKIPPED: "text-muted-foreground",
};

export function BatchStatusBadge({ status }: { status: BatchStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium",
        BATCH_STYLES[status] ?? "text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          BATCH_DOTS[status] ?? "bg-muted-foreground/50",
        )}
        aria-hidden
      />
      {BATCH_STATUS_LABEL[status] ?? status}
    </Badge>
  );
}

export function RunStatusBadge({ status }: { status: RunStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium",
        RUN_STYLES[status] ?? "text-muted-foreground",
      )}
    >
      {status === "RUNNING" && (
        <span
          className="size-1.5 animate-pulse rounded-full bg-warning"
          aria-hidden
        />
      )}
      {RUN_STATUS_LABEL[status] ?? status}
    </Badge>
  );
}
