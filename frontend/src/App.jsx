import React from "react";
import { sileo, Toaster } from "sileo";
import AppRoutes from "./Routes";

export function App() {
  return (
    <>
      <Toaster
        position="top-center"
        options={{
          fill: "#000000",
          styles: { description: "text-white/75 text-center!" },
        }} />
      <AppRoutes />
    </>
  );
}

export default App;
