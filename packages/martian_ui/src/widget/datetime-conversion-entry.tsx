import DatetimeConversionWidget from "./DatetimeConversionWidget";
import { mountWidget } from "./widgetHost";

const root = document.getElementById("root");
if (root !== null) {
  mountWidget(
    {
      appInfoName: "martian_datetime_conversion_widget",
      component: DatetimeConversionWidget,
      fallbackMode: "convert_gregorian_to_imperial",
    },
    root,
  );
}
