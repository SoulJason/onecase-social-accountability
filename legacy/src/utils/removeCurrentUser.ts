const removeCurrentUser = (data: any[], userId: string) => {
  return data.map((d) => {
    if (d.user_one.id === userId) {
      delete d.user_one;
      Object.keys(d.user_two).forEach((key) => {
        d[key] = d.user_two[key];
      });
      delete d.user_two;
    } else {
      delete d.user_two;
      Object.keys(d.user_one).forEach((key) => {
        d[key] = d.user_one[key];
      });
      delete d.user_one;
    }
    return d;
  });
};

export default removeCurrentUser;
