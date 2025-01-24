import { TbPlayerPlay } from 'solid-icons/tb';
import { Component, Show } from 'solid-js';

import { CellStruct as CellStruct } from '../../lib/cells';
import { Editor } from '../editor';
import './cell.scss';
import CellOutputs from './CellOutputs';

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

	return (
		<div class="cell m-2 p-2">
			<div class="cell-gutter">
				<span>[{props.cell.output?.index ?? '*'}]</span>
				<button onClick={props.onRun}>
					<TbPlayerPlay />
				</button>
			</div>
			<div class="cell-main">
				<Editor
					language={props.cell.code.language}
					content={props.cell.code.code}
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
