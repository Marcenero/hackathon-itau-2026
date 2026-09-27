import Link from "next/link";

export default function Header() {
    return (
        <header className="border-b border-[#E5E5E5] bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EC7000] font-bold text-white">
                        P
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#231F20]">
                                Pulso
                            </span>

                            <span className="rounded-full bg-[#FFF0E4] px-2 py-1 text-[10px] font-semibold text-[#C95F00]">
                                MVP
                            </span>
                        </div>

                        <p className="text-xs text-[#666]">
                            Voz do cliente, clareza para a squad
                        </p>
                    </div>
                </Link>

                <nav className="flex items-center gap-2">
                    <Link
                        href="/cliente"
                        className="rounded-lg px-4 py-2 text-sm font-medium text-[#444] transition hover:bg-[#FFF8F3]"
                    >
                        Experiência do cliente
                    </Link>

                    <Link
                        href="/squad"
                        className="rounded-lg bg-[#003C7A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#002E5D]"
                    >
                        Dashboard da squad
                    </Link>

                    <Link
                        href="/squad/pesquisas"
                        className="rounded-lg px-4 py-2 text-sm font-medium text-[#444] transition hover:bg-[#FFF8F3]"
                    >
                        Pesquisas
                    </Link>
                </nav>
            </div>
        </header>
    );
}