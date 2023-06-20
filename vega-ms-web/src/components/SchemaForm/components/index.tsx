import type {
	FormSchemaProps,
	InitProFormColumns,
	ProFormColumns,
	ProFormValueType,
} from '../typings';
import type { ProFormColumnsType } from '@ant-design/pro-form/es/components/SchemaForm';

import React, { useMemo, useState, useEffect, useContext } from 'react';
import ProProvider from '@ant-design/pro-provider';

import { BetaSchemaForm } from '@ant-design/pro-form';
import { InputNumber, DatePicker } from 'antd';
import TagSelect from './TagSelect';
import DateRangeWithTag from './DateRangeWithTag';
// import RangeSelect from './RangeSelect';
import Remarks from './Remarks';
import ApiSelect from './ApiSelect';
// import BasicUpload from './BasicUpload';
import SelectTable from './SelectTable';
import InputUnit from '@/components/InputUnit';
import classNames from 'classnames';
import { useFormFieldPropsMap } from '../hooks';
import ASwitch from './ASwitch';
import ScanInput from '@/components/ScanInput';
import ScanInputWithSpace from '@/components/ScanInput/ScanInput';
import { omit } from 'lodash';

import './index.less';
import { size } from '@/../config/configLess';

const SchemaForm = <T extends Record<string, any>>({
	columns: cols,
	justifyLabel,
	labelWidth,
	span,
	rules,
	hasRequired,
	...props
}: FormSchemaProps<T>) => {
	type PrivateColumns = ProFormColumnsType<T, ProFormValueType>;

	const [formId] = useState<number>(Date.now());
	useFormFieldPropsMap('@@SchemaForm', formId);
	const provProviderValues = useContext(ProProvider);
	const [columns, setColumns] = useState<ProFormColumns<T>>([]);
	const [groupColumns, setGroupColumns] = useState<ProFormColumns<T>>([]);
	const labelMap = useMemo(() => {
		if (props.layoutType === 'QueryFilter') {
			// size 为14时，4个文字的宽度为63px
			return {
				labelWidth: labelWidth ? labelWidth : 4.5 * size,
			};
		}
		return {};
	}, [props.layoutType, labelWidth]);

	const loopColumns = (
		list: ProFormColumns<T> = [],
		isStepForm: boolean = false,
	): ProFormColumns<T> | ProFormColumns<T>[] => {
		if (!list || !list.length) {
			return [];
		}
		if (isStepForm && Array.isArray(list[0])) {
			return list.map((item) => loopColumns(item as ProFormColumns<T>), true) as ProFormColumns<T>;
		}
		const groupCols: ProFormColumns<T> = [];
		const nonGroupCols: ProFormColumns<T> = [];
		list.forEach((schema) => {
			const { title, formItemProps = {}, dataIndex, valueType, group }: any = schema;
			const { className: cls, rules: itemRules, labelWidth: itemLabelWidth } = formItemProps;
			if (itemLabelWidth) {
				formItemProps.labelCol = {
					...(formItemProps.labelCol || {}),
					flex: `${itemLabelWidth}px`,
				};
			}
			// 若未传宽度，这里会对字数去做适配
			if (
				!(formItemProps.labelCol && formItemProps.labelCol.flex) &&
				!itemLabelWidth &&
				props.layoutType === 'QueryFilter' &&
				title
			) {
				// 这里为什么加0.5，冒号站的字段
				const length = (title.length > 4 ? title.length : 4) + 0.5;
				let flex: number = 0;
				if (hasRequired) {
					// 这里为什么加1，因为搜索区域的必填label文字要与非必填项的文字对齐
					flex = (length + 1) * size;
				} else {
					// 这里为什么加1，因为有必填项会带星号
					flex =
						itemRules || (rules && dataIndex && rules[dataIndex])
							? (length + 1) * size
							: length * size;
				}
				formItemProps.labelCol = {
					...(formItemProps.labelCol || {}),
					flex: `${flex}px`,
				};
			}
			const schemaProps: any = {
				formItemProps: {
					...omit(formItemProps || {}, 'labelWidth'),
				},
			};
			if (title && typeof title === 'string' && (justifyLabel === undefined || justifyLabel)) {
				schemaProps.title = title
					.split('')
					// eslint-disable-next-line react/no-array-index-key
					.map((str: string, index: number) => (
						<span
							key={`${index}`}
							className='justify-label-item-text'>
							{str}
						</span>
					));
				schemaProps.title = <span className='justify-label-item'>{schemaProps.title}</span>;
				schemaProps.formItemProps = {
					...(schemaProps.formItemProps || {}),
					className: classNames(cls, 'justify-label-form-item'),
				};
			}

			// 优先使用当前项的配置
			if (rules && dataIndex && rules[dataIndex]) {
				schemaProps.formItemProps = {
					...(schemaProps.formItemProps || {}),
					rules: itemRules || rules[dataIndex],
				};
			}
			if (valueType === 'upload') {
				schemaProps.formItemProps = {
					...(schemaProps.formItemProps || {}),
					valuePropName: 'fileList',
				};
			}

			if (
				props.layoutType !== 'QueryFilter' &&
				labelWidth &&
				!['group', 'dependency'].includes(valueType)
			) {
				schemaProps.formItemProps = {
					...(schemaProps.formItemProps || {}),
					labelCol: {
						...((schemaProps.formItemProps || {}).labelCol || {}),
						style: {
							...(((schemaProps.formItemProps || {}).labelCol || {}).style || {}),
							width: labelWidth,
						},
					},
				};
			}

			if (valueType === 'dateRangeWithTag') {
				// labelWidth这里的判断是为了区别是否有传labelWidth（这里指props的labelWidth）
				const labelWidth: number | undefined =
					labelMap.labelWidth === 4.5 * size
						? Number(formItemProps.labelCol.flex.split('px')[0])
						: labelMap.labelWidth;
				(schema as any).fieldProps = {
					...((schema as any).fieldProps || {}),
					labelWidth: itemLabelWidth || labelWidth,
				};
			}

			if ((schema as PrivateColumns).columns) {
				(schema as PrivateColumns).columns = (
					Array.isArray((schema as PrivateColumns).columns as PrivateColumns[])
						? loopColumns((schema as PrivateColumns).columns as PrivateColumns[])[1]
						: (schema as PrivateColumns).columns
				) as any;
			}

			if (
				!isStepForm &&
				group !== false &&
				['dateRangeWithTag', 'tagSelect'].includes(valueType as string)
			) {
				groupCols.push({
					colSize: 24,
					...schema,
					...schemaProps,
				});
			} else {
				nonGroupCols.push({
					...schema,
					...schemaProps,
					...(valueType === 'remarks'
						? {
								readOnly: true,
								colSize: 24,
								formItemProps: {
									...(schemaProps.formItemProps || {}),
									wrapperCol: {
										style: {
											maxWidth: '100%',
										},
									},
								},
						  }
						: {}),
				});
			}
		});

		if (isStepForm) {
			return nonGroupCols;
		}

		return [groupCols, nonGroupCols];
	};

	useEffect(() => {
		if (cols && cols.length) {
			// StepForm columns处理
			if (props.layoutType === 'StepForm') {
				setColumns(loopColumns(cols, true) as ProFormColumns<T>);
				return;
			}
			const [groupCols, nonGroupCols] = loopColumns(cols) as ProFormColumns<T>[];
			(groupCols as InitProFormColumns<T>[]).forEach((item) => {
				if (!(item.proFieldProps && item.proFieldProps.proFieldKey)) {
					item.proFieldProps = {
						...item.proFieldProps,
						proFieldKey: 'form-field-' + item.dataIndex,
					};
				}
			});
			(nonGroupCols as InitProFormColumns<T>[]).forEach((item) => {
				if (!(item.proFieldProps && item.proFieldProps.proFieldKey)) {
					item.proFieldProps = {
						...item.proFieldProps,
						proFieldKey: 'form-field-' + item.dataIndex,
					};
				}
			});
			setColumns(nonGroupCols);
			setGroupColumns(groupCols);
		}
	}, [cols, justifyLabel, rules, labelMap.labelWidth, props.layoutType]);

	const queryFilterMap = useMemo(() => {
		return props.layoutType === 'QueryFilter'
			? {
					defaultColsNumber: props.defaultColsNumber
						? props.defaultColsNumber
						: groupColumns.length > 0
						? groupColumns.length + 1
						: Math.floor(24 / ((span as number) || 8)),
					span,
			  }
			: {};
	}, [props.layoutType, groupColumns, span]);

	return (
		<ProProvider.Provider
			value={{
				...provProviderValues,
				valueTypeMap: {
					tagSelect: {
						render: (text) => text,
						renderFormItem: (text, schemaProps) => {
							return <TagSelect {...schemaProps?.fieldProps} />;
						},
					},
					dateRangeWithTag: {
						render: (text) => text,
						renderFormItem: (text, schemaProps) => {
							return <DateRangeWithTag {...schemaProps?.fieldProps} />;
						},
					},
					// rangeSelect: {
					//   render: (text) => text,
					//   renderFormItem: (text, schemaProps) => {
					//     return (
					//       <RangeSelect {...schemaProps?.fieldProps} />
					//     )
					//   },
					// },
					apiSelect: {
						render: (text) => text,
						renderFormItem: (text, schemaProps) => {
							return (
								<ApiSelect
									{...schemaProps?.fieldProps}
									formKey={`${schemaProps.proFieldKey}@@${formId}`}
								/>
							);
						},
					},
					aSwitch: {
						render: (text) => text,
						renderFormItem: (text, schemaProps) => {
							return <ASwitch {...schemaProps?.fieldProps} />;
						},
					},
					// upload: {
					//   render: (text) => text,
					//   renderFormItem: (text, schemaProps) => {
					//     return (
					//       <BasicUpload {...schemaProps?.fieldProps} fileList={...schemaProps?.fieldProps.value} />
					//     )
					//   },
					// },
					remarks: {
						renderFormItem: (text, schemaProps) => {
							return <Remarks {...schemaProps?.fieldProps} />;
						},
					},
					inputUnit: {
						renderFormItem: (text, schemaProps) => {
							return <InputUnit {...schemaProps?.fieldProps} />;
						},
					},
					inputNumber: {
						renderFormItem: (text, schemaProps) => {
							return (
								<InputNumber
									{...schemaProps?.fieldProps}
									style={{ ...schemaProps?.fieldProps?.style, width: '100%' }}
								/>
							);
						},
					},
					selectTable: {
						renderFormItem: (text, schemaProps) => {
							return (
								<SelectTable
									{...schemaProps?.fieldProps}
									style={{ ...schemaProps?.fieldProps?.style, width: '100%' }}
								/>
							);
						},
					},
					scanInput: {
						renderFormItem: (text, schemaProps) => {
							return <ScanInput {...schemaProps?.fieldProps} />;
						},
					},
					scanInputWithSpace: {
						renderFormItem: (text, schemaProps) => {
							return <ScanInputWithSpace {...schemaProps?.fieldProps} />;
						},
					},
					aText: {
						renderFormItem: (text, schemaProps) => {
							return <span>{text}</span>;
						},
					},
					datePicker: {
						renderFormItem: (text, schemaProps) => {
							return (
								// @ts-ignore
								<DatePicker
									format={['YYYY-MM-DD', 'YYYY/MM/DD']}
									placeholder='请选择'
									{...schemaProps?.fieldProps}
									style={{ ...schemaProps?.fieldProps?.style, width: '100%' }}
								/>
							);
						},
					},
				},
			}}>
			<BetaSchemaForm<T, ProFormValueType>
				{...props}
				className={classNames(props.className, 'ant-form__custom')}
				{...labelMap}
				{...queryFilterMap}
				columns={[...groupColumns, ...columns]}
			/>
		</ProProvider.Provider>
	);
};
export default SchemaForm;
