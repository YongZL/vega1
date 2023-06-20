import CommonList from './components/CommonList';

export default ({ ...props }) => (
	<CommonList
		pageType='query'
		match={props.match}
	/>
);
