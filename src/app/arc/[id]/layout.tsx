import Footer from "@/components/landing/Footer";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <section>
      {children}
      <Footer />
    </section>
  );
};

export default layout;
