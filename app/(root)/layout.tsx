import { isAuthenticated } from "@/lib/actions/auth.action";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react"

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const authenticated = await isAuthenticated();
  if (!authenticated) redirect("/sign-in");
  return (
    <div className="root-layout">
      <nav>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">MoeJob</h2>
        </Link>
      </nav>
      {children}
    </div>
  )
};

export default RootLayout;
