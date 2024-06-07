export const parseDateRange = (
  dateRange: string,
  time: string
): { start_date: string; finish_date: string } => {
  const decodedDateRange = decodeURIComponent(dateRange);
  const [start_date, finish_date] = decodedDateRange
    .split(" - ")
    .map((date) => {
      const [month, day, year] = date.split("/");
      return `${year}-${month}-${day}T${time}:00Z`;
    });

  return { start_date, finish_date };
};
