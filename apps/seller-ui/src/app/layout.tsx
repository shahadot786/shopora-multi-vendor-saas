import "./global.css";
import Providers from "./Providers";

export const metadata = {
  title: "Shopora Seller",
  description: "Welcome to Shopora Seller Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
