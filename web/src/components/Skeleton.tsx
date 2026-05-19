export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function ArticleListSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-7 md:gap-8">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[16/10]" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[16/9] sm:aspect-[16/8]" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
