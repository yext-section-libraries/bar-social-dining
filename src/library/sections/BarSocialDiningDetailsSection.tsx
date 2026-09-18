import type { SectionConfig } from "@yext/visual-editor";

import type { PuckComponent } from "@puckeditor/core";
import * as React from "react";
import { Link } from "@yext/pages-components";
import {
  msg,
  Background,
  ComprehensiveCTA,
  EntityField,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  resolveComponentData,
  useDocument,
  type ComprehensiveCTAValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
  toPuckFields,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import type {
  AddressType,
  DayOfWeekNames,
  HoursType,
  IntervalType,
  WeekType,
} from "@yext/pages-components";
import { formatPhoneNumber } from "@yext/visual-editor/section-library-support";
import { createCta } from "../shared/createCta";
import {
  getScopedTypographyCss,
  getTextStyle,
  resolveTextColor,
} from "../shared/sectionStyles";
import { useTranslation } from "react-i18next";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type PhoneItemProps = {
  number: YextEntityField<string>;
  label?: string;
};

type PhoneFieldProps = {
  items: PhoneItemProps[];
  phoneFormat: "international" | "domestic";
  includeHyperlink?: boolean;
};

type TextListProps = {
  text: YextEntityField<TranslatableString[]>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type BarSocialDiningDetailsSectionProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  heading: StyledTextProps;
  findUsHeading: StyledTextProps;
  hoursHeading: StyledTextProps;
  offeringsHeading: StyledTextProps;
  address: YextEntityField<AddressType>;
  showRegion: boolean;
  showCountry: boolean;
  phones: PhoneFieldProps;
  directionsCta: ComprehensiveCTAValue;
  websiteCta: ComprehensiveCTAValue;
  hours: YextEntityField<HoursType>;
  hoursStyles: {
    startOfWeek: keyof DayOfWeekNames | "today";
    collapseDays: boolean;
    showAdditionalHoursText: boolean;
    alignment: "items-start" | "items-center" | "items-end";
  };
  offerings: TextListProps;
};

const createOutlineCta = (label: string): ComprehensiveCTAValue =>
  createCta({
    label,
    variant: "secondary",
    color: {
      selectedColor: "[#171219]",
      contrastingColor: "white",
    },
  });

const paragraphTextStyle = (
  styles: StyledTextValue,
  fontColor: ThemeColor | undefined,
  surfaceColor: ThemeColor,
): React.CSSProperties => ({
  ...getTextStyle(styles, fontColor, surfaceColor),
  lineHeight: 1.5,
  margin: 0,
});

const detailsScopeClass = "bar-social-dining-details";
const detailsScopedTypographyCss = getScopedTypographyCss(detailsScopeClass);

const orderedWeekDays: (keyof WeekType)[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const dayLabels: Record<keyof WeekType, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const formatAddressLines = (
  address: AddressType,
  locale: string,
  showRegion: boolean,
  showCountry: boolean,
): string[] => {
  const line1 = address.line1?.trim() ?? "";
  const line2 = address.line2?.trim() ?? "";
  const city = address.city?.trim() ?? "";
  const region = showRegion ? (address.region?.trim() ?? "") : "";
  const postalCode = address.postalCode?.trim() ?? "";
  const localityLine = city
    ? [city, region].filter(Boolean).join(", ")
    : region;
  const cityRegionPostalLine = [localityLine, postalCode]
    .filter(Boolean)
    .join(localityLine && postalCode ? " " : "");
  const countryCode = showCountry ? (address.countryCode?.trim() ?? "") : "";
  const countryLine =
    countryCode && typeof Intl.DisplayNames === "function"
      ? (new Intl.DisplayNames([locale], { type: "region" }).of(
          countryCode.toUpperCase(),
        ) ?? countryCode)
      : countryCode;

  return [line1, line2, cityRegionPostalLine, countryLine].filter(Boolean);
};

const formatHoursTime = (value: string, locale: string): string => {
  const [hourString, minuteString] = value.split(":");
  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, 0, 1, hour, minute)));
};

const formatHoursIntervals = (
  intervals: IntervalType[] | undefined,
  locale: string,
  t: ReturnType<typeof useTranslation>["t"],
): string => {
  if (!intervals?.length) {
    return "Closed";
  }

  if (
    intervals.length === 1 &&
    intervals[0]?.start === "00:00" &&
    (intervals[0]?.end === "23:59" || intervals[0]?.end === "24:00")
  ) {
    return t("open24Hours", "Open 24 Hours");
  }

  return intervals
    .map((interval) => {
      return `${formatHoursTime(interval.start, locale)} - ${formatHoursTime(
        interval.end,
        locale,
      )}`;
    })
    .join(", ");
};

const buildHoursRows = (
  hours: HoursType,
  locale: string,
  startOfWeek: keyof DayOfWeekNames | "today",
  collapseDays: boolean,
  t: ReturnType<typeof useTranslation>["t"],
): { dayLabel: string; intervalsLabel: string }[] => {
  const startIndex =
    startOfWeek === "today"
      ? (() => {
          const today = new Date().getDay();
          return today === 0 ? 6 : today - 1;
        })()
      : Math.max(orderedWeekDays.indexOf(startOfWeek), 0);
  const orderedDays = [
    ...orderedWeekDays.slice(startIndex),
    ...orderedWeekDays.slice(0, startIndex),
  ];
  const rows = orderedDays.map((dayKey) => {
    const day = hours[dayKey];
    const intervalsLabel = day?.isClosed
      ? "Closed"
      : formatHoursIntervals(day?.openIntervals, locale, t);

    return {
      dayKey,
      dayLabel: dayLabels[dayKey],
      intervalsLabel,
    };
  });

  if (!collapseDays || rows.length === 0) {
    return rows.map(({ dayLabel, intervalsLabel }) => ({
      dayLabel,
      intervalsLabel,
    }));
  }

  return rows.reduce<{ dayLabel: string; intervalsLabel: string }[]>(
    (collapsedRows, row) => {
      const previousRow = collapsedRows[collapsedRows.length - 1];

      if (!previousRow || previousRow.intervalsLabel !== row.intervalsLabel) {
        collapsedRows.push({
          dayLabel: row.dayLabel,
          intervalsLabel: row.intervalsLabel,
        });
        return collapsedRows;
      }

      previousRow.dayLabel = `${previousRow.dayLabel} - ${row.dayLabel}`;
      return collapsedRows;
    },
    [],
  );
};

const normalizeTextList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (typeof item === "object" && item !== null && "defaultValue" in item) {
        const localizedItem = item as { defaultValue?: string };
        return localizedItem.defaultValue ?? "";
      }

      return "";
    })
    .filter((item) => item.length > 0);
};

const BarSocialDiningDetailsSectionFields: YextFields<BarSocialDiningDetailsSectionProps> =
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
    heading: {
      label: msg("fields.heading", "Heading"),
      type: "object",
      objectFields: {
        text: {
          type: "entityField",
          label: msg("fields.text", "Text"),
          filter: {
            types: ["type.string"],
          },
        },
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
    findUsHeading: {
      label: msg("fields.findUsHeading", "Find Us Heading"),
      type: "object",
      objectFields: {
        text: {
          type: "entityField",
          label: msg("fields.text", "Text"),
          filter: {
            types: ["type.string"],
          },
        },
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
    hoursHeading: {
      label: msg("fields.hoursHeading", "Hours Heading"),
      type: "object",
      objectFields: {
        text: {
          type: "entityField",
          label: msg("fields.text", "Text"),
          filter: {
            types: ["type.string"],
          },
        },
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
    offeringsHeading: {
      label: msg("fields.offeringsHeading", "Offerings Heading"),
      type: "object",
      objectFields: {
        text: {
          type: "entityField",
          label: msg("fields.text", "Text"),
          filter: {
            types: ["type.string"],
          },
        },
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
    address: {
      type: "entityField",
      label: msg("fields.address", "Address"),
      filter: {
        types: ["type.address"],
      },
    },
    showRegion: {
      label: msg("fields.showRegion", "Show Region"),
      type: "radio",
      options: [
        { label: msg("fields.options.yes", "Yes"), value: true },
        { label: msg("fields.options.no", "No"), value: false },
      ],
    },
    showCountry: {
      label: msg("fields.showCountry", "Show Country"),
      type: "radio",
      options: [
        { label: msg("fields.options.yes", "Yes"), value: true },
        { label: msg("fields.options.no", "No"), value: false },
      ],
    },
    phones: {
      label: msg("fields.phones", "Phones"),
      type: "object",
      objectFields: {
        items: {
          label: msg("fields.items", "Items"),
          type: "array",
          arrayFields: {
            number: {
              type: "entityField",
              label: msg("fields.number", "Number"),
              filter: {
                types: ["type.phone"],
              },
            },
            label: {
              label: msg("fields.label", "Label"),
              type: "text",
            },
          },
          defaultItemProps: {
            number: {
              field: "",
              constantValue: "",
              constantValueEnabled: true,
            },
            label: "",
          },
          getItemSummary: (item) => item.label || item.number?.field || "Phone",
        },
        phoneFormat: {
          label: msg("fields.phoneFormat", "Phone Format"),
          type: "radio",
          options: [
            { label: msg("fields.options.domestic", "Domestic"), value: "domestic" },
            { label: msg("fields.options.international", "International"), value: "international" },
          ],
        },
        includeHyperlink: {
          label: msg("fields.includeHyperlink", "Include Hyperlink"),
          type: "radio",
          options: [
            { label: msg("fields.options.yes", "Yes"), value: true },
            { label: msg("fields.options.no", "No"), value: false },
          ],
        },
      },
    },
    directionsCta: {
      label: msg("fields.directionsCta", "Directions CTA"),
      type: "comprehensiveCTA",
    },
    websiteCta: {
      label: msg("fields.websiteCta", "Website CTA"),
      type: "comprehensiveCTA",
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
        startOfWeek: {
          label: msg("fields.startOfWeek", "Start Of Week"),
          type: "select",
          options: [
            { label: msg("fields.options.monday", "Monday"), value: "monday" },
            { label: msg("fields.options.tuesday", "Tuesday"), value: "tuesday" },
            { label: msg("fields.options.wednesday", "Wednesday"), value: "wednesday" },
            { label: msg("fields.options.thursday", "Thursday"), value: "thursday" },
            { label: msg("fields.options.friday", "Friday"), value: "friday" },
            { label: msg("fields.options.saturday", "Saturday"), value: "saturday" },
            { label: msg("fields.options.sunday", "Sunday"), value: "sunday" },
            { label: msg("fields.options.today", "Today"), value: "today" },
          ],
        },
        collapseDays: {
          label: msg("fields.collapseDays", "Collapse Days"),
          type: "radio",
          options: [
            { label: msg("fields.options.yes", "Yes"), value: true },
            { label: msg("fields.options.no", "No"), value: false },
          ],
        },
        showAdditionalHoursText: {
          label: msg("fields.showAdditionalHoursText", "Show Additional Hours Text"),
          type: "radio",
          options: [
            { label: msg("fields.options.yes", "Yes"), value: true },
            { label: msg("fields.options.no", "No"), value: false },
          ],
        },
        alignment: {
          label: msg("fields.alignment", "Alignment"),
          type: "select",
          options: [
            { label: msg("fields.options.start", "Start"), value: "items-start" },
            { label: msg("fields.options.center", "Center"), value: "items-center" },
            { label: msg("fields.options.end", "End"), value: "items-end" },
          ],
        },
      },
    },
    offerings: {
      label: msg("fields.offerings", "Offerings"),
      type: "object",
      objectFields: {
        text: {
          type: "entityField",
          label: msg("fields.textList", "Text List"),
          filter: {
            types: ["type.string"],
            includeListsOnly: true,
          },
        },
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

const BarSocialDiningDetailsSectionComponent: PuckComponent<
  BarSocialDiningDetailsSectionProps
> = ({ id, ...props }) => {
  const streamDocument = useDocument<{
    locale?: string;
    comingSoon?: boolean;
    additionalHoursText?: string;
  }>();
  const { t } = useTranslation();
  const locale = streamDocument.locale ?? "en";
  const sectionForeground = resolveTextColor(
    undefined,
    props.section.backgroundColor,
  );
  const resolvedHeading = resolveComponentData(
    props.heading.text,
    locale,
    streamDocument,
    { output: "plainText" },
  );
  const resolvedFindUsHeading = resolveComponentData(
    props.findUsHeading.text,
    locale,
    streamDocument,
    { output: "plainText" },
  );
  const resolvedHoursHeading = resolveComponentData(
    props.hoursHeading.text,
    locale,
    streamDocument,
    { output: "plainText" },
  );
  const resolvedOfferingsHeading = resolveComponentData(
    props.offeringsHeading.text,
    locale,
    streamDocument,
    { output: "plainText" },
  );
  const resolvedAddress = resolveComponentData(
    props.address,
    locale,
    streamDocument,
  );
  const resolvedHours = resolveComponentData(
    props.hours,
    locale,
    streamDocument,
  );
  const resolvedOfferings = normalizeTextList(
    resolveComponentData(props.offerings.text, locale, streamDocument),
  );
  const resolvedAddressLines = resolvedAddress
    ? formatAddressLines(
        resolvedAddress,
        locale,
        props.showRegion,
        props.showCountry,
      )
    : [];
  const resolvedHoursRows = resolvedHours
    ? buildHoursRows(
        resolvedHours,
        locale,
        props.hoursStyles.startOfWeek,
        props.hoursStyles.collapseDays,
        t,
      )
    : [];
  const hasOfferings = resolvedOfferings.length > 0;
  const additionalHoursText =
    typeof streamDocument.additionalHoursText === "string"
      ? streamDocument.additionalHoursText.trim()
      : "";
  const resolvedPhoneItems = (props.phones.items ?? []).flatMap((item) => {
    const resolvedNumber = resolveComponentData(
      item.number,
      locale,
      streamDocument,
    );
    const normalizedNumber =
      typeof resolvedNumber === "string" ? resolvedNumber.trim() : "";

    if (!normalizedNumber) {
      return [];
    }

    return [
      {
        label: item.label?.trim() ?? "",
        formattedNumber: formatPhoneNumber(
          normalizedNumber,
          props.phones.phoneFormat,
        ),
        linkValue: normalizedNumber.replace(/[^\d+]/g, ""),
        fieldId: item.number.field,
        constantValueEnabled: item.number.constantValueEnabled,
      },
    ];
  });
  const hoursAlignment =
    props.hoursStyles.alignment === "items-center"
      ? "center"
      : props.hoursStyles.alignment === "items-end"
        ? "flex-end"
        : "flex-start";

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BarSocialDiningDetailsSection${getAnalyticsScopeHash(id)}`}
      >
        <style>{detailsScopedTypographyCss}</style>
        <Background
          as="section"
          background={props.section.backgroundColor}
          className={detailsScopeClass}
          style={{
            ...getSurfaceColorStyle(
              props.section.backgroundColor,
              streamDocument,
            ),
            padding: "72px 24px",
          }}
        >
          <div
            style={{
              margin: "0 auto",
              maxWidth: "var(--maxWidth-pageSection-contentWidth, 1200px)",
            }}
          >
            <div style={{ marginBottom: "32px", textAlign: "center" }}>
              <EntityField
                displayName="Heading"
                fieldId={props.heading.text.field}
                constantValueEnabled={props.heading.text.constantValueEnabled}
              >
                <h2
                  style={{
                    ...getTextStyle(
                      props.heading.styles,
                      props.heading.fontColor,
                      props.section.backgroundColor,
                    ),
                    margin: 0,
                  }}
                >
                  {typeof resolvedHeading === "string" ? resolvedHeading : ""}
                </h2>
              </EntityField>
            </div>
            <div
              style={{
                display: "grid",
                gap: "28px",
                gridTemplateColumns: hasOfferings
                  ? "repeat(auto-fit, minmax(260px, 1fr))"
                  : "repeat(auto-fit, minmax(320px, 1fr))",
              }}
            >
              <article>
                <EntityField
                  displayName="Find Us Heading"
                  fieldId={props.findUsHeading.text.field}
                  constantValueEnabled={
                    props.findUsHeading.text.constantValueEnabled
                  }
                >
                  <h3
                    style={{
                      ...getTextStyle(
                        props.findUsHeading.styles,
                        props.findUsHeading.fontColor,
                        props.section.backgroundColor,
                      ),
                      margin: "0 0 8px",
                    }}
                  >
                    {typeof resolvedFindUsHeading === "string"
                      ? resolvedFindUsHeading
                      : ""}
                  </h3>
                </EntityField>
                {resolvedAddress ? (
                  <EntityField
                    displayName="Address"
                    fieldId={props.address.field}
                    constantValueEnabled={props.address.constantValueEnabled}
                  >
                    <div
                      style={{
                        ...paragraphTextStyle(
                          {
                            fontFamily: "default",
                            fontSize: "default",
                            fontWeight: "default",
                            fontStyle: "default",
                            textTransform: "default",
                          },
                          undefined,
                          props.section.backgroundColor,
                        ),
                        color: sectionForeground,
                      }}
                    >
                      {resolvedAddressLines.map((line, index) => (
                        <p
                          key={`${line}-${index}`}
                          style={{ color: "inherit", margin: 0 }}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </EntityField>
                ) : null}
                <div
                  className="bar-social-dining-link-typography"
                  style={{
                    ...paragraphTextStyle(
                      {
                        fontFamily: "default",
                        fontSize: "default",
                        fontWeight: "default",
                        fontStyle: "default",
                        textTransform: "default",
                      },
                      undefined,
                      props.section.backgroundColor,
                    ),
                    color: sectionForeground,
                    marginTop: "8px",
                  }}
                >
                  {resolvedPhoneItems.map((item, index) => (
                    <EntityField
                      key={`${item.fieldId}-${index}`}
                      displayName="Phone Number"
                      fieldId={item.fieldId}
                      constantValueEnabled={item.constantValueEnabled}
                    >
                      {props.phones.includeHyperlink ? (
                        <p style={{ margin: 0 }}>
                          {item.label ? `${item.label} ` : null}
                          <Link
                            cta={{
                              link: item.linkValue,
                              linkType: "PHONE",
                            }}
                            eventName="phoneCta"
                            style={{ color: "inherit" }}
                          >
                            {item.formattedNumber}
                          </Link>
                        </p>
                      ) : (
                        <p style={{ margin: 0 }}>
                          {item.label
                            ? `${item.label} ${item.formattedNumber}`
                            : item.formattedNumber}
                        </p>
                      )}
                    </EntityField>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "16px",
                    marginTop: "16px",
                  }}
                >
                  <EntityField
                    displayName="Directions CTA"
                    fieldId={props.directionsCta.data.cta.field}
                    constantValueEnabled={
                      props.directionsCta.data.cta.constantValueEnabled
                    }
                  >
                    <ComprehensiveCTA
                      value={
                        props.directionsCta as Partial<ComprehensiveCTAValue>
                      }
                      eventName="getDirections"
                    />
                  </EntityField>
                  <EntityField
                    displayName="Website CTA"
                    fieldId={props.websiteCta.data.cta.field}
                    constantValueEnabled={
                      props.websiteCta.data.cta.constantValueEnabled
                    }
                  >
                    <ComprehensiveCTA
                      value={props.websiteCta as Partial<ComprehensiveCTAValue>}
                      eventName="websiteCta"
                    />
                  </EntityField>
                </div>
              </article>
              <article>
                <EntityField
                  displayName="Hours Heading"
                  fieldId={props.hoursHeading.text.field}
                  constantValueEnabled={
                    props.hoursHeading.text.constantValueEnabled
                  }
                >
                  <h3
                    style={{
                      ...getTextStyle(
                        props.hoursHeading.styles,
                        props.hoursHeading.fontColor,
                        props.section.backgroundColor,
                      ),
                      margin: "0 0 8px",
                    }}
                  >
                    {typeof resolvedHoursHeading === "string"
                      ? resolvedHoursHeading
                      : ""}
                  </h3>
                </EntityField>
                {resolvedHours ? (
                  <EntityField
                    displayName="Hours"
                    fieldId={props.hours.field}
                    constantValueEnabled={props.hours.constantValueEnabled}
                  >
                    <div
                      style={{
                        alignItems: hoursAlignment,
                        ...paragraphTextStyle(
                          {
                            fontFamily: "default",
                            fontSize: "default",
                            fontWeight: "default",
                            fontStyle: "default",
                            textTransform: "default",
                          },
                          undefined,
                          props.section.backgroundColor,
                        ),
                        color: sectionForeground,
                        display: "flex",
                        flexDirection: "column",
                        textAlign:
                          hoursAlignment === "center"
                            ? "center"
                            : hoursAlignment === "flex-end"
                              ? "right"
                              : "left",
                      }}
                    >
                      {streamDocument.comingSoon ? (
                        <p style={{ color: "inherit", margin: 0 }}>
                          {t("comingSoon", "Coming Soon")}
                        </p>
                      ) : (
                        resolvedHoursRows.map((row) => (
                          <p
                            key={`${row.dayLabel}-${row.intervalsLabel}`}
                            style={{ color: "inherit", margin: 0 }}
                          >
                            {`${row.dayLabel}: ${row.intervalsLabel}`}
                          </p>
                        ))
                      )}
                      {props.hoursStyles.showAdditionalHoursText &&
                      additionalHoursText ? (
                        <p style={{ color: "inherit", margin: "12px 0 0" }}>
                          {additionalHoursText}
                        </p>
                      ) : null}
                    </div>
                  </EntityField>
                ) : null}
              </article>
              {hasOfferings ? (
                <article>
                  <EntityField
                    displayName="Offerings Heading"
                    fieldId={props.offeringsHeading.text.field}
                    constantValueEnabled={
                      props.offeringsHeading.text.constantValueEnabled
                    }
                  >
                    <h3
                      style={{
                        ...getTextStyle(
                          props.offeringsHeading.styles,
                          props.offeringsHeading.fontColor,
                          props.section.backgroundColor,
                        ),
                        margin: "0 0 8px",
                      }}
                    >
                      {typeof resolvedOfferingsHeading === "string"
                        ? resolvedOfferingsHeading
                        : ""}
                    </h3>
                  </EntityField>
                  <EntityField
                    displayName="Text List"
                    fieldId={props.offerings.text.field}
                    constantValueEnabled={
                      props.offerings.text.constantValueEnabled
                    }
                  >
                    <ul
                      style={{
                        ...getTextStyle(
                          props.offerings.styles,
                          props.offerings.fontColor,
                          props.section.backgroundColor,
                        ),
                        margin: 0,
                        paddingLeft: "1rem",
                      }}
                    >
                      {resolvedOfferings.map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </EntityField>
                </article>
              ) : null}
            </div>
          </div>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const BarSocialDiningDetailsSection: YextComponentConfig<BarSocialDiningDetailsSectionProps> =
  {
    label: "Details Section",
    fields: toPuckFields<BarSocialDiningDetailsSectionProps>(
      BarSocialDiningDetailsSectionFields,
    ),
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Restaurant Details",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
      },
      findUsHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Find Us",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
      },
      hoursHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Hours",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
      },
      offeringsHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Offerings",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
      },
      address: {
        field: "address",
        constantValue: {
          line1: "",
          city: "",
          postalCode: "",
          countryCode: "",
          region: "",
        },
        constantValueEnabled: false,
      },
      showRegion: true,
      showCountry: false,
      phones: {
        items: [
          {
            number: {
              field: "mainPhone",
              constantValue: "",
              constantValueEnabled: false,
            },
            label: "",
          },
        ],
        phoneFormat: "domestic",
        includeHyperlink: true,
      },
      directionsCta: createOutlineCta("Get Directions"),
      websiteCta: createOutlineCta("Visit Us Online"),
      hours: {
        field: "hours",
        constantValue: {},
        constantValueEnabled: false,
      },
      hoursStyles: {
        startOfWeek: "monday",
        collapseDays: false,
        showAdditionalHoursText: false,
        alignment: "items-start",
      },
      offerings: {
        text: {
          field: "services",
          constantValue: [
            { defaultValue: "Dine-in", hasLocalizedValue: "true" },
            { defaultValue: "Takeout", hasLocalizedValue: "true" },
            { defaultValue: "Delivery", hasLocalizedValue: "true" },
            { defaultValue: "Curbside pickup", hasLocalizedValue: "true" },
            { defaultValue: "Call-Ahead", hasLocalizedValue: "true" },
            {
              defaultValue: "Reservations available through OpenTable",
              hasLocalizedValue: "true",
            },
            { defaultValue: "Handicap access", hasLocalizedValue: "true" },
            {
              defaultValue: "No Wi-Fi available to guests",
              hasLocalizedValue: "true",
            },
            {
              defaultValue: "Safe handling is supported",
              hasLocalizedValue: "true",
            },
          ],
          constantValueEnabled: false,
        },
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
    render: (props) => <BarSocialDiningDetailsSectionComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "BarSocialDiningDetailsSection",
  displayName: "Details Section",
  description: "Details Section",
  pageSetTypes: ["ENTITY"],
};
