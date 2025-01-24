import { A } from '@solidjs/router';
import {
	TbDeviceFloppy,
	TbDownload,
	TbFilePlus,
	TbFolderSearch,
	TbSettings,
	TbUpload,
} from 'solid-icons/tb';
import { Component } from 'solid-js';

const NavBar: Component = () => {
	let burgerRef: HTMLAnchorElement;
	let menuRef: HTMLDivElement;

	const handleBurgerClick = () => {
		burgerRef!.classList.toggle('is-active');
		menuRef!.classList.toggle('is-active');
	};

	return (
		<nav
			class="navbar is-transparent is-fixed-top"
			role="navigation"
			aria-label="main navigation"
		>
			<div class="navbar-brand">
				<A class="navbar-item" href="/">
					<img src="./favicon-96x96.png" />
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
							<a class="navbar-item">
								<TbFilePlus />
								New
							</a>
							<a class="navbar-item">
								<TbFolderSearch />
								Open
							</a>
							<a class="navbar-item">
								<TbDeviceFloppy />
								Save
							</a>
							<hr class="navbar-divider" />
							<a class="navbar-item">
								<TbUpload />
								Import
							</a>
							<a class="navbar-item">
								<TbDownload />
								Export
							</a>
						</div>
					</div>

					<div class="navbar-item has-dropdown is-hoverable">
						<a class="navbar-link">etc</a>

						<div class="navbar-dropdown">
							<A class="navbar-item" href="/settings">
								<TbSettings />
								Settings
							</A>
							<A class="navbar-item" href="/about">
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
