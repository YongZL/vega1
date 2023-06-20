import CommonList from './components/CommonList';

export default ({ ...props }) => (
	<CommonList
		pageType='handle'
		match={props.match}
	/>
);
