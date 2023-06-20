import Error403 from '@/pages/403';
import Error404 from '@/pages/404';
import { Access, useAccess } from 'umi';

const auth = ({ route, children }) => {
	const access = useAccess();
	const isHasAccess = !route.access || access[route.access];

	return (
		<Access
			accessible={isHasAccess}
			fallback={route.access ? <Error403 /> : <Error404 />}>
			{children}
		</Access>
	);
};

export default auth;
