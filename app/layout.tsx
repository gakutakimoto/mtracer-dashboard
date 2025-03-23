"use client";

import "./globals.css";
import { NextUIProvider } from "@nextui-org/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>スイングデータ</title>
      </head>
      <body>
        <NextUIProvider>
          <div className="container">{children}</div>
        </NextUIProvider>
      </body>
    </html>
  );
}