// Root layout — minimal shell. The [locale] layout provides html+body+fonts.
// next-intl pattern: locale-specific layout owns the html/body structure.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return children as any;
}
