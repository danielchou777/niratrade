export const roundToMinute = (date) => {
  date.setSeconds(0);
  date.setMilliseconds(0);
  return Math.floor(date.getTime() / 1000);
};
