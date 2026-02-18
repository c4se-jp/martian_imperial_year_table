import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Input } from "@openai/apps-sdk-ui/components/Input";

type Props = {
  currentTimezone: string;
  onCurrentTimezoneChange: (value: string) => void;
  onFetch: () => void;
  running: boolean;
};

export default function NowTab({ currentTimezone, onCurrentTimezoneChange, onFetch, running }: Props) {
  return (
    <section className="mt-4 rounded-xl border border-subtle p-3">
      <div className="grid gap-3">
        <label className="text-sm text-secondary">
          火星曆タイムゾーン
          <Input
            className="mt-1"
            onChange={(e) => onCurrentTimezoneChange(e.target.value)}
            size="sm"
            style={{ width: "100%" }}
            value={currentTimezone}
          />
        </label>
        <div>
          <Button color="primary" size="sm" loading={running} onClick={onFetch}>
            取得する
          </Button>
        </div>
      </div>
    </section>
  );
}
