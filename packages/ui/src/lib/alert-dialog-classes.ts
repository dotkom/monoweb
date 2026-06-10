export const alertDialogOverlayClass =
  "fixed inset-0 isolate z-50 bg-[var(--backdrop)] duration-200 supports-backdrop-filter:backdrop-blur-sm motion-reduce:backdrop-blur-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"

export const alertDialogContentClass =
  "group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl bg-popover p-5 text-popover-foreground shadow-overlay ring-1 ring-border/40 duration-200 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 sm:p-6 data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm"

export const alertDialogHeaderClass =
  "grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]"

export const alertDialogFooterClass =
  "-mx-5 -mb-5 flex flex-col-reverse gap-2 rounded-b-2xl border-t border-border/40 bg-muted/20 p-5 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:-mx-6 sm:-mb-6 sm:flex-row sm:justify-end sm:p-6"

export const alertDialogMediaClass =
  "mb-2 inline-flex size-10 items-center justify-center rounded-md bg-muted sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-6"

export const alertDialogTitleClass =
  "text-base font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2"

export const alertDialogDescriptionClass =
  "text-sm text-balance text-muted-foreground md:text-pretty *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground"

export const alertDialogSizeExtensionClasses = {
  lg: "data-[size=lg]:max-w-xl data-[size=lg]:md:max-w-2xl",
} as const
