import Tabs from './components/Tabs';

export default ({ ...props }) => (
	<Tabs
		pageType='query'
		match={props.match}
	/>
);
