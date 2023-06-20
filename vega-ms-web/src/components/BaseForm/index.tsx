import type { FC } from 'react';
import React, { useEffect, useImperativeHandle } from 'react';
import { colItem2 } from '@/constants/formLayout';
import { Col, Input, Row, Select, Form } from 'antd';
const FormItem = Form.Item;
interface FormType {
	formColumns?: any | Object;
	callBack: Function;
	initValue: unknown;
	selectData: Object;
	baseformRef: any;
}

const BaseForm: FC<any> = ({
	formColumns = {},
	selectData = {},
	initValue,
	baseformRef,
}: FormType) => {
	const {
		blockColumn = [],
		inlineColumn = [],
		tipColumn = [],
		labelWidth = 0,
		rules = {},
	} = formColumns;
	const [form] = Form.useForm();
	useImperativeHandle(baseformRef, () => ({
		getBaseForm: () => form,
		confirm: () => {
			form
				.validateFields()
				.then((values) => {
					return values;
				})
				.catch((error) => {
					let result = error.errorFields;
					if (result && result.length == 0) {
						return error.values;
					}
				});
		},
	}));

	const forms = {
		input: ({
			placeholder = '',
			props = { onChange: Function, onBlur: Function },
		}): React.ReactNode => (
			<Input
				{...props}
				placeholder={placeholder}
				onChange={(e: any) => (props.onChange ? props.onChange(e.target.value, form) : null)}
				onBlur={(e: any) => (props.onBlur ? props.onBlur(e.target.value, form) : null)}
			/>
		),
		select: ({
			key = '',
			name = '',
			data = [],
			value = 'id',
			text = 'value',
			placeholder = '',
			props = {},
		}): React.ReactNode => (
			<Select
				{...props}
				allowClear
				showSearch
				optionFilterProp='children'
				filterOption={(input, option: any) =>
					option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
				}
				placeholder={placeholder}>
				{(selectData[name] || data).map((item: any, index: any) => (
					<Select.Option
						key={item.key ? item.key : item[key] || index}
						value={item[value]}>
						{item[text]}
					</Select.Option>
				))}
			</Select>
		),
	};

	useEffect(() => {
		if (initValue) {
			form.setFieldsValue(initValue);
		}
	}, [initValue]);

	const label = (item: any) => {
		let width = item.labelWidth || labelWidth;
		return (
			<div
				className='labelEle'
				style={{ width: width }}>
				{item.label}
				<span></span>
			</div>
		);
	};

	return (
		<div>
			<Form
				form={form}
				labelAlign='left'>
				<div
					className=' searchContent base-form'
					style={{ paddingBottom: 8 }}>
					<div className='searchForm'>
						<Row>
							<Row style={{ width: '100%' }}>
								<Col>
									{(blockColumn || []).map((item: any, index: any) => {
										return (
											<FormItem
												name={item.name}
												label={label(item)}
												key={index}>
												{forms[item.type]({ ...item })}
											</FormItem>
										);
									})}
								</Col>
							</Row>
							<Row style={{ width: '100%' }}>
								{(inlineColumn || []).map((item: any, index: any) => {
									return (
										<Col
											{...colItem2}
											key={index}>
											<FormItem
												key={index}
												name={item.name}
												label={label(item)}
												rules={rules[item.name] || undefined}
												className={item.class || ''}>
												{forms[item.type]({ ...item })}
											</FormItem>
										</Col>
									);
								})}
							</Row>
						</Row>
						{(tipColumn || []).map((item: any, index: any) => {
							return (
								<div
									className='tips'
									key={index}>
									<span>*</span>
									{item.text}
								</div>
							);
						})}
					</div>
				</div>
			</Form>
		</div>
	);
};

export default BaseForm;
