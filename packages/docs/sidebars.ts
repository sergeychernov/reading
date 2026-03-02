import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
	docsSidebar: [
		'architecture',
		'roles',
		'user-roles',
		'vercel-github-oauth',
		{
			type: 'category',
			label: 'READMEs',
			items: [
				'readmes/root-readme',
				'readmes/docs-package-readme',
				'readmes/public-app-readme',
			],
		},
	],
};

export default sidebars;
