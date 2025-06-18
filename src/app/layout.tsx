import type { Metadata } from "next";

// 根布局的基础元数据，实际的多语言元数据在 [locale]/layout.tsx 中处理
export const metadata: Metadata = {
  title: "Email Extractor - Extract Email Addresses from Websites",
  description: "Professional website email extraction tool. Enter any website URL to quickly and intelligently extract all email addresses from the page.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 