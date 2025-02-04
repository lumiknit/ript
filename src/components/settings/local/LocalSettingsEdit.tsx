import { Component, JSX } from 'solid-js';

import { LocalSettings } from '../../../lib/settings';
import { getLocalSettings, setLocalSettings } from '../../../store';

type SettingSectionProps = {
	label: string;
};

const SettingSection: Component<SettingSectionProps> = (props) => {
	return (
		<div>
			<hr />
			<h2 class="subtitle">{props.label}</h2>
		</div>
	);
};

type TextSettingProps = {
	label: string;
	settingKey: keyof LocalSettings;
	placeholder?: string;
	children?: JSX.Element | JSX.Element[];
};

const TextSetting: Component<TextSettingProps> = (props) => {
	return (
		<label>
			<div>
				<strong>{props.label}</strong>
				{props.children}
			</div>
			<input
				class="input"
				type="text"
				value={getLocalSettings()?.[props.settingKey] || ''}
				onChange={(e) =>
					setLocalSettings((s) => ({
						...s,
						[props.settingKey]: (e.target as HTMLInputElement)
							.value,
					}))
				}
				placeholder={props.placeholder}
			/>
		</label>
	);
};

type NumberSettingProps = {
	label: string;
	settingKey: keyof LocalSettings;
	placeholder?: string;
	children?: JSX.Element | JSX.Element[];
};

const NumberSetting: Component<NumberSettingProps> = (props) => {
	return (
		<label>
			<div>
				<strong>{props.label}</strong>
				{props.children}
			</div>
			<input
				class="input"
				type="number"
				value={getLocalSettings()?.[props.settingKey] || ''}
				onChange={(e) =>
					setLocalSettings((s) => ({
						...s,
						[props.settingKey]: parseFloat(
							(e.target as HTMLInputElement).value
						),
					}))
				}
				placeholder={props.placeholder}
			/>
		</label>
	);
};

type SelectSettingProps = {
	label: string;
	settingKey: keyof LocalSettings;
	options: string[];
	children?: JSX.Element | JSX.Element[];
};

const SelectSetting: Component<SelectSettingProps> = (props) => {
	return (
		<label>
			<div>
				<strong>{props.label}</strong>
				{props.children}
			</div>
			<div class="select">
				<select
					value={getLocalSettings()?.[props.settingKey] || ''}
					onChange={(e) =>
						setLocalSettings((s) => ({
							...s,
							[props.settingKey]: (e.target as HTMLSelectElement)
								.value,
						}))
					}
				>
					{props.options.map((o) => (
						<option>{o}</option>
					))}
				</select>
			</div>
		</label>
	);
};

const LocalSettingsEdit: Component = () => {
	return (
		<div>
			<h1 class="title">Local Settings</h1>
			<p> The below settings are stored locally in your browser. </p>

			<SettingSection label="Editor" />

			<TextSetting
				label="Editor Font Family"
				settingKey="editor.fontFamily"
				placeholder="monospace"
			>
				<p>
					Editor font family. e.g.
					<code>'Fira Code', Monaco, monospace</code>
				</p>
			</TextSetting>

			<NumberSetting
				label="Editor Font Size"
				settingKey="editor.fontSize"
				placeholder="16"
			>
				<p> Editor font size in pixels.</p>
			</NumberSetting>

			<SettingSection label="AI" />

			<SelectSetting
				label="Default AI Service"
				settingKey="ai.defaultService"
				options={['openai', 'gemini', 'groq']}
			/>

			<SettingSection label="AI - OpenAI" />

			<TextSetting
				label="OpenAI Endpoint"
				settingKey="ai.openai.endpoint"
				placeholder="https://api.openai.com/v1"
			>
				<p> The endpoint for the OpenAI API. </p>
			</TextSetting>

			<TextSetting
				label="OpenAI API Key"
				settingKey="ai.openai.apiKey"
				placeholder="sk-..."
			>
				<p>
					<a
						href="https://platform.openai.com/account/api-keys"
						target="_blank"
					>
						https://platform.openai.com/account/api-keys
					</a>
				</p>
			</TextSetting>

			<SelectSetting
				label="OpenAI Model"
				settingKey="ai.openai.model"
				options={['gpt-4o-mini', 'gpt-4o']}
			/>

			<SettingSection label="AI - Google Gemini" />

			<TextSetting
				label="Gemini API Key"
				settingKey="ai.gemini.apiKey"
				placeholder="Abcd_efg"
			>
				<p>
					<a
						href="https://aistudio.google.com/apikey"
						target="_blank"
					>
						https://aistudio.google.com/apikey
					</a>
				</p>
			</TextSetting>

			<SelectSetting
				label="Gemini Model"
				settingKey="ai.gemini.model"
				options={[
					'gemini-1.5-flash',
					'gemini-1.5-flash-8b',
					'gemini-1.5-pro',
					'gemini-2.0-flash',
				]}
			/>

			<SettingSection label="AI - Groq" />

			<TextSetting
				label="Groq API Key"
				settingKey="ai.groq.apiKey"
				placeholder="gsk_..."
			>
				<p>
					<a href="https://console.groq.com/keys" target="_blank">
						https://console.groq.com/keys
					</a>
				</p>
			</TextSetting>

			<SelectSetting
				label="Groq Model"
				settingKey="ai.groq.model"
				options={[
					'deepseek-r1-distill-llama-70b',
					'llama-3.3-70b-versatile',
					'llama-3.1-8b-instant',
					'llama-guard-3-8b',
					'llama-3-70b-8192',
					'llama-3-8b-8192',
					'mixtral-8x7b-32768',
				]}
			/>
		</div>
	);
};

export default LocalSettingsEdit;
