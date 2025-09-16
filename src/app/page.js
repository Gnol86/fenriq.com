export default function Home() {
    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <h1 className="text-4xl font-bold">👋 Hello, I'm Arnaud</h1>
                <p className="text-lg">
                    I'm a software engineer, I love to code, and I'm passionate
                    about open source.
                </p>
            </main>
        </div>
    );
}
