import type { SectionConfig } from "@yext/visual-editor";

import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  Background,
  EntityField,
  Image,
  createItemSource,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getSurfaceColorStyle,
  resolveComponentData,
  useDocument,
  type StyledImageValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
  toPuckFields,
} from "@yext/visual-editor";
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

type StyledRtfProps = {
  text: YextEntityField<TranslatableRichText>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type AboutItemMapping = {
  title: YextEntityField<TranslatableString>;
  description: YextEntityField<TranslatableRichText>;
  image: YextEntityField<TranslatableAssetImage>;
};

type AboutItemStyles = {
  title: Omit<StyledTextProps, "text">;
  description: Omit<StyledRtfProps, "text">;
  image: {
    aspectRatio: number;
    imageConstrain: "fixed" | "filled";
    styles?: StyledImageValue;
  };
};

const aboutItemsSource = createItemSource<AboutItemMapping>({
  label: "Items",
  mappingFields: {
    title: {
      type: "entityField",
      label: "Title",
      filter: { types: ["type.string"] },
    },
    description: {
      type: "entityField",
      label: "Description",
      filter: { types: ["type.rich_text_v2"] },
    },
    image: {
      type: "entityField",
      label: "Image",
      filter: { types: ["type.image"] },
    },
  },
  defaultValues: [
    {
      title: {
        field: "",
        constantValue: { defaultValue: "Local", hasLocalizedValue: "true" },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "At [[name]], we believe great burgers start with great ingredients and a sense of place. Nestled in the heart of [[address.city]], the restaurant brings together wood-fired flavor, chef-driven comfort food, and the laid-back [[address.city]] energy that makes [[address.region]] unforgettable.",
          ),
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/hlcJpcdE-_vHprzl5MOnrTwEFmdYZRE9WaT_drjPWis/1000x568.png",
          width: 1000,
          height: 568,
        },
        constantValueEnabled: true,
      },
    },
    {
      title: {
        field: "",
        constantValue: {
          defaultValue: "Dynamic",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Whether you’re grabbing brunch before Barton Springs, meeting friends for happy hour after work downtown, or ordering takeout for a night in [[geomodifier]] [[address.city]], [[name]] delivers a distinctly [[address.city]] experience rooted in quality, hospitality, and bold flavor.",
          ),
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/0V-U0Tk9g5iHSg5ONJZW00L2_BGDVymefN7fqI051qE/1000x568.png",
          width: 1000,
          height: 568,
        },
        constantValueEnabled: true,
      },
    },
    {
      title: {
        field: "",
        constantValue: {
          defaultValue: "Convenient",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Conveniently located at [[address.line1]] near [[geomodifier]] [[address.city]], [[name]] offers dine-in, curbside pickup, delivery, and private group accommodations for locals and visitors looking for one of the best upscale burger restaurants in [[address.city]], [[address.region]].",
          ),
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/IBzkFIQfMJfgyQi-wxH0LQqlhxZD687Qelcs5dAr1U4/1000x568.png",
          width: 1000,
          height: 568,
        },
        constantValueEnabled: true,
      },
    },
  ],
});

type BarSocialDiningAboutSectionProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
  };
  heading: StyledTextProps;
  items: typeof aboutItemsSource.value;
  itemStyles: AboutItemStyles;
};

const aboutScopeClass = "bar-social-dining-about";
const aboutScopedTypographyCss = getScopedTypographyCss(aboutScopeClass);

const BarSocialDiningAboutSectionFields: YextFields<BarSocialDiningAboutSectionProps> =
  {
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
    items: aboutItemsSource.field,
    itemStyles: {
      label: "Item Styles",
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
  };

const BarSocialDiningAboutSectionComponent: PuckComponent<
  BarSocialDiningAboutSectionProps
> = ({ id, ...props }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading = resolveComponentData(
    props.heading.text,
    locale,
    streamDocument,
    { output: "plainText" },
  );
  const resolvedItems = aboutItemsSource.resolveItems(
    props.items,
    streamDocument,
  );
  const descriptionRichTextStyleOverrides = {
    ...props.itemStyles.description.styles,
    color: hasExplicitThemeColor(props.itemStyles.description.fontColor)
      ? props.itemStyles.description.fontColor
      : getReadableForegroundColor(props.section.backgroundColor),
  };

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BarSocialDiningAboutSection${getAnalyticsScopeHash(id)}`}
      >
        <style>{`
          ${aboutScopedTypographyCss}

          @media (max-width: 1024px) {
            .bar-social-dining-about-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      <Background
        as="section"
        background={props.section.backgroundColor}
          className={aboutScopeClass}
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
              displayName="Items"
              fieldId={props.items.field}
              constantValueEnabled={props.items.constantValueEnabled}
            >
              <div
                className="bar-social-dining-about-grid"
                style={{
                  display: "grid",
                  gap: "32px",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                }}
              >
                {resolvedItems.map((item, index) => {
                  const resolvedTitle = resolveComponentData(
                    item.title,
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
                  const hasItemImage = Boolean(resolvedImageUrl);
                  const itemImage = hasItemImage
                    ? (resolvedImage as TranslatableAssetImage)
                    : undefined;

                  return (
                    <article
                      key={`${resolvedTitle || "item"}-${index}`}
                      style={{
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          margin: "0 auto 16px",
                          height: "214px",
                          maxWidth: "214px",
                          minHeight: "214px",
                          overflow:
                            hasItemImage &&
                            props.itemStyles.image.imageConstrain === "filled"
                              ? "hidden"
                              : undefined,
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {itemImage ? (
                          <Image
                            image={itemImage}
                            style={{
                              height: "100%",
                              objectFit:
                                props.itemStyles.image.imageConstrain ===
                                "filled"
                                  ? "cover"
                                  : "contain",
                              width: "100%",
                            }}
                          />
                        ) : null}
                      </div>
                      <h3
                        style={{
                          ...textStyle(
                            props.itemStyles.title.styles,
                            props.itemStyles.title.fontColor,
                            props.section.backgroundColor,
                          ),
                          margin: "0 0 8px",
                        }}
                      >
                        {typeof resolvedTitle === "string" ? resolvedTitle : ""}
                      </h3>
                      <div
                        className="bar-social-dining-link-typography"
                        style={{
                          ...textStyle(
                            props.itemStyles.description.styles,
                            props.itemStyles.description.fontColor,
                            props.section.backgroundColor,
                          ),
                          margin: 0,
                        }}
                      >
                        {renderRichText(
                          resolvedDescription,
                          descriptionRichTextStyleOverrides,
                        )}
                      </div>
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

export const BarSocialDiningAboutSection: YextComponentConfig<BarSocialDiningAboutSectionProps> =
  {
    label: "About Section",
    fields: toPuckFields<BarSocialDiningAboutSectionProps>(
      BarSocialDiningAboutSectionFields,
    ),
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
            defaultValue: "What is [[name]]?",
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
      items: aboutItemsSource.defaultValue,
      itemStyles: {
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
          aspectRatio: 1,
          imageConstrain: "fixed",
          styles: { borderRadius: "default" },
        },
      },
    },
    render: (props) => <BarSocialDiningAboutSectionComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "BarSocialDiningAboutSection",
  displayName: "About Section",
  description: "About Section",
  pageSetTypes: ["ENTITY"],
};
