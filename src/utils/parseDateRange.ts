export const parseDateRange = (
  dateRange: string,
  time: string
): { startDate: string; endDate: string } => {
  const decodedDateRange = decodeURIComponent(dateRange);
  const [startDate, endDate] = decodedDateRange.split(" - ").map((date) => {
    const [month, day, year] = date.split("/");
    return `${year}-${month}-${day}T${time}`;
  });

  return { startDate, endDate };
};
