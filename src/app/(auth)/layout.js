export default function RootLayout({ children }) {
    return (
        <div className="min-h-dvh flex flex-col items-center justify-center p-4">
            <main>{children}</main>
        </div>
    );
}
