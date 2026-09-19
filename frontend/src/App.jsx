import { Toaster } from "sileo";
import { Analytics } from "@vercel/analytics/react";
import AppRoutes from "./routes/routes";

export function App() {
  return (
    <>
      <Toaster
        position="top-center"
        options={{
          fill: "#111215",
          styles: {
            title: "font-bold text-white text-[15px]",
            description: "text-neutral-300 text-[14px] font-normal leading-relaxed text-center",
          },
        }}
      />
      <AppRoutes />
      <Analytics />
    </>
  );
}

export default App;
