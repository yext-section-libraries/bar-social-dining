import * as React from "react";
import {
  MaybeRTF,
  getDefaultForegroundColor,
  getThemeColorCssValue,
  type MaybeRTFProps,
  type RichText,
  type StreamDocument,
  type StyledTextValue,
  type ThemeColor,
} from "@yext/visual-editor";

export const hasExplicitThemeColor = (
  color?: ThemeColor,
): color is ThemeColor => {
  return Boolean(color?.selectedColor && color.selectedColor !== "default");
};

export const getReadableForegroundColor = (
  surfaceColor: ThemeColor,
  streamDocument?: StreamDocument | Record<string, unknown>,
): ThemeColor => {
  return (
    getDefaultForegroundColor(surfaceColor, streamDocument) ?? {
      selectedColor: surfaceColor.contrastingColor || "black",
      contrastingColor: surfaceColor.selectedColor,
    }
  );
};

export const resolveTextColor = (
  fontColor: ThemeColor | undefined,
  surfaceColor: ThemeColor,
  streamDocument?: StreamDocument | Record<string, unknown>,
): string | undefined => {
  const color = hasExplicitThemeColor(fontColor)
    ? fontColor
    : getReadableForegroundColor(surfaceColor, streamDocument);

  return getThemeColorCssValue(color.selectedColor);
};

export const getTextStyle = (
  styles: StyledTextValue,
  fontColor?: ThemeColor,
  surfaceColor?: ThemeColor,
  streamDocument?: StreamDocument | Record<string, unknown>,
): React.CSSProperties => ({
  color: surfaceColor
    ? resolveTextColor(fontColor, surfaceColor, streamDocument)
    : undefined,
  fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
  textTransform:
    styles.textTransform === "default" ? undefined : styles.textTransform,
});

export const renderRichText = (
  value: unknown,
  richTextStyleOverrides?: MaybeRTFProps["richTextStyleOverrides"],
): React.ReactNode => {
  if (React.isValidElement(value)) {
    return value;
  }

  const data =
    typeof value === "string" ||
    (typeof value === "object" && value !== null && "html" in value)
      ? (value as RichText | string)
      : undefined;

  return (
    <MaybeRTF
      data={data}
      richTextStyleOverrides={richTextStyleOverrides}
    />
  );
};

export const getScopedTypographyCss = (scopeClass: string): string => `
  .${scopeClass} p,
  .${scopeClass} li {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  ${[1, 2, 3, 4, 5, 6]
    .map(
      (level) => `.${scopeClass} h${level} {
    font-family: var(--fontFamily-h${level}-fontFamily);
    font-size: var(--fontSize-h${level}-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h${level}-fontWeight);
    font-style: var(--fontStyle-h${level}-fontStyle);
    text-transform: var(--textTransform-h${level}-textTransform);
  }`,
    )
    .join("\n\n  ")}

  .${scopeClass} .bar-social-dining-link-typography a {
    font-family: var(--fontFamily-link-fontFamily);
    font-size: var(--fontSize-link-fontSize);
    font-weight: var(--fontWeight-link-fontWeight);
    font-style: var(--fontStyle-link-fontStyle);
    line-height: 1.5;
    text-decoration: underline;
    text-transform: var(--textTransform-link-textTransform);
    letter-spacing: var(--letterSpacing-link-letterSpacing);
  }
`;
