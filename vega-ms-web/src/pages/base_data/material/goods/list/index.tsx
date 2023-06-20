import TabsMax from '@/components/TabsMax';
import { useModel } from 'umi';
import GoodsList from './components/GoodsList';
import ResupplySettingList from './components/ResupplySettingList';

const Goods = ({ ...props }) => {
	const { fields } = useModel('fieldsMapping');
	const tabsList = [
		{
			name: fields.baseGoods!,
			key: 'goods',
			Tab: GoodsList,
		},
		{
			name: '补货设置',
			key: 'relate_goods',
			permissions: 'resupply_setting_list',
			Tab: ResupplySettingList,
		},
	];
	const config = ['', '', ''];
	return (
		<TabsMax
			tabsList={tabsList}
			config={config}
			match={props.match}
		/>
	);
};

export default Goods;
