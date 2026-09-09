import type { SectionConfig } from "@yext/visual-editor";

import type { PuckComponent } from "@puckeditor/core";
import { HoursStatus } from "@yext/pages-components";
import {
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
    return showCurrentStatus ? "Coming soon" : "";
  }

  if (params.isOpen && params.currentInterval) {
    return `${showCurrentStatus ? "Open until " : ""}${params.currentInterval
      .getEndTime(locale, timeOptions)
      .toLowerCase()}`;
  }

  if (params.futureInterval) {
    const formattedDay = showDayNames
      ? ` ${params.futureInterval.start.setLocale(locale).toLocaleString({
          weekday: dayOfWeekFormat === "short" ? "short" : "long",
        })}`
      : "";

    return `${showCurrentStatus ? "Closed until " : "Until "}${params.futureInterval
      .getStartTime(locale, timeOptions)
      .toLowerCase()}${formattedDay}`;
  }

  return showCurrentStatus ? "Closed today" : "";
};

const statusStripScopeClass = "bar-social-dining-status-strip";
const statusStripScopedTypographyCss = getScopedTypographyCss(statusStripScopeClass);

const BarSocialDiningStatusStripSectionFields: YextFields<BarSocialDiningStatusStripSectionProps> =
  {
    section: {
      label: "Section",
      type: "object",
      objectFields: {
        backgroundColor: {
          label: "Background Color",
          type: "basicSelector",
          options: "BACKGROUND_COLOR",
        },
        visibleOnLivePage: {
          label: "Visible on Live Page",
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
    },
    hours: {
      type: "entityField",
      label: "Hours",
      filter: {
        types: ["type.hours"],
      },
      disableConstantValueToggle: true,
    },
    hoursStyles: {
      label: "Hours Styles",
      type: "object",
      objectFields: {
        showCurrentStatus: {
          label: "Show Current Status",
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
        timeFormat: {
          label: "Time Format",
          type: "select",
          options: [
            { label: "12 Hour", value: "12h" },
            { label: "24 Hour", value: "24h" },
          ],
        },
        dayOfWeekFormat: {
          label: "Day Of Week Format",
          type: "select",
          options: [
            { label: "Short", value: "short" },
            { label: "Long", value: "long" },
          ],
        },
        showDayNames: {
          label: "Show Day Names",
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
    },
    statusText: {
      label: "Status Text",
      type: "object",
      objectFields: {
        styles: {
          label: "Text Styles",
          type: "styledText",
        },
        fontColor: {
          label: "Font Color",
          type: "basicSelector",
          options: "SITE_COLOR",
        },
      },
    },
  };

const BarSocialDiningStatusStripSectionComponent: PuckComponent<
  BarSocialDiningStatusStripSectionProps
> = (props) => {
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
                    locale,
                    props.hoursStyles.timeFormat,
                    props.hoursStyles.dayOfWeekFormat,
                    props.hoursStyles.showCurrentStatus,
                    props.hoursStyles.showDayNames,
                  )}
                </h2>
              )}
            />
          ) : props.puck.isEditing ? (
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
              Open until 9pm
            </h2>
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
