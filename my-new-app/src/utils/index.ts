const getCurrentDate = () => {
  let time = new Date();
  let timeInfo =
    time.getFullYear() +
    "-" +
    time.getMonth() +
    "-" +
    time.getDate() +
    " " +
    time.getHours() +
    ":" +
    time.getMinutes();

  return timeInfo;
};

export { getCurrentDate };
