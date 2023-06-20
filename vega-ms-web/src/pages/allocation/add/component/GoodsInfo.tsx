import type { DescriptionsItemProps } from '@/components/Descriptions';
import type { ProColumns } from '@/components/ProTable/typings';

import Descriptions from '@/components/Descriptions';
import ProTable from '@/components/ProTable';
import { consumeWay } from '@/constants/dictionary';
import { getDetail } from '@/services/ordinary';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { Col, Modal, Row, Spin } from 'antd';
import moment from 'moment';
import React, { FC, useEffect, useState } from 'react';
import { useModel } from 'umi';
import style from './goods_info.less';

const GoodsInfo: FC<{
	visible: boolean;
	setVisible: React.Dispatch<React.SetStateAction<boolean>>;
	id: number | undefined;
}> = ({ visible, setVisible, id }) => {
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [detail, setDetail] = useState<OrdinaryController.OrdinaryDto>({});
	const [detailgoos, setDetailgoos] = useState<OrdinaryController.GetDetailQuer>();
	const [detailkeshi, setDetailkeshi] = useState([]);

	const getInfo = async () => {
		setLoading(true);
		const res = await getDetail(id!);
		setLoading(false);
		if (res && res.code === 0) {
			setDetail(res.data.ordinaryDto!);
			setDetailgoos(res.data);
			setDetailkeshi(res.data.ordinaryDepartment);
		}
	};

	const columnsSurgicals: ProColumns<OrdinaryController.OrdinaryGoods>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 60,
			align: 'center',
			render: (_text, _record, index) => index + 1,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 300,
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			key: 'name',
			width: 300,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 100,
			ellipsis: true,
			render: (_text, record) => formatStrConnect(record, ['specification', 'model']),
		},
		{
			title: '包装规格',
			dataIndex: 'specification',
			key: 'specification',
			width: 100,
		},

		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 80,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 200,
		},
		{
			title: '收费项',
			dataIndex: 'chargeName',
			key: 'chargeName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 80,
			align: 'right',
			renderText: (price) => convertPriceWithDecimal(price),
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 300,
		},
	];
	const options: DescriptionsItemProps<OrdinaryController.OrdinaryDto>[] = [
		{
			dataIndex: 'ordinaryCode',
			label: '医耗套包编号',
		},
		{
			dataIndex: 'name',
			label: '医耗套包名称',
		},
		{
			dataIndex: 'menabled',
			label: '状态',
		},
		{
			dataIndex: 'createdBy',
			label: '创建人员',
		},
		{
			dataIndex: 'timeCreated',
			label: '创建时间',
			render: (text) => moment(Number(text)).format('YYYY/MM/DD HH:mm:ss') || '',
		},
		{
			dataIndex: 'description',
			label: '医耗套包说明',
		},
		{
			dataIndex: 'consumeType',
			label: '消耗方式',
			render: (text) => (text ? consumeWay.filter((item) => item.value === text)[0].label : ''),
		},
	];
	useEffect(() => {
		if (visible) {
			getInfo();
		}
	}, [visible]);

	return (
		<Spin spinning={loading}>
			<Modal
				visible={visible}
				maskClosable={false}
				title='查看详情'
				onCancel={() => setVisible(false)}
				footer={null}
				className='ant-detail-modal'>
				<p
					className={style.contentTitle}
					style={{ marginTop: 0 }}>
					基本信息
				</p>
				<Row className='detailsBorder five'>
					<Descriptions<OrdinaryController.OrdinaryDto>
						options={options}
						data={detail as OrdinaryController.OrdinaryDto}
						optionEmptyText='-'
						size='small'
						defaultColumn={4}
						minColumn={3}
					/>
				</Row>
				<p className={style.contentTitle}>关联信息</p>
				<Row className={style.detailWrap + ' detailsBorder'}>
					<Col
						sm={24}
						md={8}
						style={{ margin: ' 0 0 16px 0' }}>
						关联科室：
						{(detailkeshi || []).map((value, index) => {
							return (
								<span
									key={index}
									className={value ? '' : style.default}>
									{value}
									{value ? '（默认）' : ''}
								</span>
							);
						})}
					</Col>
				</Row>
				<ProTable<OrdinaryController.OrdinaryGoods>
					rowKey='id'
					headerTitle='医耗套包内容'
					// tableInfoId="239"
					pagination={false}
					scroll={{ y: 300 }}
					columns={columnsSurgicals}
					bordered={false}
					options={{ density: false, fullScreen: false, setting: false }}
					dataSource={(detailgoos || {}).ordinaryGoods}
				/>
			</Modal>
		</Spin>
	);
};
export default GoodsInfo;
