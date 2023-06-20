import { addOrdinary } from '@/services/ordinary';
import { formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import ProTable, { ProColumns } from '@/components/ProTable';
import { Button, Descriptions, Modal } from 'antd';
import { history, useModel } from 'umi';
import styles from './style.less';

type PropsType = {
	visible: boolean;
	onCancel: () => void;
	selectedList: Record<string, any>[];
	paramslist: any;
	same: string;
	ordinaryName: string;
};

const CheckModal = ({
	visible,
	onCancel,
	selectedList,
	paramslist,
	same,
	ordinaryName,
}: PropsType) => {
	const { fields } = useModel('fieldsMapping');

	const handleCancel = () => onCancel();

	const handleSubmit = async () => {
		const res = await addOrdinary(paramslist);
		if (res && res.code === 0) {
			notification.success('操作成功');
			onCancel();
			history.push(`/base_data/ordinary`);
		}
	};

	let submitColumns: ProColumns<NewGoodsTypesController.GoodsRecord>[] = [
		{
			title: '序号',
			width: 80,
			dataIndex: 'number',
			key: 'number',
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: fields.goodsCode,
			width: 150,
			dataIndex: 'materialCode',
			key: 'materialCode',
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			width: 160,
			dataIndex: 'name',
			key: 'name',
			ellipsis: true,
		},
		{
			title: '规格/型号',
			width: 150,
			dataIndex: 'Specification',
			key: 'Specification',
			ellipsis: true,
			render: (text: any, record: Record<string, any>) => {
				return (
					<span>
						{formatStrConnect(record, [
							record.goodsSpecification ? 'goodsSpecification' : 'specification',
							'model',
						])}
					</span>
				);
			},
		},
		{
			title: '生产厂家',
			width: 150,
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			ellipsis: true,
		},
	];

	return (
		<Modal
			visible={visible}
			width={'80%'}
			maskClosable={false}
			title='新增医耗套包详情'
			onCancel={onCancel}
			footer={[
				<Button
					key='back'
					onClick={handleCancel}>
					取消
				</Button>,
				<Button
					key='submit'
					type='primary'
					onClick={handleSubmit}>
					确认
				</Button>,
			]}>
			<>
				<div className={styles.detailWrap}>
					<div className={styles.left}>
						<Descriptions
							className={styles.headerList}
							size='small'
							column={{ xxl: 3, xl: 2, md: 1, sm: 2, xs: 1 }}>
							<Descriptions.Item label='医耗套包名称'>
								{paramslist ? paramslist.ordinaryName : '-'}
							</Descriptions.Item>
							<Descriptions.Item
								label='医耗套包说明'
								span={2}>
								{paramslist ? paramslist.description : '-'}
							</Descriptions.Item>
						</Descriptions>
					</div>
					<div className={styles.right}>
						<div className={styles.moreInfo}></div>
						<div className={styles.moreInfo}></div>
					</div>
				</div>
				<ProTable
					pagination={false}
					columns={submitColumns}
					dataSource={selectedList}
					options={{ density: false, fullScreen: false, setting: false }}
					scroll={{ x: '100%', y: 300 }}
					tableInfoId='142'
				/>
			</>
			<span style={{ float: 'right', color: CONFIG_LESS['@c_starus_warning'] }}>
				{same
					? `已存在‘${paramslist ? ordinaryName : '-'}’与当前套包${
							fields.goods
					  }相同，是否确认提交？`
					: ''}
			</span>
		</Modal>
	);
};
export default CheckModal;
