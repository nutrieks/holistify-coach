import { useEffect, useRef } from "react";

export const useChatScroll = <T,>(dep: T) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [dep]);

  return ref;
};
