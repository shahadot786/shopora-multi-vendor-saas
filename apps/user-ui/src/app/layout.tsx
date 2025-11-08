import Header from "@/shared/widgets/header";
import "./global.css";

export const metadata = {
  title: "Shopora",
  description: "A complete eCommerce Platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* header component */}
        <Header />
        {children}
      </body>
    </html>
  );
}
