"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SquadTabs() {
    const pathname = usePathname();

    const tabs = [
        {
            label: "Dashboard",
            href: "/squad",
        },
        {
            label: "Pesquisas",
            href: "/pesquisas",
        },
    ];

    return (
        <nav className="mt-8 flex border-b border-[#e5e5e5]">
            {tabs.map((tab) => {
                const active = pathname === tab.href;

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`border-b-2 px-5 py-3 text-sm font-semibold transition ${
                            active
                                ? "border-[#ec7000] text-[#ec7000]"
                                : "border-transparent text-[#666] hover:text-[#003c7a]"
                        }`}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
}