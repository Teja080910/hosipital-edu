import { PageTransition } from "@/components/page-transition";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExamLoading() {
  return (
    <PageTransition>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="space-y-4 w-full">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
