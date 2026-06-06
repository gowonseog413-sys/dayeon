"use client";



import Link from "next/link";

import { usePathname } from "next/navigation";



const LINKS = [

  { href: "/profile", label: "내 정보" },

  { href: "/profile/points", label: "포인트 · 등급" },

  { href: "/profile/orders", label: "주문 내역" },

  { href: "/profile/wishlist", label: "장바구니 · 위시" },

  { href: "/profile/reviews", label: "작성 리뷰" },

];



function isProfileActive(pathname: string) {

  return (

    pathname === "/profile" ||

    pathname === "/profile/address" ||

    pathname === "/profile/payment"

  );

}



export function ProfileSidebar() {

  const pathname = usePathname();



  return (

    <aside className="w-full shrink-0 rounded-2xl border-2 border-[var(--pink-border)] bg-white p-4 text-sm shadow-[0_4px_18px_var(--pink-shadow)] md:w-48">

      <nav className="flex flex-row flex-wrap gap-1 md:flex-col md:gap-0">

        {LINKS.map((link) => {

          const active =

            (link.href === "/profile" && isProfileActive(pathname)) ||

            pathname === link.href ||

            (link.href === "/profile/orders" && pathname === "/account");

          return (

            <Link

              key={link.href}

              href={link.href}

              className={`rounded-xl px-3 py-2 transition ${

                active

                  ? "bg-[var(--pink-bg)] font-semibold text-[var(--pink-accent)]"

                  : "text-gray-700 hover:bg-[var(--pink-bg-soft)] hover:text-[var(--pink-accent)]"

              }`}

            >

              {link.label}

            </Link>

          );

        })}

      </nav>

    </aside>

  );

}

