export default function WindowSize() {
    return (
        <div className="text-foreground absolute top-0 right-0 z-50 flex items-center gap-2 p-1 text-xs font-bold">
            <div>
                <div className="sm:hidden">{"<"} SM</div>
                <div className="hidden sm:block md:hidden">SM</div>
                <div className="hidden md:block lg:hidden">MD</div>
                <div className="hidden lg:block xl:hidden">LG</div>
                <div className="hidden xl:block 2xl:hidden">XL</div>
                <div className="hidden 2xl:block">2XL</div>
            </div>
        </div>
    );
}
