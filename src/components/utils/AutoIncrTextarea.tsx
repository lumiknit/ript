import { Component, JSX, splitProps } from 'solid-js';

type Props = JSX.IntrinsicElements['textarea'];

/**
 * Auto resize textarea
 */
const AutoIncrTextarea: Component<Props> = (props) => {
	let ref: HTMLTextAreaElement;

	const [t, taProps] = splitProps(props, ['onInput']);

	const handleOnInput = (e: InputEvent) => {
		const ta = e.target as HTMLTextAreaElement;
		ta.style.height = '1px';
		ta.style.height = `${ta.scrollHeight}px`;

		if (t.onInput) (t.onInput as any)(e);
	};

	return <textarea {...taProps} ref={ref!} onInput={handleOnInput} />;
};

export default AutoIncrTextarea;
