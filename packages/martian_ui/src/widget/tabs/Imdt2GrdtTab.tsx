import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Input } from "@openai/apps-sdk-ui/components/Input";

type Props = {
  gregorianTimezone: string;
  imperialDateTimeFormatted: string;
  onConvert: () => void;
  onGregorianTimezoneChange: (value: string) => void;
  onImperialDateTimeFormattedChange: (value: string) => void;
  running: boolean;
};

export default function Imdt2GrdtTab({
  gregorianTimezone,
  imperialDateTimeFormatted,
  onConvert,
  onGregorianTimezoneChange,
  onImperialDateTimeFormattedChange,
  running,
}: Props) {
  return (
    <section className="mt-4 rounded-xl border border-subtle p-3">
      <div className="grid gap-3">
        <label className="text-sm text-secondary">
          帝國火星曆日時 (YYYY-MM-DDTHH:mm:ss±HH:MM)
          <Input
            className="mt-1"
            onChange={(e) => onImperialDateTimeFormattedChange(e.target.value)}
            size="sm"
            style={{ width: "100%" }}
            value={imperialDateTimeFormatted}
          />
        </label>
        <label className="text-sm text-secondary">
          グレゴリオ曆タイムゾーン
          <Input
            className="mt-1"
            onChange={(e) => onGregorianTimezoneChange(e.target.value)}
            size="sm"
            style={{ width: "100%" }}
            value={gregorianTimezone}
          />
        </label>
        <div>
          <Button color="primary" size="sm" loading={running} onClick={onConvert}>
            變換する
          </Button>
        </div>
      </div>
    </section>
  );
}
