import "./globals.css";
// import {
//   ClerkProvider,
//   SignInButton,
//   SignedIn,
//   SignedOut,
//   UserButton
// } from '@clerk/nextjs'
// import { SessionProvider } from "next-auth/react"
import Providers from '@/components/Providers'

export const metadata = {
  title: "webgenie",
  description: "generate fullstack websites using nlp",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }) {

  return (
    // <ClerkProvider>
    // <SessionProvider>
    <html lang="en">
      <body
        className="bg-dark text-light"
      >
        <Providers>
          {/* <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn> */}
          {children}
        </Providers>
      </body>
    </html>
    // </SessionProvider>
    // </ClerkProvider>
  );
}
