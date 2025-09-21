export default function WindowSize() {
    return (
        <div className="absolute z-50 top-0 right-0 p-1 text-foreground text-xs font-bold">
            <div className="sm:hidden">{"<"} SM</div>
            <div className="hidden sm:block md:hidden">SM</div>
            <div className="hidden md:block lg:hidden">MD</div>
            <div className="hidden lg:block xl:hidden">LG</div>
            <div className="hidden xl:block 2xl:hidden">XL</div>
            <div className="hidden 2xl:block">2XL</div>
        </div>
    );
}
