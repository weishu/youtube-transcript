import type { Metadata } from "next";
  import "./globals.css";

  export const metadata: Metadata = {
    title: "YouTube 字幕提取器",
    description: "输入 YouTube 链接，获取视频字幕",
  };

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="zh-CN">
        <body className="antialiased min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
          {children}
        </body>
      </html>
    );
  }

  ---
