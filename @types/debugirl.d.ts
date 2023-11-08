declare namespace chrome.girl {
	export function notify(opt: {
		title: string;
		message: string;
		iconUrl?: string;
		url: string;
	}): Promise<void>;
}
