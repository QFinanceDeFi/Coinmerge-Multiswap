import React from "react";
import debounce from "lodash/debounce";

const useWindowWidth = (delay: number) => {
    const [width, setWidth] = React.useState<number>(window.innerWidth);

    React.useEffect(() => {
        function handleResize() {
            setWidth(window.innerWidth);
        }
        const debounceHandleResize = debounce(handleResize, delay);
        window.addEventListener('resize', debounceHandleResize);

        return () => {
            window.removeEventListener('resize', debounceHandleResize);
        }
    }, [delay])

    return width;
}

export default useWindowWidth;