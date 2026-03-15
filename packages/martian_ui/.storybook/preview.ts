import type { Preview } from "@storybook/react";
import "bulma/css/bulma.min.css";
import "./preview.css";

const preview: Preview = {
  decorators: [
    (Story) => {
      if (typeof document !== "undefined") {
        document.documentElement.dataset.theme = "light";
        document.documentElement.style.colorScheme = "light";
        document.body.dataset.theme = "light";
        document.body.style.colorScheme = "light";
      }
      return Story();
    },
  ],
  parameters: {
    layout: "centered",
  },
};

export default preview;
