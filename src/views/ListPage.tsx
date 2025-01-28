import { useNavigate } from '@solidjs/router';
import { Component, createSignal, For, onMount } from 'solid-js';
import toast from 'solid-toast';

import { rootPath } from '../env';
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
				navigate(`${rootPath}/`);
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

	const handleDelete = async (id: string) => {
		if (!confirm('Are you sure to delete?')) return;

		await toast.promise(
			(async () => {
				const tx = await notebooksTx<NotebookDoc>();
				await tx.delete(id);
				const all = await tx.getAll();
				setList(all);
			})(),
			{
				loading: 'Deleting...',
				success: 'Deleted',
				error: (e) => {
					console.error(e);
					return 'Failed to delete';
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
						<button
							class="button is-small is-danger"
							onClick={() => handleDelete(nb._id)}
						>
							Delete
						</button>
					</div>
				)}
			</For>
		</div>
	);
};

export default ListPage;
