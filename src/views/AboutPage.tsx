import { Component } from 'solid-js';

const AboutPage: Component = () => {
	const link = 'https://github.com/lumiknit/ript';
	return (
		<div class="container">
			<h1 class="title"> ript </h1>
			<ul>
				<li>
					<b>Author</b>:
					<a href="https://github.com/lumiknit">
						lumiknit (aasr4r4@gmail.com)
					</a>
				</li>
				<li>
					<a href={link}>{link}</a>
				</li>
			</ul>

			<h1 class="title"> Short Guide </h1>

			<ul>
				<li>
					{' '}
					See etc - settings for settings (editor & LLM endpoint,
					etc.)
				</li>
				<li>
					{' '}
					Write javascript codes in cells. Run them by clicking the
					play button.
				</li>
				<li> You can see immediate results with console.log. </li>
				<li>
					{' '}
					console.log with <code>OffscreenCanvas</code> or{' '}
					<code>ImageBitmap</code> will be displayed as images.{' '}
				</li>
				<li> Enter your request to LLM in the bottom input box. </li>
			</ul>
		</div>
	);
};

export default AboutPage;
