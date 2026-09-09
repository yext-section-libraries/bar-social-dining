import type { SectionConfig } from "@yext/visual-editor";

import type { PuckComponent } from "@puckeditor/core";
import * as React from "react";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  Background,
  ComprehensiveCTA,
  EntityField,
  createItemSource,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  resolveComponentData,
  toPuckFields,
  useDocument,
  type ComprehensiveCTAValue,
  type EnhancedTranslatableCTA,
  type StyledImageValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  VisibilityWrapper,
} from "@yext/visual-editor";
import { createCta } from "../shared/createCta";
import { aspectRatioOptions } from "../shared/fieldOptions";
import {
  getReadableForegroundColor,
  getScopedTypographyCss,
  getTextStyle as textStyle,
  hasExplicitThemeColor,
  renderRichText,
} from "../shared/sectionStyles";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type MenuItemProps = {
  title: YextEntityField<TranslatableString>;
  category: YextEntityField<TranslatableString>;
  description: YextEntityField<TranslatableRichText>;
  image: YextEntityField<TranslatableAssetImage>;
  cta: YextEntityField<EnhancedTranslatableCTA>;
};

type CardStyles = {
  title: Omit<StyledTextProps, "text">;
  category: Omit<StyledTextProps, "text">;
  description: Omit<StyledTextProps, "text">;
  image: {
    aspectRatio: number;
    imageConstrain: "fixed" | "filled";
    styles?: StyledImageValue;
  };
};

const createMenuCardCta = (label: string): ComprehensiveCTAValue =>
  createCta({ label, variant: "secondary" });

const menuItemsSource = createItemSource<MenuItemProps>({
  label: "Menu Items",
  mappingFields: {
    title: {
      label: "Title",
      type: "entityField",
      filter: {
        types: ["type.string"],
      },
    },
    category: {
      label: "Category",
      type: "entityField",
      filter: {
        types: ["type.string"],
      },
    },
    description: {
      label: "Description",
      type: "entityField",
      filter: {
        types: ["type.rich_text_v2"],
      },
    },
    image: {
      type: "entityField",
      label: "Image",
      filter: {
        types: ["type.image"],
      },
    },
    cta: {
      label: "Call to Action",
      type: "ctaSelector",
    },
  },
  defaultValues: [
    {
      title: {
        field: "",
        constantValue: {
          defaultValue: "Redwood Smokehouse Burger",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      category: {
        field: "",
        constantValue: { defaultValue: "Burgers", hasLocalizedValue: "true" },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "A wood-fired double smash burger topped with smoked cheddar, crispy onions, bourbon bacon jam, arugula, and house redwood sauce on a toasted brioche bun. Served with hand-cut fries.",
          ),
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
          width: 1267,
          height: 1900,
        },
        constantValueEnabled: true,
      },
      cta: createMenuCardCta("Learn More").data.cta,
    },
    {
      title: {
        field: "",
        constantValue: {
          defaultValue: "Chicken Sandwich",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      category: {
        field: "",
        constantValue: {
          defaultValue: "Sandwiches",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Crispy buttermilk fried chicken layered with hot honey glaze, dill pickles, shredded lettuce, and chipotle aioli on a buttered potato bun. A local favorite during happy hour and weekend brunch.",
          ),
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
          width: 1267,
          height: 1900,
        },
        constantValueEnabled: true,
      },
      cta: createMenuCardCta("Learn More").data.cta,
    },
    {
      title: {
        field: "",
        constantValue: {
          defaultValue: "Hill Country Steak Salad",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      category: {
        field: "",
        constantValue: { defaultValue: "Salads", hasLocalizedValue: "true" },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Grilled skirt steak served over mixed greens with roasted corn, avocado, pickled red onions, cotija cheese, tortilla strips, and cilantro-lime vinaigrette. Fresh, hearty, and distinctly Texas-inspired.",
          ),
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
          width: 1267,
          height: 1900,
        },
        constantValueEnabled: true,
      },
      cta: createMenuCardCta("Learn More").data.cta,
    },
  ],
});

type BarSocialDiningMenuSectionProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
  };
  heading: StyledTextProps;
  items: typeof menuItemsSource.value;
  cardStyles: CardStyles;
  cardBackgroundColor: ThemeColor;
  mediaFrameBackgroundColor: ThemeColor;
  cardCta: ComprehensiveCTAValue;
};

const menuScopeClass = "bar-social-dining-menu";
const menuScopedTypographyCss = getScopedTypographyCss(menuScopeClass);

const BarSocialDiningMenuSectionFields =
  toPuckFields<BarSocialDiningMenuSectionProps>({
    section: {
      label: "Section",
      type: "object",
      objectFields: {
        visibleOnLivePage: {
          label: "Visible on Live Page",
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
        backgroundColor: {
          label: "Background Color",
          type: "basicSelector",
          options: "BACKGROUND_COLOR",
        },
      },
    },
    heading: {
      label: "Heading",
      type: "object",
      objectFields: {
        text: {
          type: "entityField",
          label: "Text",
          filter: {
            types: ["type.string"],
          },
        },
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

    items: menuItemsSource.field,
    cardBackgroundColor: {
      label: "Card Background Color",
      type: "basicSelector",
      options: "BACKGROUND_COLOR",
    },
    mediaFrameBackgroundColor: {
      label: "Media Frame Background Color",
      type: "basicSelector",
      options: "BACKGROUND_COLOR",
    },
    cardStyles: {
      label: "Card Styles",
      type: "object",
      objectFields: {
        title: {
          label: "Title",
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
        category: {
          label: "Category",
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
        description: {
          label: "Description",
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
        image: {
          label: "Image",
          type: "object",
          objectFields: {
            aspectRatio: {
              label: "Aspect Ratio",
              type: "basicSelector",
              options: aspectRatioOptions,
            },
            imageConstrain: {
              label: "Image Constrain",
              type: "select",
              options: [
                { label: "Fixed", value: "fixed" },
                { label: "Filled", value: "filled" },
              ],
            },
            styles: {
              label: "Image Styles",
              type: "styledImage",
            },
          },
        },
      },
    },
    cardCta: {
      label: "Card CTA",
      type: "comprehensiveCTA",
    },
  });

const BarSocialDiningMenuSectionComponent: PuckComponent<
  BarSocialDiningMenuSectionProps
> = ({ id, ...props }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading = resolveComponentData(
    props.heading.text,
    locale,
    streamDocument,
    { output: "plainText" },
  );
  const items = menuItemsSource.resolveItems(props.items, streamDocument);
  const descriptionStyleOverrides = {
    ...props.cardStyles.description.styles,
    color: hasExplicitThemeColor(props.cardStyles.description.fontColor)
      ? props.cardStyles.description.fontColor
      : getReadableForegroundColor(props.cardBackgroundColor),
  };

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BarSocialDiningMenuSection${getAnalyticsScopeHash(id)}`}
      >
        <style>{menuScopedTypographyCss}</style>
      <Background
        as="section"
        background={props.section.backgroundColor}
          className={menuScopeClass}
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
                    ...textStyle(
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
            <EntityField
              displayName="Menu Items"
              fieldId={props.items.field}
              constantValueEnabled={props.items.constantValueEnabled}
            >
              <div
                style={{
                  display: "grid",
                  gap: "20px",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  overflowX: "auto",
                }}
              >
                {items.map((item, index) => {
                  const resolvedTitle = resolveComponentData(
                    item.title,
                    locale,
                    streamDocument,
                    { output: "plainText" },
                  );
                  const resolvedCategory = resolveComponentData(
                    item.category,
                    locale,
                    streamDocument,
                    { output: "plainText" },
                  );
                  const resolvedDescription = item.description
                    ? resolveComponentData(
                        item.description,
                        locale,
                        streamDocument,
                      )
                    : undefined;
                  const resolvedDescriptionText = item.description
                    ? resolveComponentData(
                        item.description,
                        locale,
                        streamDocument,
                        { output: "plainText" },
                      )
                    : "";
                  const resolvedImage: unknown = item.image
                    ? resolveComponentData(item.image, locale, streamDocument)
                    : undefined;
                  const resolvedImageUrl =
                    typeof resolvedImage === "object" &&
                    resolvedImage !== null &&
                    "url" in resolvedImage &&
                    typeof resolvedImage.url === "string"
                      ? resolvedImage.url.trim()
                      : typeof resolvedImage === "object" &&
                          resolvedImage !== null &&
                          "image" in resolvedImage &&
                          resolvedImage.image &&
                          typeof resolvedImage.image === "object" &&
                          "url" in resolvedImage.image &&
                          typeof resolvedImage.image.url === "string"
                        ? resolvedImage.image.url.trim()
                        : "";
                  const resolvedAspectRatio =
                    typeof props.cardStyles.image.aspectRatio === "number" &&
                    props.cardStyles.image.aspectRatio > 0
                      ? props.cardStyles.image.aspectRatio
                      : 0.8;
                  const hasCardImage = Boolean(resolvedImageUrl);
                  const titleText =
                    typeof resolvedTitle === "string" ? resolvedTitle.trim() : "";
                  const categoryText =
                    typeof resolvedCategory === "string"
                      ? resolvedCategory.trim()
                      : "";
                  const descriptionText =
                    typeof resolvedDescriptionText === "string"
                      ? resolvedDescriptionText.trim()
                      : "";
                  const ctaLabel =
                    item.cta && typeof item.cta === "object" && "label" in item.cta
                      ? typeof item.cta.label === "string"
                        ? item.cta.label.trim()
                        : item.cta.label &&
                            typeof item.cta.label === "object" &&
                            "defaultValue" in item.cta.label &&
                            typeof item.cta.label.defaultValue === "string"
                          ? item.cta.label.defaultValue.trim()
                          : ""
                      : "";
                  const ctaValue =
                    ctaLabel && item.cta
                      ? {
                          data: {
                            ...props.cardCta.data,
                            cta: {
                              field: "",
                              constantValue: item.cta,
                              constantValueEnabled: true,
                              selectedType: item.cta.ctaType,
                            },
                          },
                          styles: props.cardCta.styles,
                        }
                      : undefined;
                  const hasCardBody = Boolean(
                    titleText || categoryText || descriptionText || ctaValue,
                  );
                  return (
                    <article
                      key={`${titleText || "item"}-${index}`}
                      style={{
                        ...getSurfaceColorStyle(
                          props.cardBackgroundColor,
                          streamDocument,
                        ),
                        border: "1px solid rgba(23, 18, 25, 0.85)",
                        display: "flex",
                        flexDirection: "column",
                        minWidth: "240px",
                      }}
                    >
                      <div
                        style={{
                          alignItems: "center",
                          backgroundColor: hasCardImage
                            ? getThemeColorCssValue(
                                props.mediaFrameBackgroundColor.selectedColor,
                              )
                            : undefined,
                          display: "flex",
                          aspectRatio: resolvedAspectRatio,
                          justifyContent: "center",
                          overflow: "hidden",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            height: "74%",
                            borderRadius:
                              props.cardStyles.image.styles?.borderRadius ===
                              "default"
                                ? undefined
                                : props.cardStyles.image.styles?.borderRadius,
                            overflow:
                              hasCardImage &&
                              (props.cardStyles.image.imageConstrain ===
                                "filled" ||
                                (props.cardStyles.image.styles?.borderRadius &&
                                  props.cardStyles.image.styles.borderRadius !==
                                    "default"))
                                ? "hidden"
                                : undefined,
                            width: "74%",
                          }}
                        >
                          {hasCardImage ? (
                            props.cardStyles.image.imageConstrain ===
                            "filled" ? (
                              <img
                                alt={
                                  typeof resolvedTitle === "string"
                                    ? resolvedTitle
                                    : ""
                                }
                                src={resolvedImageUrl}
                                style={{
                                  display: "block",
                                  height: "100%",
                                  objectFit: "cover",
                                  objectPosition: "center",
                                  width: "100%",
                                }}
                              />
                            ) : (
                              <img
                                alt={
                                  typeof resolvedTitle === "string"
                                    ? resolvedTitle
                                    : ""
                                }
                                src={resolvedImageUrl}
                                style={{
                                  display: "block",
                                  height: "100%",
                                  objectFit: "contain",
                                  objectPosition: "center",
                                  width: "100%",
                                }}
                              />
                            )
                          ) : null}
                        </div>
                      </div>
                      {hasCardBody ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            flexGrow: 1,
                            padding: "18px 18px 20px",
                            textAlign: "center",
                          }}
                        >
                          {titleText ? (
                            <h3
                              style={{
                                ...textStyle(
                                  props.cardStyles.title.styles,
                                  props.cardStyles.title.fontColor,
                                  props.cardBackgroundColor,
                                ),
                                margin: 0,
                              }}
                            >
                              {titleText}
                            </h3>
                          ) : null}
                          {categoryText ? (
                            <p
                              style={{
                                ...textStyle(
                                  props.cardStyles.category.styles,
                                  props.cardStyles.category.fontColor,
                                  props.cardBackgroundColor,
                                ),
                                margin: titleText ? "2px 0 0" : 0,
                              }}
                            >
                              {categoryText}
                            </p>
                          ) : null}
                          {descriptionText ? (
                            <div
                              className="bar-social-dining-link-typography"
                              style={{
                                flexGrow: 1,
                                margin:
                                  titleText || categoryText
                                    ? "16px 0 12px"
                                    : "0 0 12px",
                              }}
                            >
                              {renderRichText(
                                resolvedDescription,
                                descriptionStyleOverrides,
                              )}
                            </div>
                          ) : null}
                          {ctaValue ? (
                            <div
                              style={{ display: "flex", justifyContent: "center" }}
                            >
                              <ComprehensiveCTA
                                value={ctaValue}
                                eventName={`cardCta-${index}`}
                                style={{ margin: "0 auto" }}
                              />
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </EntityField>
          </div>
      </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const BarSocialDiningMenuSection: YextComponentConfig<BarSocialDiningMenuSectionProps> =
  {
    label: "Menu Section",
    fields: BarSocialDiningMenuSectionFields,
    defaultProps: {
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "black",
        },
      },
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Featured Menu Items at [[name]]",
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
      cardStyles: {
        title: {
          styles: {
            fontFamily: "default",
            fontSize: "default",
            fontWeight: "default",
            fontStyle: "default",
            textTransform: "default",
          },
          fontColor: undefined,
        },
        category: {
          styles: {
            fontFamily: "default",
            fontSize: "default",
            fontWeight: "default",
            fontStyle: "default",
            textTransform: "default",
          },
          fontColor: undefined,
        },
        description: {
          styles: {
            fontFamily: "default",
            fontSize: "default",
            fontWeight: "default",
            fontStyle: "default",
            textTransform: "default",
          },
          fontColor: undefined,
        },
        image: {
          aspectRatio: 0.8,
          imageConstrain: "filled",
          styles: {
            borderRadius: "default",
          },
        },
      },
      cardBackgroundColor: {
        selectedColor: "white",
        contrastingColor: "black",
      },
      mediaFrameBackgroundColor: {
        selectedColor: "[#d9c4a0]",
        contrastingColor: "[#171219]",
      },
      items: menuItemsSource.defaultValue,
      cardCta: createMenuCardCta("Learn More"),
    },
    render: (props) => <BarSocialDiningMenuSectionComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "BarSocialDiningMenuSection",
  displayName: "Menu Section",
  description: "Menu Section",
  pageSetTypes: ["ENTITY"],
};
