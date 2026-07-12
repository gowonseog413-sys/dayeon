"use client";



import { useEffect, useState } from "react";

import { useI18n } from "@/components/I18nProvider";

import { api, formatRp } from "@/lib/api";

import { getErpToken } from "@/lib/auth-store";

import { MemberCartModal } from "@/components/erp/MemberCartModal";

import {

  CHANNEL_TYPE_LABEL,

  profileSummary,

  type PaymentProfile,

} from "@/lib/payment-methods";

import { TierBadge } from "@/components/TierBadge";

import type { AdminMember } from "@/lib/types";



type Props = {

  member: AdminMember | null;

  onClose: () => void;

};



function formatDate(iso: string | null) {

  if (!iso) return "-";

  return new Date(iso).toLocaleDateString("ko-KR");

}



function formatDateTime(iso: string | null) {

  if (!iso) return "-";

  return new Date(iso).toLocaleString("ko-KR", {

    year: "numeric",

    month: "numeric",

    day: "numeric",

    hour: "2-digit",

    minute: "2-digit",

    second: "2-digit",

  });

}



function Row({ label, value }: { label: string; value: React.ReactNode }) {

  return (

    <div className="grid grid-cols-[7.5rem_1fr] gap-3 border-b border-gray-100 py-2.5 text-sm last:border-b-0 sm:grid-cols-[8.5rem_1fr]">

      <dt className="font-medium text-gray-500">{label}</dt>

      <dd className="break-all text-base text-gray-900">{value}</dd>

    </div>

  );

}



export function MemberDetailModal({ member, onClose }: Props) {

  const { t, tFmt } = useI18n();

  const [cartOpen, setCartOpen] = useState(false);

  const [paymentProfiles, setPaymentProfiles] = useState<PaymentProfile[]>([]);

  const [paymentsLoading, setPaymentsLoading] = useState(false);



  useEffect(() => {

    if (!member) {

      setPaymentProfiles([]);

      return;

    }

    setPaymentsLoading(true);

    api<{ profiles: PaymentProfile[] }>(`/api/admin/users/${member.id}/payment-profiles`, {

      token: getErpToken(),

    })

      .then((d) => setPaymentProfiles(d.profiles))

      .catch(() => setPaymentProfiles([]))

      .finally(() => setPaymentsLoading(false));

  }, [member?.id]);



  if (!member) return null;



  return (

    <div

      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4"

      role="dialog"

      aria-modal="true"

      aria-labelledby="member-detail-title"

      onClick={onClose}

    >

      <div

        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border bg-white shadow-xl sm:max-w-4xl"

        onClick={(e) => e.stopPropagation()}

      >

        <div className="sticky top-0 flex items-center justify-between border-b bg-gray-50 px-5 py-4 sm:px-6">

          <h3 id="member-detail-title" className="text-lg font-semibold text-gray-900">

            {t("erp.users.detail.title")}

          </h3>

          <button

            type="button"

            onClick={onClose}

            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-200"

            aria-label={t("erp.common.close")}

          >

            ✕

          </button>

        </div>



        <div className="px-5 py-4 sm:px-6 sm:py-5">

          {member.avatarUrl ? (

            // eslint-disable-next-line @next/next/no-img-element

            <img

              src={member.avatarUrl}

              alt=""

              className="mb-4 h-16 w-16 rounded-full border object-cover sm:h-20 sm:w-20"

            />

          ) : null}

          <dl className="sm:grid sm:grid-cols-2 sm:gap-x-8">

            <Row label={t("erp.users.col.name")} value={member.name} />

            <Row

              label={t("erp.users.detail.englishName")}

              value={`${member.firstName || "-"} ${member.lastName || ""}`.trim()}

            />

            <Row label={t("erp.users.col.email")} value={member.email} />

            <Row label={t("erp.users.col.phone")} value={member.phone || "-"} />

            <Row label={t("erp.users.detail.birthDate")} value={member.birthDate || "-"} />

            <Row label={t("erp.users.col.address")} value={member.address || "-"} />

            <Row label={t("erp.users.col.tier")} value={<TierBadge tier={member.tier} size="sm" />} />

            <Row

              label={t("erp.users.detail.role")}

              value={member.role === "admin" ? t("erp.users.detail.roleAdmin") : t("erp.users.detail.roleMember")}

            />

            <Row label={t("erp.users.detail.authProvider")} value={member.authProvider || "local"} />

            <Row label={t("erp.users.col.joinedAt")} value={formatDate(member.createdAt)} />

            <Row label={t("erp.users.col.lastLogin")} value={formatDateTime(member.lastLoginAt)} />

            <Row label={t("erp.users.col.loginCount")} value={member.loginCount} />

            <Row label={t("erp.users.col.totalPurchase")} value={formatRp(member.totalPurchaseAmount)} />

            <Row label={t("erp.users.col.purchaseCount")} value={member.purchaseCount} />

            <Row label={t("erp.users.col.points")} value={formatRp(member.points)} />

            <Row

              label={t("erp.users.col.pointsUsed")}

              value={

                (member.pointsUsed || 0) > 0 ? (

                  <span className="font-medium text-red-600">

                    -{formatRp(member.pointsUsed)}

                  </span>

                ) : (

                  formatRp(0)

                )

              }

            />

            <Row

              label={t("erp.users.col.cart")}

              value={

                member.cartCount > 0 ? (

                  <button

                    type="button"

                    onClick={() => setCartOpen(true)}

                    className="font-medium text-[var(--pink-accent)] underline-offset-2 hover:underline"

                  >

                    {tFmt("erp.users.detail.cartCount", { count: member.cartCount })}

                  </button>

                ) : (

                  "-"

                )

              }

            />

            <Row

              label={t("erp.users.detail.paymentMethods")}

              value={

                paymentsLoading

                  ? t("erp.common.loading")

                  : paymentProfiles.length > 0

                    ? tFmt("erp.users.detail.paymentCount", { count: paymentProfiles.length })

                    : "-"

              }

            />

          </dl>



          <section className="mt-6 border-t border-gray-200 pt-5">

            <h4 className="mb-3 text-sm font-semibold text-gray-900">{t("erp.users.detail.registeredPayments")}</h4>

            {paymentsLoading ? (

              <p className="text-sm text-gray-400">{t("erp.users.detail.loadingPayments")}</p>

            ) : paymentProfiles.length === 0 ? (

              <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">

                {t("erp.users.detail.noPayments")}

              </p>

            ) : (

              <ul className="space-y-2">

                {paymentProfiles.map((p) => (

                  <li

                    key={p.id}

                    className={`rounded-lg border px-4 py-3 text-sm ${

                      p.isDefault

                        ? "border-[var(--pink-accent)]/40 bg-[var(--pink-bg)]/30"

                        : "border-gray-100 bg-gray-50"

                    }`}

                  >

                    <div className="flex flex-wrap items-center justify-between gap-2">

                      <div>

                        <p className="text-xs text-gray-500">{CHANNEL_TYPE_LABEL[p.channelType]}</p>

                        <p className="font-medium text-gray-900">{p.label}</p>

                        <p className="text-gray-600">{profileSummary(p)}</p>

                      </div>

                      {p.isDefault ? (

                        <span className="rounded-full bg-[var(--pink-accent)] px-2 py-0.5 text-[10px] text-white">

                          {t("erp.users.detail.defaultBadge")}

                        </span>

                      ) : null}

                    </div>

                    <p className="mt-1 text-[10px] text-gray-400">

                      {tFmt("erp.users.detail.updatedAt", {

                        date: new Date(p.updatedAt).toLocaleString("ko-KR"),

                      })}

                    </p>

                  </li>

                ))}

              </ul>

            )}

          </section>

        </div>



        <div className="border-t px-5 py-4 sm:px-6">

          <button

            type="button"

            onClick={onClose}

            className="w-full rounded-lg bg-gray-800 py-2.5 text-sm font-medium text-white hover:bg-gray-900"

          >

            {t("erp.common.close")}

          </button>

        </div>

      </div>



      <MemberCartModal

        userId={member.id}

        userName={member.name}

        open={cartOpen}

        onClose={() => setCartOpen(false)}

      />

    </div>

  );

}


