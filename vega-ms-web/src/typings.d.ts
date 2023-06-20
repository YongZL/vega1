declare module 'slash2';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
declare module 'omit.js';
declare module 'istanbul-coverage-display';
declare module 'react-resizable';
declare module 'react-barcode';

// google analytics interface
interface GAFieldsObject {
	eventCategory: string;
	eventAction: string;
	eventLabel?: string;
	eventValue?: number;
	nonInteraction?: boolean;
}
interface Window {
	ga: (
		command: 'send',
		hitType: 'event' | 'pageview',
		fieldsObject: GAFieldsObject | string,
	) => void;
	reloadAuthorized: () => void;
}

declare let ga: Function;

declare const REACT_APP_ENV: 'test' | 'dev' | 'pre' | false;

declare const BASE_ENV: '/' | false;

declare const PATH_ENV: '/' | false;

declare const SERVER_ENV: '/' | false;

declare const OVERVIEW_ENV: '/' | false;

declare const VERSION: string;

declare const BRANCH: string;

declare const COMMITHASH: COMMITHASH;

declare const API_NO_LOOP: boolean;
declare const WEB_PLATFORM: 'RS' | 'MS' | 'DS';
declare const IS_GET_VERSION: boolean;
declare const IS_DEV_ENV: boolean;
declare const CONFIG_LESS: Record<string, any>;
