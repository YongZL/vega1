import { useRef, useEffect } from 'react';

const useDidMount = (fn) => {
	const hasMounted = useRef(false);
	useEffect(() => {
		if (!hasMounted.current) {
			hasMounted.current = true;
			fn && fn();
		}
	}, []);
};

export default useDidMount;
