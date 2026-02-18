import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Input } from "@openai/apps-sdk-ui/components/Input";

type Props = {
  gregorianDateTime: string;
  imperialTimezone: string;
  onConvert: () => void;
  onGregorianDateTimeChange: (value: string) => void;
  onImperialTimezoneChange: (value: string) => void;
  running: boolean;
};

export default function Grdt2ImdtTab({
  gregorianDateTime,
  imperialTimezone,
  onConvert,
  onGregorianDateTimeChange,
  onImperialTimezoneChange,
  running,
}: Props) {
  return (
    <section className="mt-4 rounded-xl border border-subtle p-3">
      <div className="grid gap-3">
        <label className="text-sm text-secondary">
          グレゴリオ曆日時 (ISO 8601)
          <Input
            className="mt-1"
            onChange={(e) => onGregorianDateTimeChange(e.target.value)}
            size="sm"
            style={{ width: "100%" }}
            value={gregorianDateTime}
          />
        </label>
        <label className="text-sm text-secondary">
          帝國火星曆タイムゾーン
          <Input
            className="mt-1"
            onChange={(e) => onImperialTimezoneChange(e.target.value)}
            size="sm"
            style={{ width: "100%" }}
            value={imperialTimezone}
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
