import React from "react";
import { debounce } from "lodash";

const useScrollHeight = (delay = 100) => {
    const [height, setHeight] = React.useState<number>(window.scrollY);

    React.useEffect(() => {
        function checkHeight() {
            setHeight(window.scrollY);
        }
        const debounceHandleResize = debounce(checkHeight, delay);
        window.addEventListener('scroll', debounceHandleResize);

        return () => {
            window.removeEventListener('scroll', debounceHandleResize);
        }
    })

    return height;
}

export default useScrollHeight;