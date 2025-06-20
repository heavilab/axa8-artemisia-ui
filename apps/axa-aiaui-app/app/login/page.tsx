import Image from "next/image";

import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            <Image src="/logo.svg" alt="AXA Logo" width={32} height={32} />
          </div>
          <span className="text-xl font-bold">Artemis</span>
        </a>
        <LoginForm />
      </div>
    </div>
  );
}
