const pick = (obj: Record<string, any>, keys: string[]) => {
  const finalObj: Record<string, any> = {};
  keys.forEach((key) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      finalObj[key] = obj[key];
    }
  });
  return finalObj;
};

export default pick;