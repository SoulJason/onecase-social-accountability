const groupBy = <T>(array: T[], predicate: (v: T) => string) =>
  array.reduce((acc, value) => {
    if (!acc[predicate(value)]) {
      (acc[predicate(value)] = [] as T[]).push(value);
    } else {
      acc[predicate(value)].push(value);
    }
    // (acc[predicate(value)] ||= []).push(value); // ES2021/ES12
    return acc;
  }, {} as { [key: string]: T[] });

export default groupBy;
