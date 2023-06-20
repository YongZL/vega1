import { pageList } from '@/services/newGoodsTypes';
import { Col, DatePicker, Form, Input, Radio, Row, Select, Table } from 'antd';
import { debounce } from 'lodash';
import moment from 'moment';
import type { FC } from 'react';
import React, { useState } from 'react';
import type { RadioChangeEvent } from 'antd';

const FormItem = Form.Item;
interface FormType {
	formColumn: any[];
	modalTitle: string;
	span: number;
	companyType: String;
	form: any;
	result: AdverseEvent.QueryDetail;
}
const FormModal: FC<any> = ({
	modalTitle = '',
	formColumn = [],
	span = 8,
	companyType,
	form,
	result,
}: FormType) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [isInput, setIsInput] = useState<boolean>(false);
	const [isth, setIsth] = useState<boolean>(false);
	const [tableData, setTableData] = useState<NewGoodsTypesController.GoodsRecord[]>([]);
	const { TextArea } = Input;
	const searchTable = async (value: any) => {
		if (!value) {
			setTableData([]);
			setIsOpen(true);
			return;
		}
		let res: ResponseList<NewGoodsTypesController.GoodsRecord> = await pageList({
			goodsName: value,
			pageNum: 0,
			pageSize: 200,
			isCombined: false,
		});
		if (res && res.code == 0) {
			if (res.data.rows.length) {
				setIsOpen(true);
			} else {
				setIsOpen(true);
			}
			setTableData(res.data.rows);
		}
	};
	const onChange = (e: RadioChangeEvent) => {
		if (e.target.value == 3) {
			setIsInput(true);
		} else {
			setIsInput(false);
		}
	};
	const onChangeth = (e: RadioChangeEvent) => {
		if (e.target.value == 2) {
			setIsth(true);
		} else {
			setIsth(false);
		}
	};
	const forms = {
		input: ({
			placeholder = '请输入',
			disabled = false,
			result,
			max,
		}: Record<string, any>): React.ReactNode =>
			!disabled ? (
				<Input
					maxLength={max}
					placeholder={disabled ? '暂无' : placeholder}
					style={{ border: disabled ? 'none' : '', pointerEvents: disabled ? 'none' : 'auto' }}
				/>
			) : (
				<p
					title={result}
					className='selectTableModalspan'>
					{result || '-'}
				</p>
			),
		textArea: ({
			placeholder = '请输入',
			disabled = false,
			result = '',
		}: Record<string, any>): React.ReactNode =>
			!disabled ? (
				<TextArea
					placeholder={disabled ? '暂无' : placeholder}
					style={{
						border: disabled ? 'none' : '',
						pointerEvents: disabled ? 'none' : 'auto',
						height: 80,
					}}
				/>
			) : (
				<p
					title={result}
					className='selectTableModalspan'>
					{result || '-'}
				</p>
			),
		datePicker: ({
			placeholder = '请输入',
			props = {},
			disabledDate = false,
			disabled = false,
			result = '',
		}): React.ReactNode =>
			!disabled ? (
				<DatePicker
					style={{ width: '100%', pointerEvents: disabled ? 'none' : 'auto' }}
					allowClear={false}
					placeholder={placeholder}
					disabledDate={disabledDate}
					format={['YYYY-MM-DD', 'YYYY/MM/DD']}
					{...props}
				/>
			) : (
				<p
					title={result}
					className='selectTableModalspan'>
					{result ? moment(new Date(result)).format('YYYY/MM/DD HH:mm:ss') : '-'}
				</p>
			),
		radioGroup: ({
			data = [],
			value = 'value',
			text = 'text',
			disabled = false,
			isButton = false,
			name = '',
			result = '',
		}): React.ReactNode =>
			!disabled ? (
				<div>
					<Radio.Group
						style={{
							display: isButton ? 'flex' : '',
							justifyContent: 'space-between',
							pointerEvents: disabled ? 'none' : 'auto',
							width: '100%',
							overflow: 'hidden',
						}}
						onChange={(e) => {
							name === 'causeHurt' && onChange(e);
						}}>
						{data.map((item: any, index: any) => {
							if (isButton) {
								return (
									<Radio.Button
										key={index}
										value={item[value]}
										style={{
											flex: name === 'productType' ? (index === data.length - 1 ? '17%' : 1) : 1,
											display: 'flex',
											justifyContent: 'center',
										}}>
										{' '}
										{item[text]}
									</Radio.Button>
								);
							} else {
								return (
									<Radio
										key={index}
										value={item[value]}>
										{' '}
										{item[text]}
									</Radio>
								);
							}
						})}
						{name === 'causeHurt' && isInput && (
							<Input
								style={{ flex: 1 }}
								placeholder={'请输入'}
							/>
						)}
					</Radio.Group>
				</div>
			) : (
				<p
					title={result}
					className='selectTableModalspan'>
					{result || result == '0'
						? data.map((item) => {
								console.log(item, 'itemitemitem');
								if (item[value] == result) {
									return item[text];
								} else {
									return item[value] == result ? result : '';
								}
						  })
						: '-'}
				</p>
			),
		radioInputGroup: ({
			data = [],
			value = 'value',
			text = 'text',
			disabled = false,
			rejectlist = '',
			result = '',
			returnedDescription = undefined,
		}): React.ReactNode =>
			!disabled ? (
				<Radio.Group
					style={{ display: 'flex', flexDirection: 'column' }}
					onChange={(e) => {
						onChangeth(e);
					}}>
					{data.map((item: any, index: any) => {
						return (
							<div
								style={{
									display: 'flex',
									width: '51.6%',
									marginRight: item.marginRight || 0,
									flexDirection: !disabled && 'column',
								}}>
								<Radio
									key={index}
									value={item[value]}
									style={{ marginTop: 5, pointerEvents: disabled ? 'none' : 'auto' }}>
									<span style={{ display: 'inline-block', width: 50 }}>{item[text]}</span>
								</Radio>
								{item.value == 2 && isth && (
									// <Input
									//   id={item.id}
									//   title={disabled ? rejectlist : ''}
									//   value={disabled ? rejectlist : ''}
									//   disabled={disabled}
									//   placeholder={'请填写退回原因'}
									// />
									<TextArea
										id={item.id}
										defaultValue={disabled ? rejectlist : ''}
										disabled={disabled}
										title={disabled ? rejectlist : ''}
										placeholder={disabled ? '暂无' : '请填写退回原因'}
										style={{
											border: disabled ? 'none' : '',
											pointerEvents: disabled ? 'none' : 'auto',
											height: 80,
										}}
									/>
								)}
							</div>
						);
					})}
				</Radio.Group>
			) : (
				<>
					<p
						title={result}
						className='selectTableModalspan'
						style={{ marginTop: 5 }}>
						{result
							? data.map((item) => {
									if (item[value] === result) {
										return '已' + item[text];
									}
							  })
							: '-'}
					</p>
					{returnedDescription && (
						<p style={{ marginLeft: '-18%', marginTop: 5 }}>退回原因：{returnedDescription}</p>
					)}
				</>
			),
		selectTable: ({
			columns = [],
			placeholder = '',
			getSelectTableRow = Function,
			disabled = false,
			result = '',
		}): React.ReactNode =>
			!disabled ? (
				<Select
					className='selectTableModal'
					style={{ pointerEvents: disabled ? 'none' : 'auto' }}
					dropdownClassName={tableData.length ? 'selectTable' : 'selectTable selectEmptyTable'}
					open={isOpen}
					showSearch={true}
					allowClear={true}
					listHeight={100}
					placeholder={placeholder}
					dropdownMatchSelectWidth={false}
					onBlur={() => {
						if (isOpen) {
							setTimeout(() => {
								setIsOpen(false);
							}, 200);
						}
					}}
					onSearch={debounce((value: any) => searchTable(value), 800)}
					dropdownRender={() => (
						<div style={{ padding: 2, width: '61.8vw', pointerEvents: disabled ? 'none' : 'auto' }}>
							<Table
								rowKey={(record, index) => index as number}
								pagination={false}
								columns={columns}
								dataSource={tableData}
								scroll={{ x: '100%', y: 300 }}
								onRow={(record: any) => {
									return {
										onClick: (e) => {
											e.stopPropagation();
											getSelectTableRow(record);
											setIsOpen(false);
											setTableData([]);
										},
									};
								}}
							/>
						</div>
					)}></Select>
			) : (
				<p
					title={result}
					className='selectTableModalspan'>
					{result}
				</p>
			),
	};

	const label = (item: any) => {
		let width = item.labelWidth;
		let len = item.label.leghth;
		return (
			<div
				className='labelEle'
				style={{ width: width || Number(len) * 16 }}>
				{item.label}
				<span></span>
			</div>
		);
	};

	return (
		<div
			style={{ marginBottom: 0, padding: '20px 0 5px 20px', background: CONFIG_LESS['@bgc_table'] }}
			className='page-form-modal'>
			<h4
				style={{
					borderBottom: '1px solid #ccc',
					paddingBottom: 8,
					fontSize: 18,
					fontWeight: '600',
					marginRight: 20,
				}}>
				{modalTitle}
			</h4>
			<Row
				style={{ width: '100%', paddingTop: 8, paddingLeft: 0 }}
				gutter={78}>
				{formColumn.map((item: any, index: number) => {
					if (!item.reportType || item.reportType == companyType) {
						return (
							<Col
								span={item.span || span}
								key={index}>
								<FormItem
									key={index}
									name={item.name}
									label={label(item)}
									initialValue={item.initValue}
									rules={
										item.pattern
											? [{ required: item.required, pattern: item.pattern, message: item.message }]
											: [{ required: item.required, message: '请输入' }]
									}>
									{forms[item.type]({ ...item })}
								</FormItem>
							</Col>
						);
					}
				})}
			</Row>
			<div style={{ borderBottom: '1px solid #ccc', marginRight: 20 }}></div>
		</div>
	);
};

export default FormModal;
