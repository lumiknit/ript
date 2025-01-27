import { Component, JSX } from 'solid-js';

type Props = JSX.IntrinsicElements['textarea'];

/**
 * Auto resize textarea
 */
const AutoIncrTextarea: Component<Props> = (props) => {
	return <textarea {...props} />;
};

export default AutoIncrTextarea;
