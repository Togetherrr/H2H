"use client"

import React, { MouseEvent, forwardRef } from "react"
import Link, { type LinkProps } from "next/link"
import { useRouter } from "next/navigation"
import { useNavLoading } from "@/components/nav-loading"

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> &
  LinkProps & {
    showLoading?: boolean
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
  }

function isExternalHref(href: LinkProps["href"]) {
  if (typeof href !== "string") return false
  return /^(https?:\/\/|mailto:|tel:)/i.test(href)
}

function hrefToString(href: LinkProps["href"]) {
  if (typeof href === "string") return href
  const pathname = href.pathname ?? ""
  const queryParams = new URLSearchParams()
  if (href.query) {
    for (const [key, value] of Object.entries(href.query)) {
      if (value == null) continue
      if (Array.isArray(value)) {
        for (const v of value) queryParams.append(key, String(v))
      } else {
        queryParams.set(key, String(value))
      }
    }
  }
  const query = queryParams.toString() ? `?${queryParams.toString()}` : ""
  const hash = href.hash ? `#${href.hash.replace(/^#/, "")}` : ""
  return `${pathname}${query}${hash}`
}

export const AppLink = forwardRef<HTMLAnchorElement, Props>(function AppLink(
  { href, replace, scroll, shallow, prefetch, locale, showLoading, onClick, ...rest },
  ref
) {
  const router = useRouter()
  const { start } = useNavLoading()

  const shouldShow = showLoading ?? !isExternalHref(href)
  const hrefString = hrefToString(href)

  return (
    <Link
      ref={ref}
      href={href}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      prefetch={prefetch}
      locale={locale}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        if (e.button !== 0) return
        if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return
        if (rest.target === "_blank") return
        if (hrefString.startsWith("#")) return

        const { pathname, search, hash } = window.location
        const current = `${pathname}${search}${hash}`
        if (hrefString === current) return

        if (shouldShow) {
          e.preventDefault()
          e.stopPropagation()
          // Best-effort warmup for heavy routes (helps reduce the "pause" after overlay appears).
          router.prefetch(hrefString)
          start()
          router.push(hrefString)
        }
      }}
      {...rest}
    />
  )
})
