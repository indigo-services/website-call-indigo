import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@strapi/design-systemstorybook-addon',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  // Vite configuration for Strapi compatibility
  viteFinal: async (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@': '/src',
      },
    };
    return config;
  },
};

export default config;
