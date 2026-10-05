import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { HoursTable, type DayOfWeekNames } from "@yext/pages-components";
import "@yext/pages-components/style.css";
import "../typography.css";

type Props = ComponentProps<typeof HoursTable>;

export const TranslatedHoursTable = ({ className, ...props }: Props) => {
  const { t, i18n } = useTranslation();
  const dayOfWeekNames = Object.fromEntries(
    ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(
      (day, index) => [
        day,
        new Intl.DateTimeFormat(i18n.language, {
          weekday: "long",
          timeZone: "UTC",
        }).format(new Date(Date.UTC(2024, 0, index + 1))),
      ],
    ),
  ) as DayOfWeekNames;

  if (props.comingSoon) {
    return (
      <p className={`components bar-social-dining-body ${className ?? ""}`}>
        {t("comingSoon", "Coming Soon")}
      </p>
    );
  }
  return (
    <div className={`components bar-social-dining-body ${className ?? ""}`}>
      <HoursTable
        {...props}
        dayOfWeekNames={props.dayOfWeekNames ?? dayOfWeekNames}
        intervalTranslations={
          props.intervalTranslations ?? {
            isClosed: t("closed", "Closed"),
            open24Hours: t("open24Hours", "Open 24 Hours"),
            reopenDate: t("reopenDate", "Reopen Date"),
            timeFormatLocale: i18n.language,
          }
        }
      />
    </div>
  );
};
