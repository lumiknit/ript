import { TbPlayerPlay } from 'solid-icons/tb';
import { Component, Show } from 'solid-js';

import { CellStruct as CellStruct } from '../../lib/cells';
import { Editor } from '../editor';
import './cell.scss';
import CellOutputs from './CellOutputs';
import { store } from '../../store';

const cellIndexMark = (cell: CellStruct) => {
	if (!cell.output) return ' ';
	else if (cell.output.endAt === undefined) return '*';
	else return cell.output.index;
};

type Props = {
	index: number;
	cell: CellStruct;

	onCodeUpdate?: (code: string) => void;
	onRun?: () => void;
};

const Cell: Component<Props> = (props) => {
	const handleEditorKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			props.onRun?.();
			e.preventDefault();
		}
	};

	const style = () => {
		console.log('Updated style');
		const fontFamily =
			store.localSettings?.['editor.fontFamily'] ?? 'monospace';
		const fontSize = store.localSettings?.['editor.fontSize'] ?? 16;
		return `font-family: ${fontFamily}; font-size: ${fontSize}px;`;
	};

	const handleFocus = (e: FocusEvent) => {
		console.log('Focused', props.index, e);
		store.notebookState.setFocused(props.index);
	};

	const selectedClass = () => {
		return store.notebookState.focused() === props.index ? 'selected' : '';
	};

	return (
		<div class={`cell my-2 ${selectedClass()}`} onClick={handleFocus}>
			<div class="cell-gutter">
				<span>[{cellIndexMark(props.cell)}]</span>
				<button onClick={props.onRun}>
					<TbPlayerPlay />
				</button>
			</div>
			<div style={style()} class="cell-main">
				<Editor
					language={props.cell.code.language}
					content={props.cell.code.code}
					onFocus={handleFocus}
					onModified={props.onCodeUpdate}
					onKeyDown={handleEditorKeyDown}
				/>
				<Show when={props.cell.output}>
					<CellOutputs output={props.cell.output!} />
				</Show>
			</div>
		</div>
	);
};

export default Cell;
