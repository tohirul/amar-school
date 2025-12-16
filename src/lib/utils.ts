// IT APPEARS THAT BIG CALENDAR SHOWS THE LAST WEEK WHEN THE CURRENT DAY IS A WEEKEND.
// FOR THIS REASON WE'LL GET THE LAST WEEK AS THE REFERENCE WEEK.
// IN THE TUTORIAL WE'RE TAKING THE NEXT WEEK AS THE REFERENCE WEEK.

const getLatestMonday = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const latestMonday = today;
  latestMonday.setDate(today.getDate() - daysSinceMonday);
  return latestMonday;
};

export const adjustScheduleToCurrentWeek = (
  periods: { title: string; start: Date; end: Date }[]
): { title: string; start: Date; end: Date }[] => {
  const latestMonday = getLatestMonday();

  return periods.map((period) => {
    const periodDayOfWeek = period.start.getDay();

    const daysFromMonday = periodDayOfWeek === 0 ? 6 : periodDayOfWeek - 1;

    const adjustedStartDate = new Date(latestMonday);

    adjustedStartDate.setDate(latestMonday.getDate() + daysFromMonday);
    adjustedStartDate.setHours(
      period.start.getHours(),
      period.start.getMinutes(),
      period.start.getSeconds()
    );
    const adjustedEndDate = new Date(adjustedStartDate);
    adjustedEndDate.setHours(
      period.end.getHours(),
      period.end.getMinutes(),
      period.end.getSeconds()
    );

    return {
      title: period.title,
      start: adjustedStartDate,
      end: adjustedEndDate,
    };
  });
};
