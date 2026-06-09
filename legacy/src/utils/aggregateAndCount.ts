const aggregateAndCount = <T>(
  arr: T[],
  keys: string[],
  uniqueId?: any
): T[] => {
  const res: any = {};
  arr.forEach((obj: any) => {
    let masterKey = '';
    keys.forEach((key) => {
      masterKey = masterKey.concat(`${obj[key]}`);
    });
    if (!res[masterKey]) {
      if (uniqueId) {
        res[masterKey] = { ...obj, [uniqueId]: [], count: 0 };
      } else {
        res[masterKey] = { ...obj, count: 0 };
      }
    }
    res[masterKey].count += 1;
    if (uniqueId) {
      res[masterKey][uniqueId].push(obj[uniqueId]);
    }
  });
  return Object.values(res);
};

export default aggregateAndCount;
