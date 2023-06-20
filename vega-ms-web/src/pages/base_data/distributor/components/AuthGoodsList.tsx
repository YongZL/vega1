import { DescriptionsItemProps } from '@/components/Descriptions/typings';

import Descriptions from '@/components/Descriptions';
import DownLoad from '@/components/Download';
import Images from '@/components/Images';
import ProTable, { ProTableAction } from '@/components/ProTable';
import { getAuthDetailByAuthId, getAuthGoodInfo } from '@/services/distributorAuthorization';
import { getWithoutPriceList } from '@/services/goodsTypes';
import { getAuthDetailById, getAuthorizationGoods } from '@/services/manufacturerAuthorizations';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { Icon as LegacyIcon } from '@ant-design/compatible';
import { ProColumns } from '@ant-design/pro-table';
import { Button, Divider, Modal, Row } from 'antd';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import defaultSettings from '@/../config/defaultSettings';
import { dealPackNum } from '@/utils/dataUtil';

// 授权基础物资列表
const AuthGoodsList = ({
	visible = false,
	close,
	authId,
	isDetail = false,
	type = '',
}: DistributorAuthorizationController.GoodsListPropsType) => {
	const tableRef = useRef<ProTableAction>();
	const { fields } = useModel('fieldsMapping');
	const [detail, setDetail] = useState<Partial<DistributorAuthorizationController.AuthDetailData>>(
		{},
	);

	useEffect(() => {
		if (isDetail) getAuthDetail();
	}, []);

	const getAuthDetail = async () => {
		let res;
		if (type == 'manufacturer') {
			res = await getAuthDetailById(authId);
		} else {
			res = await getAuthDetailByAuthId({ id: authId });
		}
		if (res && res.code === 0) setDetail(res.data);
	};

	const columns: ProColumns<DistributorController.GoodsList>[] = [
		{
			title: fields.goodsCode,
			width: 180,
			dataIndex: 'materialCode',
			key: 'materialCode',
		},
		{
			title: fields.goodsName,
			width: 150,
			dataIndex: 'name',
			key: 'name',
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 150,
			ellipsis: true,
			render: (text, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '大/中包装',
			width: 120,
			dataIndex: 'largeBoxNum',
			key: 'largeBoxNum',
			align: 'left',
			renderText: (largeBoxNum, record) => dealPackNum(largeBoxNum, record.minGoodsNum),
		},
		{
			title: '单价(元)',
			width: 120,
			dataIndex: 'procurementPrice',
			key: 'procurementPrice',
			align: 'right',
			renderText: (text: number) => <span>{text ? convertPriceWithDecimal(text) : '-'}</span>,
		},
	];

	const descriptionsOptions: DescriptionsItemProps[] = [
		{
			label: `关联${fields.distributor}`,
			dataIndex: 'distributorName',
		},
		{
			label: '授权书签发日期',
			dataIndex: 'authorizationBeginTime',
			render: (text: number) => (text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'),
		},
		{
			label: '授权书有效日期',
			dataIndex: 'authorizationEndTime',
			render: (text: number, record) =>
				`${moment(record.authorizationBeginTime).format('YYYY/MM/DD')}-${
					text ? moment(text).format('YYYY/MM/DD') : '长期有效'
				}`,
		},
		{
			label: '查看授权书',
			dataIndex: 'authorizationImgList',
			render: (text) => (
				<div>
					{(text || []).map((item: string) => {
						return (
							<div>
								<Button>
									<DownLoad url={item}>
										<LegacyIcon
											style={{ cursor: 'pointer', color: defaultSettings.primaryColor }}
											type={'download'}
										/>
										<span style={{ cursor: 'pointer', color: defaultSettings.primaryColor }}>
											下载授权书
										</span>
									</DownLoad>
								</Button>
								<Images url={item} />
							</div>
						);
					})}
				</div>
			),
		},
		{
			label: '备注',
			dataIndex: 'remark',
		},
	];

	return (
		<Modal
			title={isDetail ? '授权书详情' : `${fields.baseGoods}列表`}
			width={'70%'}
			visible={visible}
			onCancel={() => close()}
			footer={null}
			className='ant-detail-modal'>
			{isDetail && (
				<>
					<Row>
						<Descriptions
							options={descriptionsOptions}
							data={detail || {}}
							optionEmptyText='-'
							column={4}
						/>
					</Row>
					<Divider style={{ margin: '0px 0px 16px 0px' }} />
				</>
			)}
			<ProTable<DistributorController.GoodsList>
				columns={columns}
				rowKey='id'
				params={{
					id: ['manufacturer_all', 'custodian_all'].includes(type) ? authId.join() : authId,
				}}
				api={
					type == 'manufacturer'
						? getAuthorizationGoods
						: type == 'custodian'
						? getAuthGoodInfo
						: getWithoutPriceList
				}
				tableRef={tableRef}
				customStyle={false}
				options={{ density: false, fullScreen: false, setting: false }}
				scroll={{ x: '100%', y: 300 }}
			/>
		</Modal>
	);
};

export default AuthGoodsList;
