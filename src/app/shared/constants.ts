export const isDriverNearby = (location1: number[], location2: number[]): boolean => {
  return getDistance(location1, location2) * 100 < 0.3;
};

export const getDistance = ( point1: number[], point2: number[]): number => {
  return Math.sqrt(Math.pow((point1[0] - point2[0]), 2) + Math.pow((point1[1] - point2[1]), 2));
};
