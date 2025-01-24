import { Component } from 'solid-js';

const AboutPage: Component = () => {
	const link = 'https://github.com/lumiknit/ript';
	return (
		<div class="container">
			<h1 class="title"> ript </h1>
			<ul>
				<li>
					{' '}
					Author:{' '}
					<a href="https://github.com/lumiknit">
						lumiknit (aasr4r4@gmail.com)
					</a>
				</li>
				<li>
					<a href={link}>{link}</a>
				</li>
			</ul>
		</div>
	);
};

export default AboutPage;
