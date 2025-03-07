import { useState } from "react";

export const useModalState = (initialState: boolean): [boolean, () => void] => {
  const [state, setState] = useState<boolean>(initialState);
  const changeState = () => setState(!state);
  return [state, changeState];
};