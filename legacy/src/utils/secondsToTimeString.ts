const secondsToTimeString = (seconds: number) => {
  const hoursSpent = Math.floor(seconds / 3600);
  const minutesSpent = Math.floor((seconds % 3600) / 60);
  const secondsSpent = Math.floor((seconds % 3600) % 60);

  const hrs =
    hoursSpent > 0 ? hoursSpent + (hoursSpent === 1 ? ' hr, ' : ' hrs, ') : '';
  const mins =
    minutesSpent > 0
      ? minutesSpent + (minutesSpent === 1 ? ' min, ' : ' mins, ')
      : '';
  const secs =
    secondsSpent > 0
      ? secondsSpent + (secondsSpent === 1 ? ' sec' : ' secs')
      : '';
  const updateTitle = `${hrs}${mins}${secs}`;
  console.log('updateTitle', updateTitle);
  return updateTitle;
};

export default secondsToTimeString;
