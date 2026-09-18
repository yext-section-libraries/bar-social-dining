import type { SectionConfig } from "@yext/visual-editor";

import type { PuckComponent } from "@puckeditor/core";
import { HoursStatus } from "@yext/pages-components";
import { useTranslation } from "react-i18next";
import {
  msg,
  Background,
  EntityField,
  getSurfaceColorStyle,
  type StyledTextValue,
  type ThemeColor,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
  resolveComponentData,
  toPuckFields,
  useDocument,
} from "@yext/visual-editor";
import type { HoursType, StatusParams } from "@yext/pages-components";
import {
  getScopedTypographyCss,
  getTextStyle as textStyle,
} from "../shared/sectionStyles";

type BarSocialDiningStatusStripSectionProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  hours: YextEntityField<HoursType>;
  hoursStyles: {
    showCurrentStatus: boolean;
    timeFormat: "12h" | "24h";
    dayOfWeekFormat: "short" | "long";
    showDayNames: boolean;
  };
  statusText: {
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
};

/**
 * Formats the HoursStatus params into the captured single-line "Open until"
 * treatment while keeping the runtime hours primitive as the source of truth.
 */
const renderStatusLabel = (
  params: StatusParams,
  t: ReturnType<typeof useTranslation>["t"],
  locale: string,
  timeFormat: "12h" | "24h",
  dayOfWeekFormat: "short" | "long",
  showCurrentStatus: boolean,
  showDayNames: boolean,
): string => {
  const timeOptions: Intl.DateTimeFormatOptions =
    timeFormat === "24h"
      ? { hour: "2-digit", minute: "2-digit", hour12: false }
      : { hour: "numeric", minute: "2-digit", hour12: true };

  if (params.comingSoon) {
    return showCurrentStatus ? t("statusComingSoon", "Coming soon") : "";
  }

  if (params.isOpen && params.currentInterval) {
    const endTime = params.currentInterval
      .getEndTime(locale, timeOptions)
      .toLowerCase();
    return showCurrentStatus
      ? t("openUntilTime", "Open until {{time}}", { time: endTime })
      : endTime;
  }

  if (params.futureInterval) {
    const formattedDay = showDayNames
      ? ` ${params.futureInterval.start.setLocale(locale).toLocaleString({
          weekday: dayOfWeekFormat === "short" ? "short" : "long",
        })}`
      : "";

    const startTime = params.futureInterval
      .getStartTime(locale, timeOptions)
      .toLowerCase();

    return showCurrentStatus
      ? t("closedUntilTime", "Closed until {{time}}{{day}}", {
          time: startTime,
          day: formattedDay,
        })
      : t("untilTime", "Until {{time}}{{day}}", {
          time: startTime,
          day: formattedDay,
        });
  }

  return showCurrentStatus ? t("closedToday", "Closed today") : "";
};

const statusStripScopeClass = "bar-social-dining-status-strip";
const statusStripScopedTypographyCss = getScopedTypographyCss(
  statusStripScopeClass,
);

const BarSocialDiningStatusStripSectionFields: YextFields<BarSocialDiningStatusStripSectionProps> =
  {
    section: {
      label: msg("fields.section", "Section"),
      type: "object",
      objectFields: {
        backgroundColor: {
          label: msg("fields.backgroundColor", "Background Color"),
          type: "basicSelector",
          options: "BACKGROUND_COLOR",
        },
        visibleOnLivePage: {
          label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
          type: "radio",
          options: [
            { label: msg("fields.options.yes", "Yes"), value: true },
            { label: msg("fields.options.no", "No"), value: false },
          ],
        },
      },
    },
    hours: {
      type: "entityField",
      label: msg("fields.hours", "Hours"),
      filter: {
        types: ["type.hours"],
      },
      disableConstantValueToggle: true,
    },
    hoursStyles: {
      label: msg("fields.hoursStyles", "Hours Styles"),
      type: "object",
      objectFields: {
        showCurrentStatus: {
          label: msg("fields.showCurrentStatus", "Show Current Status"),
          type: "radio",
          options: [
            { label: msg("fields.options.yes", "Yes"), value: true },
            { label: msg("fields.options.no", "No"), value: false },
          ],
        },
        timeFormat: {
          label: msg("fields.timeFormat", "Time Format"),
          type: "select",
          options: [
            {
              label: msg("fields.options.hour12Label", "12 Hour"),
              value: "12h",
            },
            {
              label: msg("fields.options.hour24Label", "24 Hour"),
              value: "24h",
            },
          ],
        },
        dayOfWeekFormat: {
          label: msg("fields.dayOfWeekFormatLabel", "Day Of Week Format"),
          type: "select",
          options: [
            { label: msg("fields.options.short", "Short"), value: "short" },
            { label: msg("fields.options.long", "Long"), value: "long" },
          ],
        },
        showDayNames: {
          label: msg("fields.showDayNames", "Show Day Names"),
          type: "radio",
          options: [
            { label: msg("fields.options.yes", "Yes"), value: true },
            { label: msg("fields.options.no", "No"), value: false },
          ],
        },
      },
    },
    statusText: {
      label: msg("fields.statusText", "Status Text"),
      type: "object",
      objectFields: {
        styles: {
          label: msg("fields.textStyles", "Text Styles"),
          type: "styledText",
        },
        fontColor: {
          label: msg("fields.fontColor", "Font Color"),
          type: "basicSelector",
          options: "SITE_COLOR",
        },
      },
    },
  };

const BarSocialDiningStatusStripSectionComponent: PuckComponent<
  BarSocialDiningStatusStripSectionProps
> = (props) => {
  const { t } = useTranslation();
  const streamDocument = useDocument<{
    locale?: string;
    timezone?: string;
    comingSoon?: boolean;
  }>();
  const locale = streamDocument.locale ?? "en";
  const timezone =
    streamDocument.timezone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    "UTC";
  const resolvedHours = resolveComponentData(
    props.hours,
    locale,
    streamDocument,
  );
  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <style>{statusStripScopedTypographyCss}</style>
      <Background
        as="section"
        background={props.section.backgroundColor}
        className={statusStripScopeClass}
        style={{
          ...getSurfaceColorStyle(
            props.section.backgroundColor,
            streamDocument,
          ),
          padding: "20px 16px",
          textAlign: "center",
        }}
      >
        <EntityField
          displayName="Hours"
          fieldId={props.hours.field}
          constantValueEnabled={props.hours.constantValueEnabled}
        >
          {resolvedHours ? (
            <HoursStatus
              hours={resolvedHours}
              timezone={timezone}
              comingSoon={streamDocument.comingSoon}
              timeOptions={
                props.hoursStyles.timeFormat === "24h"
                  ? { hour: "2-digit", minute: "2-digit", hour12: false }
                  : { hour: "numeric", minute: "2-digit", hour12: true }
              }
              dayOptions={{
                weekday:
                  props.hoursStyles.dayOfWeekFormat === "short"
                    ? "short"
                    : "long",
              }}
              statusTemplate={(params) => (
                <h2
                  style={{
                    margin: 0,
                    ...textStyle(
                      props.statusText.styles,
                      props.statusText.fontColor,
                      props.section.backgroundColor,
                    ),
                  }}
                >
                  {renderStatusLabel(
                    params,
                    t,
                    locale,
                    props.hoursStyles.timeFormat,
                    props.hoursStyles.dayOfWeekFormat,
                    props.hoursStyles.showCurrentStatus,
                    props.hoursStyles.showDayNames,
                  )}
                </h2>
              )}
            />
          ) : null}
        </EntityField>
      </Background>
    </VisibilityWrapper>
  );
};

export const BarSocialDiningStatusStripSection: YextComponentConfig<BarSocialDiningStatusStripSectionProps> =
  {
    label: "Status Strip Section",
    fields: toPuckFields<BarSocialDiningStatusStripSectionProps>(
      BarSocialDiningStatusStripSectionFields,
    ),
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "palette-secondary",
          contrastingColor: "palette-secondary-contrast",
        },
        visibleOnLivePage: true,
      },
      hours: {
        field: "hours",
        constantValue: {},
        constantValueEnabled: false,
      },
      hoursStyles: {
        showCurrentStatus: true,
        timeFormat: "12h",
        dayOfWeekFormat: "short",
        showDayNames: false,
      },
      statusText: {
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
      },
    },
    render: (props) => (
      <BarSocialDiningStatusStripSectionComponent {...props} />
    ),
  };

export const config: SectionConfig = {
  id: "BarSocialDiningStatusStripSection",
  displayName: "Status Strip Section",
  description: "Status Strip Section",
  pageSetTypes: ["ENTITY"],
};
