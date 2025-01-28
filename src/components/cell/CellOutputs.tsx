import { Component, For, Match, Switch } from 'solid-js';

import CellOutLine from './CellOutLine';
import { CellOutput } from '../../lib/notebook/cells';

type Props = {
	output: CellOutput;
};

const CellOutputs: Component<Props> = (props) => {
	return (
		<div class="cell-output">
			<Switch>
				<Match when={props.output.lines.length === 0}>
					<div class="empty is-italic">(No output)</div>
				</Match>
				<Match when>
					<For each={props.output.lines}>
						{(l) => <CellOutLine out={l} />}
					</For>
				</Match>
			</Switch>
		</div>
	);
};

export default CellOutputs;
