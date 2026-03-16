import CurrentImperialDatetimeWidget from "./CurrentImperialDatetimeWidget";
import { mountWidget } from "./widgetHost";

const root = document.getElementById("root");
if (root !== null) {
  mountWidget(
    {
      appInfoName: "martian_current_imperial_datetime_widget",
      component: CurrentImperialDatetimeWidget,
      fallbackMode: "get_current_imperial",
    },
    root,
  );
}
