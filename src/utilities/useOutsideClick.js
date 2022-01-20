import { useEffect, useState } from "react";

export default function useOutsideClick(ref) {
    const [isClicked, setIsClicked] = useState(false);
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsClicked(false);
            } else {
                setIsClicked(true);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref]);
    return { isClicked, setIsClicked };
}
