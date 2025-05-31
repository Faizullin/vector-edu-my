import type { MatchingElement } from "./schema";

export const getElementFileKey = (element: MatchingElement) => {
  return `file-${element.uid}`;
};

export const generateCoupleTrackId = (
  firstElement: MatchingElement,
  secondElement: MatchingElement
) => {
  return `couple${firstElement.uid}-${secondElement.uid}`;
};
