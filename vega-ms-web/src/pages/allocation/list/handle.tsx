import List from './components/index';

export default (props: Record<string, any>) => (
	<List
		{...props}
		pageType='handle'
	/>
);
