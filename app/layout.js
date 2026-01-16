// app/layout.js
import { Sarabun } from "next/font/google";
import "./globals.css";

// โหลด Font Sarabun มาเตรียมไว้
const sarabun = Sarabun({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
});

export const metadata = {
  title: "Elderly Care Smart Label NPR",
  description: "ระบบผู้ช่วยอ่านฉลากยาและแจ้งเตือนอัจฉริยะ โรงพยาบาลนพรัตนราชธานี",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      {/* บังคับใช้ className ของ sarabun โดยตรงที่ body */}
      <body className={`${sarabun.className} bg-slate-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}