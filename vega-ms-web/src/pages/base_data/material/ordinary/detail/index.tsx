import Breadcrumb from '@/components/Breadcrumb';
import Descriptions from '@/components/Descriptions';
import type { DescriptionsItemProps } from '@/components/Descriptions/typings';
import ProTable from '@/components/ProTable';
import type { ProColumns } from '@/components/ProTable/typings';
import { consumeWay } from '@/constants/dictionary';
import { getDetail } from '@/services/ordinary';
import { formatStrConnect } from '@/utils/format';
import { Card, Divider } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';

type Props = {
	match: {
		params: {
			id: string;
		};
	};
};

const DetailWrap: React.FC<Props> = (props: Record<string, any>) => {
	const { fields } = useModel('fieldsMapping');
	const [list, setList] = useState<OrdinaryController.OrdinaryGoods[]>([]);
	const [ordinaryDepartment, setOrdinaryDepartment] = useState<[string]>(['']);
	const [detail, setDetail] = useState<OrdinaryController.OrdinaryDto>({});
	const [loading, setLoading] = useState<boolean>(false);
	// 列表
	const getDetailInfo = async () => {
		if (loading) {
			return;
		}
		setLoading(true);
		try {
			const res = await getDetail(props.match.params.id);
			if (res && res.code === 0) {
				setDetail(res.data.ordinaryDto || {});
				setList(res.data.ordinaryGoods);
				setOrdinaryDepartment(res.data.ordinaryDepartment);
			}
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		getDetailInfo();
	}, []);

	const columns: ProColumns<OrdinaryController.OrdinaryGoods>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 80,
			align: 'center',
			renderText: (text, record, index) => index + 1,
		},
		{
			title: fields.goodsCode,
			width: 150,
			dataIndex: 'materialCode',
			key: 'materialCode',
		},
		{
			title: fields.goodsName,
			width: 180,
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
			title: '包装规格',
			width: 120,
			dataIndex: 'unitNum',
			key: 'unitNum',
			renderText: (unitNum, record) => {
				return <span>{`${unitNum} ${record.minGoodsUnit}/${record.purchaseGoodsUnit}`}</span>;
			},
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 120,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 150,
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
	];

	const options: DescriptionsItemProps<OrdinaryController.OrdinaryDto>[] = [
		{
			label: '医耗套包编号',
			dataIndex: 'ordinaryCode',
		},
		{
			label: '医耗套包名称',
			dataIndex: 'name',
		},
		{
			label: '状态',
			dataIndex: 'name',
			render: (detail) => (detail ? '已启用' : '已禁用'),
		},
		{
			label: '创建人员',
			dataIndex: 'createdBy',
		},
		{
			label: '创建时间',
			dataIndex: 'timeCreated',
			render: (text, detail) =>
				detail.timeCreated ? moment(Number(detail.timeCreated)).format('YYYY/MM/DD  HH:mm:ss') : '',
		},
		{
			label: '医耗套包说明',
			dataIndex: 'description',
			render: (text, detail) => detail.description || detail.detailGoodsMessage || '-',
		},
		{
			label: '消耗方式',
			dataIndex: 'consumeType',
			render: (text, detail) =>
				detail.consumeType &&
				consumeWay.filter((item) => item.value === detail.consumeType)[0].label,
		},
	];
	return (
		<div className='main-page'>
			<Breadcrumb
				config={[
					'',
					['', { pathname: '/base_data/ordinary', state: 'ordinary' }],
					['', { pathname: '/base_data/ordinary', state: 'ordinary' }],
					'',
				]}
			/>
			<Card bordered={false}>
				<h3
					className='detail_title'
					style={{ fontWeight: 700 }}>
					基本信息
				</h3>
				<Descriptions<OrdinaryController.OrdinaryDto>
					options={options}
					data={detail}
				/>
				<Divider />
				<h3 className='ant-descriptions-title'>关联信息</h3>
				<div>
					关联科室：
					{ordinaryDepartment && ordinaryDepartment.length > 0
						? ordinaryDepartment.map((value, index) => {
								return (
									<span
										key={index}
										className='dis-b'>
										{value}
									</span>
								);
						  })
						: '-'}
				</div>
				<Divider />
				<h3 className='ant-descriptions-title'>医耗套包内容</h3>
				<ProTable
					rowKey='id'
					columns={columns}
					dataSource={list}
					pagination={false}
					loading={loading}
					// tableInfoId="236"
					scroll={{
						x: '100%',
						y: 300,
					}}
				/>
			</Card>
		</div>
	);
};

export default DetailWrap;
