import { useNavigate } from '@solidjs/router';
import { Component, createSignal, For, onMount } from 'solid-js';
import toast from 'solid-toast';

import { notebooksTx } from '../lib/idb';
import { NotebookDoc } from '../lib/notebook/notebook';
import { store } from '../store';

const ListPage: Component = () => {
	const navigate = useNavigate();
	const [list, setList] = createSignal<NotebookDoc[]>([]);

	onMount(async () => {
		const tx = await notebooksTx<NotebookDoc>();
		const all = await tx.getAll();
		setList(all);
	});

	const handleOpen = async (id: string) => {
		await toast.promise(
			(async () => {
				await store.notebookState.load(id);
				navigate('/');
			})(),
			{
				loading: 'Opening...',
				success: 'Opened',
				error: (e) => {
					console.error(e);
					return 'Failed to open';
				},
			}
		);
	};

	return (
		<div class="container p-2">
			<h1 class="title">Local Notebook List</h1>
			<p>Click on a notebook to open it</p>

			<For each={list()}>
				{(nb) => (
					<div>
						<a
							href={`#${nb._id}`}
							onClick={() => handleOpen(nb._id)}
						>
							{nb.name} ({nb._id},{' '}
							{new Date(nb.updatedAt).toLocaleString()})
						</a>
					</div>
				)}
			</For>
		</div>
	);
};

export default ListPage;
