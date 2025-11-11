import "./global.css";
import Header from "@/shared/widgets/header";
import { Poppins, Roboto, Gugi } from "next/font/google";
import Providers from "./Providers";

export const metadata = {
  title: "Shopora",
  description: "A complete eCommerce Platform.",
};

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-roboto",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${roboto.variable} ${poppins.variable}`}>
      <body>
        <Providers>
          {/* header component */}
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
