import React from "react";

export function Home() {
  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="flex h-full w-full flex-1 flex-col gap-3 rounded-tl-2xl border-l border-t border-neutral-300/80 bg-[#f2eee5] p-4 md:p-10 paper-grain overflow-y-auto">
        <div className="flex gap-3">
          {[...new Array(4)].map((_, idx) => (
            <div
              key={"first-array-demo-1" + idx}
              className="h-20 w-full animate-pulse rounded-2xl bg-white/70 border border-neutral-300/80 shadow-2xs"
            />
          ))}
        </div>
        <div className="flex flex-1 gap-3 min-h-[300px]">
          {[...new Array(2)].map((_, idx) => (
            <div
              key={"second-array-demo-1" + idx}
              className="h-full w-full animate-pulse rounded-2xl bg-white/70 border border-neutral-300/80 shadow-2xs"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
