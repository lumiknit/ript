import { A, useNavigate } from '@solidjs/router';
import {
	TbDeviceFloppy,
	TbDownload,
	TbFilePlus,
	TbFolderSearch,
	TbSettings,
	TbUpload,
} from 'solid-icons/tb';
import { Component, onMount } from 'solid-js';
import toast from 'solid-toast';

import { rootPath } from '../../env';
import { NotebookState } from '../../lib/notebook_state';
import { setNotebookState, store } from '../../store';

const NavBar: Component = () => {
	let burgerRef: HTMLAnchorElement;
	let menuRef: HTMLDivElement;

	const navigate = useNavigate();

	const unimplemented = () => {
		toast.error('Not implemented');
	};

	const handleBurgerClick = () => {
		burgerRef!.classList.toggle('is-active');
		menuRef!.classList.toggle('is-active');
	};

	const close = () => {
		burgerRef!.classList.remove('is-active');
		menuRef!.classList.remove('is-active');
	};

	const handleNew = () => {
		setNotebookState(new NotebookState());
		toast.success('New notebook created');
		navigate('/');
	};

	const handleSave = () => {
		toast.promise(
			(async () => {
				await store.notebookState.save();
			})(),
			{
				loading: 'Saving...',
				success: 'Saved',
				error: (e) => {
					console.error(e);
					return 'Failed to save';
				},
			}
		);
	};

	onMount(() => {
		menuRef!.querySelectorAll('a').forEach((a) => {
			if (!a.href) return;
			a.addEventListener('click', close);
		});
	});

	return (
		<nav
			class="navbar is-transparent"
			role="navigation"
			aria-label="main navigation"
		>
			<div class="navbar-brand">
				<A class="navbar-item" href={`${rootPath}/`}>
					<img src="/favicon-96x96.png" />
				</A>

				<a
					ref={burgerRef!}
					role="button"
					class="navbar-burger"
					aria-label="menu"
					aria-expanded="false"
					data-target="navbarTarget"
					onClick={handleBurgerClick}
				>
					<span />
					<span />
					<span />
					<span />
				</a>
			</div>
			<div ref={menuRef!} id="navbarTarget" class="navbar-menu">
				<div class="navbar-start">
					<div class="navbar-item has-dropdown is-hoverable">
						<a class="navbar-link">Files</a>

						<div class="navbar-dropdown">
							<a class="navbar-item" onClick={handleNew}>
								<TbFilePlus />
								New
							</a>
							<A class="navbar-item" href="/notebooks">
								<TbFolderSearch />
								Open
							</A>
							<a class="navbar-item" onClick={handleSave}>
								<TbDeviceFloppy />
								Save
							</a>
							<hr class="navbar-divider" />
							<a class="navbar-item" onClick={unimplemented}>
								<TbUpload />
								Import
							</a>
							<a class="navbar-item" onClick={unimplemented}>
								<TbDownload />
								Export
							</a>
						</div>
					</div>

					<div class="navbar-item has-dropdown is-hoverable">
						<a class="navbar-link">etc</a>

						<div class="navbar-dropdown">
							<A
								class="navbar-item"
								href={`${rootPath}/settings`}
							>
								<TbSettings />
								Settings
							</A>
							<A class="navbar-item" href={`${rootPath}/about`}>
								About
							</A>
						</div>
					</div>
				</div>

				<div class="navbar-end">
					<div class="navbar-item"></div>
				</div>
			</div>
		</nav>
	);
};

export default NavBar;
