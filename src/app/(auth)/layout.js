import { SiteConfig } from "@root/src/site-config";
import Image from "next/image";

export default function RootLayout({ children }) {
    return (
        <main className="flex min-h-dvh flex-col items-center justify-center p-4">
            <div className="mb-4 flex flex-col items-center justify-center">
                <Image
                    src="/images/logo.png"
                    alt="logo"
                    height={75}
                    width={75}
                />
                <span className="text-2xl font-bold">{SiteConfig.title}</span>
            </div>
            {children}
        </main>
    );
}
