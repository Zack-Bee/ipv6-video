import {useRef, useEffect} from 'react';

const useIntervalImediately = (intervalCallback, time, dependences) => {
  const timerRef = useRef();
  useEffect(() => {
    if (!timerRef.current) {
      intervalCallback(dependences);
    } else {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      intervalCallback(dependences);
    }, time);
    return () => {
      clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependences);
};

export default useIntervalImediately;
