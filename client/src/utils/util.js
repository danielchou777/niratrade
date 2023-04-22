export const toFormatedTime = (created_at) => {
  const date = new Date(created_at);
  let month = date.getMonth() + 1;
  month = month < 10 ? '0' + month : month;
  let day = date.getDate();
  day = day < 10 ? '0' + day : day;
  let hour = date.getHours();
  hour = hour < 10 ? '0' + hour : hour;
  let minute = date.getMinutes();
  minute = minute < 10 ? '0' + minute : minute;
  let second = date.getSeconds();
  second = second < 10 ? '0' + second : second;

  const time = month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
  return time;
};
