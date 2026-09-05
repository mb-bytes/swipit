import { Toaster } from "sileo";
import AppRoutes from "./routes/routes";

export function App() {
  return (
    <>
      <Toaster
        position="top-center"
        options={{
          fill: "#111215",
          styles: {
            title: "font-bold text-white-200",
            description: "text-zinc-400 text-sm text-center!",
          },
        }}
      />
      <AppRoutes />
    </>
  );
}

export default App;
