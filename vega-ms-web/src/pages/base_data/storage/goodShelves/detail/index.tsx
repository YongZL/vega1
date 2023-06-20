import Breadcrumb from '@/components/Breadcrumb';
import ProTable from '@/components/ResizableTable';
import Descriptions from '@/components/Descriptions';
import type { DescriptionsItemProps } from '@/components/Descriptions/typings';
import SimplePrint from '@/components/print/simple';
import Target from '@/components/print/storage_cabinet';
import { storageGetDetail } from '@/services/storageCabinets';
import { Card, Spin } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import '../../../components/OtherAttachments/style.less';

const PrintTarget = SimplePrint(Target);
type Props = {
	match: {
		params: {
			id: string;
		};
	};
};

const DetailWrap: React.FC<Props> = (props) => {
	const { fields } = useModel('fieldsMapping');
	const [detail, setDetail] = useState<StorageCabinetsController.ItemAddRuleParams>({});
	const [loading, setLoading] = useState<boolean>(false);
	const [locations, setLocations] = useState<StorageCabinetsController.DetailListRuleParamsList[]>(
		[],
	);

	const getDetailInfo = async () => {
		if (loading) {
			return;
		}
		setLoading(true);
		try {
			const res = await storageGetDetail(props.match.params.id);
			if (res && res.code === 0) {
				setDetail(res.data);
				setLocations(res.data.locations);
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getDetailInfo();
	}, []);
	interface DataItem1 {
		remark: string;
	}

	let options: DescriptionsItemProps<StorageCabinetsController.ItemAddRuleParams>[] = [
		{
			label: '货架名称',
			dataIndex: 'name',
			render: (detail) => detail || '-',
		},
		{
			label: '所属仓库',
			dataIndex: 'warehouseName',
			render: (detail) => detail || '-',
		},
		{
			label: '所属库房',
			dataIndex: 'storageAreaName',
			render: (detail) => detail || '-',
		},
		{
			label: '创建时间',
			dataIndex: 'timeCreated',
			render: (text, detail) =>
				detail.timeCreated ? moment(detail.timeCreated).format('YYYY/MM/DD HH:mm:ss') : '-',
		},
	];

	let options1: DescriptionsItemProps<DataItem1>[] = [
		{
			label: '备注',
			dataIndex: 'remark',
			span: 4,
		},
	];

	let datas1: DataItem1 = {
		remark: detail.remark || '-',
	};

	const columns: Record<string, any>[] = [
		{
			width: 'XXS',
			title: '货位编号',
			dataIndex: 'storageLocBarcode',
			align: 'center',
		},
		{
			width: 'S',
			title: fields.goodsName,
			dataIndex: 'goodsName',
		},
		{
			width: 'S',
			title: '医耗套包名称',
			dataIndex: 'ordinaryName',
		},
		{
			width: 'S',
			title: '操作',
			dataIndex: 'option',
			ellipsis: false,
			render: (_text: string, record: Record<string, any>) => {
				return (
					<div className='operation'>
						<PrintTarget
							title='打印'
							params={{ data: detail, value: record, type: 'single' }}
						/>
					</div>
				);
			},
		},
	];

	return (
		<div className='handle-page'>
			<Spin spinning={loading}>
				<div className='handle-page-breadcrumb'>
					<Breadcrumb
						config={[
							'',
							['', { pathname: '/base_data/storage', state: { key: '2' } }],
							['', { pathname: '/base_data/storage', state: { key: '2' } }],
							'',
						]}
					/>
				</div>
				<Card
					bordered={false}
					className='mb6 card-mt2 handle-page-card'>
					<h3>基本信息</h3>
					<Descriptions<StorageCabinetsController.ItemAddRuleParams>
						options={options}
						data={detail}
						column={4}
						optionEmptyText={'-'}
					/>
					<h3>{fields.goods}上架信息</h3>
					<ProTable<Record<string, any>>
						rowKey={'id'}
						api={undefined}
						dataSource={locations}
						pagination={false}
						scroll={{
							y: 'auto',
						}}
						columns={columns}
						search={false}
						toolBarRender={() => [
							locations.length > 0 && (
								<PrintTarget
									title='全部打印'
									btnType={true}
									params={{ data: detail, type: 'all' }}
								/>
							),
						]}
						options={{ density: false, fullScreen: false, setting: false, reload: false }}
					/>
					<h3 style={{ marginTop: 20 }}>备注信息</h3>
					<Descriptions<DataItem1>
						options={options1}
						data={datas1}
						column={4}
					/>
				</Card>
			</Spin>
		</div>
	);
};

export default DetailWrap;
