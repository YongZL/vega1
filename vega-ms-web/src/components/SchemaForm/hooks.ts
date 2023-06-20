import { useCallback, useEffect } from 'react';

let fieldPropsMap: Record<string, Record<string, any>> = {};

const useFormFieldPropsMap = (formFieldKey?: string, formId?: number) => {
	const updateFieldProps = useCallback(
		(propsName: string, value: any) => {
			if (!formFieldKey) {
				return;
			}
			const currentFieldProps = { ...(fieldPropsMap[formFieldKey] || {}) };
			fieldPropsMap = {
				...fieldPropsMap,
				[formFieldKey]: {
					...currentFieldProps,
					[propsName]: value,
				},
			};
		},
		[formFieldKey],
	);

	useEffect(() => {
		return () => {
			if (formFieldKey === '@@SchemaForm' && formId) {
				const currentFieldProps = { ...fieldPropsMap };
				Reflect.ownKeys(currentFieldProps).forEach((key) => {
					try {
						const id = Number((key as string).split('@@')[1]);
						if (id && id === formId) {
							Reflect.deleteProperty(currentFieldProps, key);
						}
					} catch (e) {}
				});
				fieldPropsMap = currentFieldProps;
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		updateFieldProps,
		fieldProps: formFieldKey ? fieldPropsMap[formFieldKey] || {} : {},
	};
};

export { useFormFieldPropsMap };
