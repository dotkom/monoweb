const dateFormatter = new Intl.DateTimeFormat("no-NB", {
    day: "numeric",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "short",
    weekday: "short",
    year: "numeric",
});

export const formatDate = (date: Date) => dateFormatter.format(date);
