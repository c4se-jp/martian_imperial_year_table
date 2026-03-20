import type { StorybookConfig } from "@storybook/preact-vite";

const config: StorybookConfig = {
  framework: "@storybook/preact-vite",
  stories: ["../src/**/*.stories.@(ts|tsx)"],
};

export default config;
