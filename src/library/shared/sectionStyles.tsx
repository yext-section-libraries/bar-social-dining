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
import "./typography.css";

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

export const resolveTextStyles = (
  styles?: MaybeRTFProps["richTextStyleOverrides"],
) => ({
  fontFamily: styles?.fontFamily === "default" ? undefined : styles?.fontFamily,
  fontSize: styles?.fontSize === "default" ? undefined : styles?.fontSize,
  fontWeight: styles?.fontWeight === "default" ? undefined : styles?.fontWeight,
  fontStyle: styles?.fontStyle === "default" ? undefined : styles?.fontStyle,
  textTransform:
    styles?.textTransform === "default" ? undefined : styles?.textTransform,
});

// These inherited properties survive nested platform .components token resets.
export const resolveBodyStyles = (
  styles?: MaybeRTFProps["richTextStyleOverrides"],
): React.CSSProperties => {
  const resolved = resolveTextStyles(styles);
  const variables = Object.fromEntries(
    Object.entries(resolved)
      .filter(([, value]) => value !== undefined)
      .map(([property, value]) => [`--bar-social-dining-body-${property}`, value]),
  );
  return { ...resolved, ...variables };
};

export const getTextStyle = (
  styles?: Partial<StyledTextValue>,
  fontColor?: ThemeColor,
  surfaceColor?: ThemeColor,
  streamDocument?: StreamDocument | Record<string, unknown>,
): React.CSSProperties => ({
  ...resolveBodyStyles(styles),
  color: surfaceColor
    ? resolveTextColor(fontColor, surfaceColor, streamDocument)
    : undefined,
});

const richTextStyle = (
  styles?: MaybeRTFProps["richTextStyleOverrides"],
): React.CSSProperties => {
  const bodyVariables = Object.fromEntries(
    Object.entries(resolveTextStyles(styles))
      .filter(([, value]) => value !== undefined)
      .map(([property, value]) => [`--${property}-body-${property}`, value]),
  );
  return { ...resolveBodyStyles(styles), ...bodyVariables };
};

// Resolved rich text wraps MaybeRTF in another rtf-theme element. Forward field
// overrides to the renderer and inner wrapper, keeping heading and link roles.
export const applyRichTextOverrides = (
  content: React.ReactNode,
  styles?: MaybeRTFProps["richTextStyleOverrides"],
): React.ReactNode => {
  if (Array.isArray(content)) {
    return content.map((child) => applyRichTextOverrides(child, styles));
  }
  if (!React.isValidElement(content)) {
    return content;
  }
  const element = content as React.ReactElement<
    MaybeRTFProps & { children?: React.ReactNode }
  >;
  if (typeof element.type === "string" && /^(h[1-6]|a)$/.test(element.type)) {
    return element;
  }
  if (element.type === React.Fragment) {
    return React.cloneElement(
      element,
      {},
      applyRichTextOverrides(element.props.children, styles),
    );
  }
  return React.cloneElement(element, {
    ...(element.type === MaybeRTF
      ? {
          richTextStyleOverrides: {
            ...element.props.richTextStyleOverrides,
            ...styles,
            ...resolveTextStyles(styles),
          },
        }
      : {}),
    style: { ...element.props.style, ...richTextStyle(styles) },
    ...(element.props.children !== undefined
      ? { children: applyRichTextOverrides(element.props.children, styles) }
      : {}),
  });
};

export const renderRichText = (
  value: unknown,
  richTextStyleOverrides?: MaybeRTFProps["richTextStyleOverrides"],
): React.ReactNode => {
  if (React.isValidElement(value)) {
    return applyRichTextOverrides(value, richTextStyleOverrides);
  }

  const data =
    typeof value === "string" ||
    (typeof value === "object" && value !== null && "html" in value)
      ? (value as RichText | string)
      : undefined;

  return (
    <MaybeRTF
      data={data}
      richTextStyleOverrides={{
        ...richTextStyleOverrides,
        ...resolveTextStyles(richTextStyleOverrides),
      }}
      style={richTextStyle(richTextStyleOverrides)}
    />
  );
};
