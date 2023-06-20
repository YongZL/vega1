import { DescriptionsItemProps } from '@/components/Descriptions/typings';

import Descriptions from '@/components/Descriptions';
import DownloadWithLabel from '@/components/DownloadWithLabel';
import Images from '@/components/Images';
import { getAllGoods12, getAllGoods18 } from '@/services/category';
import { getDistributorDetail } from '@/services/distributor';
import { businessScope } from '@/utils/dataUtil';
import { formatMoney } from '@/utils/format';
import { Col, Divider, Row, Tree } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import '../../add/style.less';
import OtherAttachmentsDetail from '../../../components/OtherAttachments/detail';

const CompanyInfo = ({ id }: { id: number }) => {
	const { fields } = useModel('fieldsMapping');
	const [detail, setDetail] = useState<Partial<DistributorController.DetailData>>({});
	const [goodsCategory12, setGoodsCategory12] = useState<CategoryController.TypeData[]>([]); // 12版经营范围
	const [goodsCategory18, setGoodsCategory18] = useState<CategoryController.TypeData[]>([]); // 18版经营范围

	useEffect(() => {
		const getTypeList12 = async () => {
			let res = await getAllGoods12({});
			if (res && res.code === 0) {
				setGoodsCategory12(res.data);
			}
		};
		getTypeList12();

		const getTypeList18 = async () => {
			let result = await getAllGoods18({});
			if (result && result.code === 0) {
				setGoodsCategory18(result.data);
			}
		};
		getTypeList18();
	}, []);

	useEffect(() => {
		const queryGoodsLists = async () => {
			const res = await getDistributorDetail({ id });
			if (res && res.code === 0) setDetail(res.data);
		};
		if (id) queryGoodsLists();
	}, [id]);

	const renderTreeNodes12 = (nodes: Record<string, any>[]) =>
		nodes.map((item) => {
			if (item.children) {
				return (
					<Tree.TreeNode
						title={item.code}
						key={`parent${item.id}`}>
						{renderTreeNodes12(item.children)}
					</Tree.TreeNode>
				);
			}
			return (
				<Tree.TreeNode
					key={item.id}
					title={item.code}
					className='treeLeaf'
				/>
			);
		});

	const renderTreeNodes18 = (nodes: Record<string, any>[]) =>
		nodes.map((item) => {
			if (item.children) {
				return (
					<Tree.TreeNode
						title={item.code}
						key={`parent${item.id}`}>
						{renderTreeNodes18(item.children)}
					</Tree.TreeNode>
				);
			}
			return (
				<Tree.TreeNode
					key={item.id}
					title={item.code}
					className='treeLeaf'
				/>
			);
		});

	// 营业执照
	const business_license: Partial<DistributorController.LicenseBusiness> =
		(detail && detail.licenseDistributorBusiness) || {};
	// 生产许可
	const permit_license: Partial<DistributorController.LicensePermit> =
		(detail && detail.licenseDistributorPermit) || {};
	// 备案凭证
	const record_license: Record<string, any> = (detail && detail.distributorRecordVoucher) || {};
	// 其他附件
	const otherAttachments_license: Record<string, any> = (detail && detail.otherAttachments) || {};

	const basicOptions: DescriptionsItemProps[] = [
		{
			label: `${fields.distributor}名称`,
			dataIndex: 'companyName',
		},
		{
			label: `ePS${fields.distributor}编号`,
			dataIndex: 'epsDruggistCode',
			show: WEB_PLATFORM === 'DS',
		},
		{
			label: `平台${fields.distributor}码`,
			dataIndex: 'platformCode',
			show: WEB_PLATFORM === 'DS',
		},
		{
			label: `${fields.distributor}类型`,
			dataIndex: 'companyType',
		},
		{
			label: `${fields.distributor}国别`,
			dataIndex: 'nationality',
		},
		{
			label: '所在国家',
			dataIndex: 'country',
		},
		{
			label: '地址',
			dataIndex: 'mergeName',
		},
		{
			label: '省平台编号',
			dataIndex: 'provincePlatformCode',
		},
		{
			label: '具体地址',
			dataIndex: 'address',
		},
		{
			label: `${fields.distributor}法人`,
			dataIndex: 'companyLegalPerson',
		},
		{
			label: `${fields.distributor}登记人`,
			dataIndex: 'registrant',
		},
		{
			label: `${fields.distributor}负责人`,
			dataIndex: 'principalName',
		},
		{
			label: `${fields.distributor}性质`,
			dataIndex: 'companyNature',
		},
		{
			label: '开户银行',
			dataIndex: 'depositBank',
		},
		{
			label: '开户银行账号',
			dataIndex: 'bankAccount',
		},
		{
			label: '联系人',
			dataIndex: 'contactName',
		},
		{
			label: '联系电话',
			dataIndex: 'contactTelephone',
		},
		{
			label: '手机',
			dataIndex: 'contactMobilePhone',
		},
		{
			label: '部门',
			dataIndex: 'contactDepartment',
		},
		{
			label: '职务',
			dataIndex: 'contactPosition',
		},
		{
			label: '公司电话',
			dataIndex: 'companyTelephone',
		},
		{
			label: '公司邮箱',
			dataIndex: 'companyEmail',
		},
		{
			label: '公司传真',
			dataIndex: 'companyFax',
		},
		{
			label: '简称',
			dataIndex: 'shortName',
		},
		{
			label: '公司网址',
			dataIndex: 'website',
		},
		{
			label: '备注',
			dataIndex: 'remark',
		},
	];

	const businessLicenseOptions: DescriptionsItemProps[] = [
		{
			label: '营业执照',
			dataIndex: 'licenseImgList',
			render: (text: [string]) => (
				<>
					<div>
						{(text || []).map((item) => {
							return (
								<div>
									<Images url={item} />
									<DownloadWithLabel url={item} />
								</div>
							);
						})}
					</div>
				</>
			),
		},
		{
			label: '统一社会信用代码',
			dataIndex: 'creditCode',
		},
		{
			label: '证照编号',
			dataIndex: 'licenseNo',
		},
		{
			label: '成立时间',
			dataIndex: 'establishedTime',
			render: (text: number, record) =>
				record.establishedTime && moment(text).format('YYYY/MM/DD HH:mm:ss'),
		},
		{
			label: '有效日期',
			dataIndex: 'licenseEndTime',
			render: (text: number, record) => {
				const { licenseBeginTime, licenseEndTime, endTimeIsNull } = record;
				const timeBegin = licenseBeginTime ? moment(licenseBeginTime).format('YYYY/MM/DD') : '/';
				const endTime = licenseEndTime ? moment(licenseEndTime).format('YYYY/MM/DD') : '/';
				const isLong = !endTimeIsNull && !licenseEndTime ? '长期有效' : '/';
				return timeBegin + '-' + (licenseEndTime ? endTime : isLong);
			},
		},
		{
			label: '法定代表人',
			dataIndex: 'legalPerson',
		},
		{
			label: '注册资金',
			dataIndex: 'registeredCapital',
			render: (text: number) => formatMoney(text) + '万',
		},
		{
			label: '币种',
			dataIndex: 'registeredCurrencyName',
		},
		{
			label: `${fields.distributor}类型`,
			dataIndex: 'companyType',
		},
		{
			label: '质量管理人',
			dataIndex: 'qualityManager',
		},
		{
			label: '住所',
			dataIndex: 'qualityManagerAddress',
		},
		{
			label: '生产地址',
			dataIndex: 'productionAddress',
		},
		{
			label: '备注',
			dataIndex: 'remark',
		},
		{
			label: '非医疗器械经营范围',
			dataIndex: 'std95CategoryText',
			render: (text: number[]) => (text || []).join(', '),
		},
		{
			label: '医疗器械经营范围',
			dataIndex: 'categoryText',
			render: (text: number[]) => (text || []).join(', '),
		},
	];

	const permitLicenseOptions: DescriptionsItemProps[] = [
		{
			label: '经营许可证',
			dataIndex: 'permitImgList',
			render: (text: [string], record) =>
				record.permitImg && (
					<>
						<div>
							{text.map((item) => {
								return (
									<div>
										<Images url={item} />
										<DownloadWithLabel url={item} />
									</div>
								);
							})}
						</div>
					</>
				),
		},
		{
			label: '许可证号',
			dataIndex: 'permitNo',
		},
		{
			label: `${fields.distributor}负责人`,
			dataIndex: 'principalName',
		},
		{
			label: '法定代表人',
			dataIndex: 'legalPerson',
		},
		{
			label: '有效日期',
			dataIndex: 'permitEndTime',
			render: (text: number, record) =>
				`${record.permitBeginTime ? moment(record.permitBeginTime).format('YYYY/MM/DD') : '/'}-${
					text ? moment(text).format('YYYY/MM/DD') : '长期有效'
				}`,
		},
		{
			label: '注册地址',
			dataIndex: 'registeredAddress',
		},
		{
			label: '备注',
			dataIndex: 'remark',
		},
		{
			label: '经营范围',
			dataIndex: 'categoryText',
			render: (text: number[]) => (text || []).join(', '),
		},
	];

	const recordLicenseOptions: DescriptionsItemProps[] = [
		{
			label: '备案凭证',
			dataIndex: 'recordVoucherImgList',
			render: (text: [string], record) =>
				record.recordVoucherImg && (
					<>
						<div>
							{text.map((item) => {
								return (
									<div>
										<Images url={item} />
										<DownloadWithLabel url={item} />
									</div>
								);
							})}
						</div>
					</>
				),
		},
		{
			label: '备案编号',
			dataIndex: 'recordNum',
		},
		{
			label: `${fields.distributor}负责人`,
			dataIndex: 'principalName',
		},
		{
			label: '法定代表人',
			dataIndex: 'legalPerson',
		},
		{
			label: '备案日期',
			dataIndex: 'recordTime',
			render: (text: number) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
		},
		{
			label: '经营方式',
			dataIndex: 'operationType',
		},
		{
			label: '住所',
			dataIndex: 'residence',
		},
		{
			label: '经营场所',
			dataIndex: 'businessAddress',
		},
		{
			label: '仓库地址',
			dataIndex: 'warehouseAddress',
		},
		{
			label: '备注',
			dataIndex: 'remark',
		},
	];

	return (
		<div className='info'>
			<div className='row row-1 distributormiddledetil'>
				<h3>基本信息</h3>
				<div>
					<Row>
						<Descriptions
							size='small'
							options={basicOptions}
							data={detail || {}}
							optionEmptyText='-'
							hideIfEmpty
						/>
					</Row>
				</div>
			</div>
			<Divider />

			{/* 营业执照  */}
			<div className='row row-2 distributormiddledetil'>
				<h3 className='mb1'>营业执照</h3>
				<Row>
					{/* 详细描述 */}
					<Descriptions
						options={businessLicenseOptions}
						data={business_license || {}}
						optionEmptyText='-'
						hideIfEmpty
					/>

					{((business_license.std2012CategoryIds &&
						business_license.std2012CategoryIds.length > 0) ||
						(business_license.std2018CategoryIds &&
							business_license.std2018CategoryIds.length > 0)) && (
						<div style={{ fontSize: '14px', color: CONFIG_LESS['@c_body'] }}>经营范围：</div>
					)}
					{business_license.std2012CategoryIds && business_license.std2012CategoryIds.length > 0 && (
						<Col span={24}>
							<div style={{ margin: '10px 0px' }}>12版分类：</div>
							<Tree
								selectable={false}
								className='treeBox'>
								{renderTreeNodes12(
									businessScope(goodsCategory12, business_license.std2012CategoryIds) || [],
								)}
							</Tree>
						</Col>
					)}
					{business_license.std2018CategoryIds && business_license.std2018CategoryIds.length > 0 && (
						<Col span={24}>
							<div style={{ margin: '10px 0px' }}>18版分类：</div>
							<Tree
								selectable={false}
								className='treeBox'>
								{renderTreeNodes18(
									businessScope(goodsCategory18, business_license.std2018CategoryIds) || [],
								)}
							</Tree>
						</Col>
					)}
				</Row>
			</div>
			{WEB_PLATFORM !== 'DS' && (
				<>
					<Divider />
					{/* 经营许可证 */}
					<div className='row row-3 distributormiddledetil'>
						<h3 className='mb1'>经营许可证</h3>
						<Row>
							{/* 详细描述 */}
							<Descriptions
								options={permitLicenseOptions}
								data={permit_license || {}}
								optionEmptyText='-'
								hideIfEmpty
							/>
							{((permit_license.std2012CategoryIds &&
								permit_license.std2012CategoryIds.length > 0) ||
								(permit_license.std2018CategoryIds &&
									permit_license.std2018CategoryIds.length > 0)) && (
								<div style={{ fontSize: '14px', color: CONFIG_LESS['@c_body'] }}>经营范围：</div>
							)}
							{permit_license.std2012CategoryIds && permit_license.std2012CategoryIds.length > 0 && (
								<Col span={24}>
									<div style={{ margin: '10px 0px' }}>12版分类：</div>
									<Tree
										selectable={false}
										className='treeBox'>
										{renderTreeNodes12(
											businessScope(goodsCategory12, permit_license.std2012CategoryIds) || [],
										)}
									</Tree>
								</Col>
							)}
							{permit_license.std2018CategoryIds && permit_license.std2018CategoryIds.length > 0 && (
								<Col span={24}>
									<div style={{ margin: '10px 0px' }}>18版分类：</div>
									<Tree
										selectable={false}
										className='treeBox'>
										{renderTreeNodes18(
											businessScope(goodsCategory18, permit_license.std2018CategoryIds) || [],
										)}
									</Tree>
								</Col>
							)}
						</Row>
					</div>
					<Divider />
					{/* 第二类医疗器械备案凭证 */}
					<div className='row row-3 distributormiddledetil'>
						<h3 className='mb1'>第二类医疗器械备案凭证</h3>
						<Row>
							{/* 详细描述 */}
							<Descriptions
								options={recordLicenseOptions}
								data={record_license || {}}
								optionEmptyText='-'
								hideIfEmpty
							/>
							{((record_license.std2012CategoryIds &&
								record_license.std2012CategoryIds.length > 0) ||
								(record_license.std2018CategoryIds &&
									record_license.std2018CategoryIds.length > 0)) && (
								<div style={{ fontSize: '14px', color: CONFIG_LESS['@c_body'] }}>经营范围：</div>
							)}
							{record_license.std2012CategoryIds && record_license.std2012CategoryIds.length > 0 && (
								<Col span={24}>
									<div style={{ margin: '10px 0px' }}>12版分类：</div>
									<Tree
										selectable={false}
										className='treeBox'>
										{renderTreeNodes12(
											businessScope(goodsCategory12, record_license.std2012CategoryIds) || [],
										)}
									</Tree>
								</Col>
							)}
							{record_license.std2018CategoryIds && record_license.std2018CategoryIds.length > 0 && (
								<Col span={24}>
									<div style={{ margin: '10px 0px' }}>18版分类：</div>
									<Tree
										selectable={false}
										className='treeBox'>
										{renderTreeNodes18(
											businessScope(goodsCategory18, record_license.std2018CategoryIds) || [],
										)}
									</Tree>
								</Col>
							)}
						</Row>
						<Divider />
					</div>
				</>
			)}
			{/* 其他附件 */}
			{detail.otherAttachments && (
				<OtherAttachmentsDetail
					otherAttachments={otherAttachments_license && otherAttachments_license}
				/>
			)}
		</div>
	);
};

export default CompanyInfo;
