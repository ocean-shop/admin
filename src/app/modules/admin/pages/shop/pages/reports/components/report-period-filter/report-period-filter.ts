import { Component, input, output, signal } from '@angular/core';
import { Input } from '@ui/input/input';
import { RadioGroup } from '@ui/radio-group/radio-group';
import { StateMessage } from '@ui/state-message/state-message';
import {
  REPORTS_FIELD_IDS,
  REPORTS_PERIOD_PRESET_OPTIONS,
  REPORTS_TEXTS,
} from '../../constants/reports.constants';
import {
  buildPresetPeriod,
  isValidReportPeriod,
} from '../../helpers/report-period/report-period.helper';
import { ReportPeriod } from '../../models/report-period.model';
import { ReportPeriodPreset } from '../../models/report-period-preset.type';
import { ReportPeriodSelection } from '../../models/report-period-selection.model';

/** Date range + quick presets; invalid ranges are not emitted. */
@Component({
  selector: 'app-report-period-filter',
  imports: [Input, RadioGroup, StateMessage],
  templateUrl: './report-period-filter.html',
  styleUrl: './report-period-filter.scss',
})
export class ReportPeriodFilter {
  public readonly period = input.required<ReportPeriod>();
  public readonly preset = input<ReportPeriodPreset | null>(null);
  public readonly selectionChange = output<ReportPeriodSelection>();

  protected readonly textData = REPORTS_TEXTS;
  protected readonly fieldIds = REPORTS_FIELD_IDS;
  protected readonly presetOptions = REPORTS_PERIOD_PRESET_OPTIONS;
  protected readonly isInvalid = signal(false);

  protected onFromChange(from: string): void {
    this.emitCustomPeriod({ ...this.period(), from });
  }

  protected onToChange(to: string): void {
    this.emitCustomPeriod({ ...this.period(), to });
  }

  protected onPresetChange(value: string | number | boolean): void {
    const preset = this.presetOptions.find((option) => option.value === value)?.value;
    if (preset) {
      this.isInvalid.set(false);
      this.selectionChange.emit({ period: buildPresetPeriod(preset), preset });
    }
  }

  private emitCustomPeriod(period: ReportPeriod): void {
    const isValid = isValidReportPeriod(period);
    this.isInvalid.set(!isValid);
    if (isValid) {
      this.selectionChange.emit({ period, preset: null });
    }
  }
}
