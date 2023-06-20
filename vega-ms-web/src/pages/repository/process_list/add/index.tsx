import type { ProColumns } from '@/components//ProTable/typings';
import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import InputUnit from '@/components/InputUnit';
import ProTable from '@/components/ProTable';
import { getOrdinary } from '@/services/ordinary';
import { add } from '@/services/processingOrder';
import { notification } from '@/utils/ui';
import { Button, Card, Form } from 'antd';
import { cloneDeep } from 'lodash';
import type { FC } from 'react';
import { useState } from 'react';
import { history } from 'umi';
const FormItem = Form.Item;
import { scrollTable } from '@/utils';
// import { searchFormItem4, searchColItem } from '@/constants/formLayout';
// const FormItem = Form.Item;
// const selectLists = [{ name: '定数包', id: 'package_bulk' }, { name: '医耗套包', id: 'ordinary' }]
// { name: '手术套包', id: 'package_surgical' },
type SubmitListType = OrdinaryController.OrdinaryList & { num?: number };
const AddList: FC<{}> = () => {
	// const [list, setList] = useState([]);
	// const [total, setTotal] = useState(0);
	// const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	// const [packageType, setPackageType] = useState('ordinary');
	const [form] = Form.useForm();
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [selectedList, setSelectedList] = useState<SubmitListType[]>([]);
	const [selectedKeys, setSelectedKeys] = useState<number[]>([]);
	// const [selectList, setSelectList] = useState([]);
	// const [form] = Form.useForm();
	// // 列表
	// const getList = async (param: any, type: string) => {
	//   const params = {
	//     isEnabled: true,
	//     ...pageConfig,
	//     ...param,
	//   };
	//   setLoading(true);
	//   let res;
	//   // if (type === 'package_surgical') {
	//   //  res = await getSurgicalList({ stockingUp: true, ...params });
	//   // }
	//   if (type === 'ordinary') {
	//     res = await getOrdinary(params);
	//   }
	//   if (res && res.code === 0) {
	//     setList(res.data.rows);
	//     setTotal(res.data.totalCount);
	//     setPageConfig({ pageNum: res.data.pageNum, pageSize: res.data.pageSize });
	//   }
	//   setLoading(false);
	// };
	// const selectType = (value: string) => {
	//   setPackageType(value);
	//   getList({}, value);
	//   setSelectedList([]);
	//   setSelectedKeys([]);
	// };
	// useEffect(() => {
	//   let tabList = JSON.parse(sessionStorage.getItem('dictionary') || '{}').package_config || [];
	//   tabList.map((value) => {
	//     if (value.text == '医耗套包') {
	//       setSelectList([{ name: '医耗套包', id: 'ordinary' }]);
	//     }
	//   });
	// }, []);

	// 提交
	const listSubmit = () => {
		if (selectedList.length <= 0) {
			notification.warning('请选择要加工的包');
			return;
		}
		form
			.validateFields()
			.then(async () => {
				const params = selectedList.map((item) => {
					return {
						quantity: item.num || 1,
						['ordinaryId']: item.id,
					};
				});
				setSubmitLoading(true);
				const res = await add(params);
				if (res && res.code === 0) {
					notification.success('操作成功');
					history.push(`/repository/process_list`);
				}
				setSubmitLoading(false);
			})
			.catch((error) => {
				for (let i = 0; i < selectedList.length; i++) {
					const { num } = selectedList[i];
					if (!num) {
						scrollTable(Number(i) + 1, 'tableEle');
						break;
					}
				}
			});
	};

	// 修改数量
	const handleChange = (record: SubmitListType, value: number | string) => {
		const submitList = selectedList.map((item) => {
			if (record.id && item.id === record.id) {
				console.log(value);
				item.num = Number(value);
				return item;
			}
			return item;
		});
		setSelectedList(submitList);
	};

	// 删除
	const removeItem = (record: SubmitListType) => {
		const selectedRowKeys = selectedKeys.filter((item) => item !== record.id);
		const submitList = selectedList.filter((item) => item.id !== record.id);
		setSelectedList(submitList);
		setSelectedKeys(selectedRowKeys);
	};

	// 选择
	const selectRow = async (record: OrdinaryController.OrdinaryList, status: boolean) => {
		let selectedRowKeys = cloneDeep(selectedKeys);
		let submitList = cloneDeep(selectedList);

		if (status) {
			selectedRowKeys.push(record.id!);
			submitList.push({ ...record, num: 1 });
		} else {
			selectedRowKeys = selectedRowKeys.filter((item) => item !== record.id);
			submitList = submitList.filter((item) => item.id !== record.id);
		}
		setSelectedKeys(selectedRowKeys);
		setSelectedList(submitList);
	};

	// 全选过滤
	const selectRowAll = (
		status: boolean,
		_selectedRows: OrdinaryController.OrdinaryList[],
		changeRows: OrdinaryController.OrdinaryList[],
	) => {
		let selectedRowKeys = cloneDeep(selectedKeys);
		let submitList = cloneDeep(selectedList);
		if (status) {
			changeRows.forEach((itemSelect: any) => {
				if (!selectedRowKeys.some((item) => item === itemSelect.id)) {
					selectedRowKeys.push(itemSelect.id);
					submitList.push({ ...itemSelect, num: 1 });
				}
			});
		} else {
			changeRows.forEach((itemSelect: any) => {
				selectedRowKeys = selectedRowKeys.filter((item) => item !== itemSelect.id);
				submitList = submitList.filter((item: any) => item.id !== itemSelect.id);
			});
		}
		setSelectedKeys(selectedRowKeys);
		setSelectedList(submitList);
	};

	// 单行点击选中
	const selectRowOfClick = (record: OrdinaryController.OrdinaryList) => {
		if (selectedKeys.some((item) => item === record.id)) {
			selectRow(record, false);
		} else {
			selectRow(record, true);
		}
	};
	const rowSelection = {
		selectedRowKeys: selectedKeys,
		onSelect: selectRow,
		onSelectAll: selectRowAll,
	};

	const columns: ProColumns<OrdinaryController.OrdinaryList>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 80,
			renderText: (_text, _record, index) => index + 1,
		},
		{
			title: '医耗套包编码',
			dataIndex: 'ordinaryCode',
			key: 'ordinaryCode',
			width: 150,
		},
		{
			title: '医耗套包名称',
			dataIndex: 'name',
			key: 'name',
			width: 150,
			ellipsis: true,
		},
		{
			title: '医耗套包说明',
			dataIndex: 'detailGoodsMessage',
			key: 'detailGoodsMessage',
			width: 200,
			render: (_text, record) => (
				<div
					className='detailGoodsMessage'
					title={record.description ? record.description : record.detailGoodsMessage}>
					{record.description ? record.description : record.detailGoodsMessage}
				</div>
			),
		},
	];
	const submitColumns: ProColumns<SubmitListType>[] = columns.concat([
		{
			title: '数量',
			dataIndex: 'num',
			key: 'num',
			width: 100,
			render: (text, record) => {
				const { id, ordinaryCode } = record;
				let name = `${id}${ordinaryCode}`;
				return (
					<FormItem
						preserve={false}
						className='mg0'
						rules={[{ required: true }]}
						name={name}
						initialValue={Number(text ? text : 1)}>
						<InputUnit
							key={id}
							onChange={(value) => {
								handleChange(record, value);
							}}
							unit='包'
							min={1}
							max={999}
							style={{ width: '100px' }}
						/>
					</FormItem>
				);
			},
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			fixed: 'right',
			width: 62,
			render: (text, record: any) => {
				return (
					<div className='operation'>
						<span
							className='handleLink'
							onClick={() => removeItem(record)}>
							删除
						</span>
					</div>
				);
			},
		},
	]);

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', ['', '/repository/process_list'], '']} />
			</div>
			{/* <Form
        form={form}
        {...searchFormItem4}
        labelAlign="left"
        initialValues={{ type: packageType }}
      > */}
			<Card bordered={false}>
				{/* <Col {...searchColItem}>
            <FormItem name="type" label="套包类型">
              <Select onChange={(value: string) => selectType(value)} style={{ width: 200 }}>
                {selectList.map((item) => (
                  <Select.Option value={item.id} key={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </FormItem>
          </Col> */}
				<ProTable<OrdinaryController.OrdinaryList>
					columns={columns}
					rowKey='id'
					api={getOrdinary}
					// beforeSearch={(value) => ({ ...value, isEnabled: true })}
					options={{ density: false, fullScreen: false, setting: false }}
					rowSelection={rowSelection}
					scroll={{ x: '100%', y: 300 }}
					onRow={(record) => ({
						onClick: () => {
							selectRowOfClick(record);
						},
					})}
					tableAlertOptionRender={
						<a
							onClick={() => {
								setSelectedKeys([]);
								setSelectedList([]);
							}}>
							取消选择
						</a>
					}
				/>
			</Card>

			<Card
				bordered={false}
				className='mt2 mb6'>
				<h3>待加工列表</h3>
				<Form form={form}>
					<div id='tableEle'>
						<ProTable<SubmitListType>
							columns={submitColumns}
							rowKey='id'
							// tableInfoId={'232'} //'210'
							dataSource={selectedList}
							scroll={{ x: '100%', y: 300 }}
							pagination={false}
							options={{ density: false, fullScreen: false, setting: false }}
						/>
					</div>
				</Form>
			</Card>

			<FooterToolbar>
				<Button
					className='returnButton'
					onClick={() => {
						history.goBack();
					}}>
					返回
				</Button>
				<Button
					type='primary'
					onClick={listSubmit}
					loading={submitLoading}
					className='verifyButton'>
					确认操作
				</Button>
			</FooterToolbar>
			{/* </Form> */}
		</div>
	);
};

export default AddList;
