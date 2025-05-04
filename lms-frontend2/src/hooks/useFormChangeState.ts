import { useState } from "react";

const useFormChangeState = (defualtState: boolean  = false) => {
    const [state, setState] = useState<boolean>(defualtState);

    return {
        state,
        setState,
    }
}

export default useFormChangeState;