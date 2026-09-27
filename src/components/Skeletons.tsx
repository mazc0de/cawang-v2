

export function CardSkeleton() {
  return (
    <div className="glass-card rounded-[24px] p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-200"></div>
        <div className="w-20 h-6 rounded-full bg-slate-200"></div>
      </div>
      <div className="w-32 h-6 rounded-md bg-slate-200 mb-2"></div>
      <div className="w-48 h-8 rounded-md bg-slate-200"></div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="glass-card rounded-[24px] p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-200"></div>
        <div className="flex gap-2">
          <div className="w-16 h-6 rounded-full bg-slate-200"></div>
          <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
          <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
        </div>
      </div>
      <div className="w-32 h-6 rounded-md bg-slate-200"></div>
    </div>
  );
}

export function BudgetCardSkeleton() {
  return (
    <div className="glass-card rounded-[24px] p-6 flex flex-col gap-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200"></div>
          <div className="w-32 h-6 rounded-md bg-slate-200"></div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-200"></div>
      <div className="flex justify-between">
        <div className="w-24 h-4 rounded-md bg-slate-200"></div>
        <div className="w-24 h-4 rounded-md bg-slate-200"></div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-200"></div>
            <div className="flex flex-col gap-2">
              <div className="w-40 h-5 rounded-md bg-slate-200"></div>
              <div className="w-24 h-4 rounded-md bg-slate-200"></div>
            </div>
          </div>
          <div className="w-24 h-4 rounded-md bg-slate-200 hidden md:block"></div>
          <div className="w-32 h-5 rounded-md bg-slate-200"></div>
          <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200"></div>
            <div className="flex flex-col gap-2">
              <div className="w-32 h-5 rounded-md bg-slate-200"></div>
              <div className="w-24 h-4 rounded-md bg-slate-200"></div>
            </div>
          </div>
          <div className="w-24 h-5 rounded-md bg-slate-200"></div>
        </div>
      ))}
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-4 animate-pulse">
      {[...Array(35)].map((_, i) => (
        <div key={i} className="h-28 rounded-[20px] bg-slate-100"></div>
      ))}
    </div>
  );
}
