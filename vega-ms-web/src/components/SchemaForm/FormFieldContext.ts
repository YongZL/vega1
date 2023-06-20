import { createContext } from 'react';

export type FiledContextProps = {
	fieldPropsMap: Record<string, any>;
	updateFieldProps?: (formFieldKey: string, propsName: string, value: any) => void;
};

const FormFieldContext = createContext<FiledContextProps>({
	fieldPropsMap: {},
});

export default FormFieldContext;
