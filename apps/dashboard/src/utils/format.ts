const dateFormatter = new Intl.DateTimeFormat("no-NB", {
    day: "numeric",
    month: "short",
    weekday: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
});

export const formatDate = (date: Date) => dateFormatter.format(date);
