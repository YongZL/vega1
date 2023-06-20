import TableBox from '@/components/TableBox';
import { Modal } from 'antd';
import { connect, useModel } from 'umi';

const DetailModal = ({ loading, unconsumeHistory, dispatch, ...props }) => {
	const { fields } = useModel('fieldsMapping');
	const { modalVisible, setModalVisible } = props;
	const { detailList } = unconsumeHistory;

	const columnsModal = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render: (text, record, index) => {
				return <span>{index + 1}</span>;
			},
		},
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 220,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 150,
			ellipsis: true,
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
		},
		{
			title: fields.distributor,
			dataIndex: 'supplierName',
			key: 'supplierName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '反消耗科室',
			dataIndex: 'departmentName',
			key: 'departmentName',
			width: 130,
			ellipsis: true,
		},
	];

	const modal = {
		title: '消耗详情',
		visible: modalVisible,
		maskClosable: false,
		onCancel: () => setModalVisible(false),
		width: '80%',
		footer: false,
		destroyOnClose: true,
	};
	return (
		<Modal
			{...modal}
			className='modalDetails'>
			<TableBox
				columns={columnsModal}
				rowKey={(record, index) => String(index)}
				dataSource={detailList}
				className='mb2'
				options={{ density: false, fullScreen: false, setting: false }}
				scroll={{ x: '100%', y: 300 }}
				tableInfoId='103'
				pagination={false}
				loading={loading}
				size='small'
			/>
		</Modal>
	);
};

export default connect(
	({
		loading,
		unconsumeHistory,
	}: {
		unconsumeHistory;
		loading: { effects: { [key: string]: boolean } };
	}) => ({
		unconsumeHistory,
		loading:
			loading.effects['unconsumeHistory/queryPackageBulkUnConsumeDetails'] ||
			loading.effects['unconsumeHistory/queryPackageSurgicalUnConsumeDetails'],
	}),
)(DetailModal);
