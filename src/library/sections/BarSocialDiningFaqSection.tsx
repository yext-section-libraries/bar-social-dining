import type { SectionConfig } from "@yext/visual-editor";

import { useState } from "react";
import type { PuckComponent } from "@puckeditor/core";
import * as React from "react";
import { AnalyticsScopeProvider, useAnalytics } from "@yext/pages-components";
import {
  msg,
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
  resolveTextColor,
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

type FaqItemMapping = {
  question: YextEntityField<TranslatableString>;
  answer: YextEntityField<TranslatableRichText>;
  image: YextEntityField<TranslatableAssetImage>;
};

type FaqItemStyles = {
  question: Omit<StyledTextProps, "text">;
  answer: Omit<StyledRtfProps, "text">;
  image: {
    aspectRatio: number;
    imageConstrain: "fixed" | "filled";
    styles?: StyledImageValue;
  };
};

const faqItemsSource = createItemSource<FaqItemMapping>({
  label: "FAQs",
  mappingFields: {
    question: {
      type: "entityField",
      label: "Question",
      filter: { types: ["type.string"] },
    },
    answer: {
      type: "entityField",
      label: "Answer",
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
      question: {
        field: "",
        constantValue: {
          defaultValue:
            "Are your dining hours the same as your take-out hours?",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Not always. Our takeout and delivery service may remain available slightly later than dine-in seating, especially on weekends. For the most accurate hours, we recommend checking our online ordering page or giving our [[address.city]] location a quick call before placing your order.",
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
      question: {
        field: "",
        constantValue: {
          defaultValue: "Can I order online?",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Yes. You can place pickup or delivery orders online for lunch, dinner, and brunch service. Online ordering is the fastest way to browse current menu availability, add notes, and choose your preferred pickup time.",
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
      question: {
        field: "",
        constantValue: {
          defaultValue: "Does this location take reservations?",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Reservations are available through OpenTable for most lunch, dinner, and brunch seatings. Walk-ins are always welcome, but booking ahead is the best option for weekends, larger parties, and group celebrations.",
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
    {
      question: {
        field: "",
        constantValue: {
          defaultValue: "Do you have a kids menu?",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "We do. Our kids options are built around smaller portions of guest favorites like cheeseburgers, fries, grilled chicken, and simple sides, making it easy for families to enjoy brunch or dinner together.",
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
      question: {
        field: "",
        constantValue: {
          defaultValue: "Do you serve brunch?",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Yes. [[address.city]] serves weekend brunch with savory burger plates, chicken sandwiches, brunch cocktails, coffee, and lighter options. It’s one of our busiest services, so arriving early or reserving ahead is recommended.",
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
      question: {
        field: "",
        constantValue: {
          defaultValue: "Do you have outdoor seating?",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Yes. Patio seating is available for guests who want an open-air [[geomodifier]] [[address.city]] dining experience. Patio availability can vary with weather and private events, so calling ahead is helpful if outdoor seating is your preference.",
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
    {
      question: {
        field: "",
        constantValue: {
          defaultValue: "Do you offer vegetarian or gluten-free options?",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "We do. The menu includes salads, sides, and customizable mains that work well for vegetarian or gluten-conscious guests. Because kitchens handle multiple ingredients, we recommend speaking with the team when ordering for the best guidance.",
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
      question: {
        field: "",
        constantValue: {
          defaultValue: "Is there parking available?",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Yes. Guests typically use nearby street parking and shared area lots around [[address.city]]. Parking can fill up during peak brunch and evening hours, so allowing a few extra minutes is a good idea.",
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
  ],
});

type BarSocialDiningFaqSectionProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
  };
  heading: StyledTextProps;
  questionBackgroundColor: ThemeColor;
  answerBackgroundColor: ThemeColor;
  items: typeof faqItemsSource.value;
  itemStyles: FaqItemStyles;
};

const faqScopeClass = "bar-social-dining-faq";
const faqScopedTypographyCss = getScopedTypographyCss(faqScopeClass);

const BarSocialDiningFaqSectionFields: YextFields<BarSocialDiningFaqSectionProps> =
  {
    section: {
      label: msg("fields.section", "Section"),
      type: "object",
      objectFields: {
        visibleOnLivePage: {
          label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
          type: "radio",
          options: [
            { label: msg("fields.options.yes", "Yes"), value: true },
            { label: msg("fields.options.no", "No"), value: false },
          ],
        },
        backgroundColor: {
          label: msg("fields.backgroundColor", "Background Color"),
          type: "basicSelector",
          options: "BACKGROUND_COLOR",
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
    questionBackgroundColor: {
      label: msg("fields.questionBackgroundColor", "Question Background Color"),
      type: "basicSelector",
      options: "BACKGROUND_COLOR",
    },
    answerBackgroundColor: {
      label: msg("fields.answerBackgroundColor", "Answer Background Color"),
      type: "basicSelector",
      options: "BACKGROUND_COLOR",
    },
    items: faqItemsSource.field,
    itemStyles: {
      label: msg("fields.faqStyles", "FAQ Styles"),
      type: "object",
      objectFields: {
        question: {
          label: msg("fields.question", "Question"),
          type: "object",
          objectFields: {
            styles: { label: msg("fields.textStyles", "Text Styles"), type: "styledText" },
            fontColor: {
              label: msg("fields.fontColor", "Font Color"),
              type: "basicSelector",
              options: "SITE_COLOR",
            },
          },
        },
        answer: {
          label: msg("fields.answer", "Answer"),
          type: "object",
          objectFields: {
            styles: { label: msg("fields.textStyles", "Text Styles"), type: "styledText" },
            fontColor: {
              label: msg("fields.fontColor", "Font Color"),
              type: "basicSelector",
              options: "SITE_COLOR",
            },
          },
        },
        image: {
          label: msg("fields.image", "Image"),
          type: "object",
          objectFields: {
            aspectRatio: {
              label: msg("fields.aspectRatio", "Aspect Ratio"),
              type: "basicSelector",
              options: aspectRatioOptions,
            },
            imageConstrain: {
              label: msg("fields.imageConstrain", "Image Constrain"),
              type: "select",
              options: [
                { label: msg("fields.options.fixed", "Fixed"), value: "fixed" },
                { label: msg("fields.options.filled", "Filled"), value: "filled" },
              ],
            },
            styles: { label: msg("fields.imageStyles", "Image Styles"), type: "styledImage" },
          },
        },
      },
    },
  };

const BarSocialDiningFaqSectionComponent: PuckComponent<
  BarSocialDiningFaqSectionProps
> = ({ id, ...props }) => {
  const analytics = useAnalytics();
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const questionForeground = resolveTextColor(
    undefined,
    props.questionBackgroundColor,
  );
  const answerForeground = resolveTextColor(
    undefined,
    props.answerBackgroundColor,
  );
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const resolvedHeading = resolveComponentData(
    props.heading.text,
    locale,
    streamDocument,
    { output: "plainText" },
  );
  const resolvedItems = faqItemsSource.resolveItems(
    props.items,
    streamDocument,
  );
  const answerRichTextStyleOverrides = {
    ...props.itemStyles.answer.styles,
    color: hasExplicitThemeColor(props.itemStyles.answer.fontColor)
      ? props.itemStyles.answer.fontColor
      : getReadableForegroundColor(props.answerBackgroundColor),
  };

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BarSocialDiningFaqSection${getAnalyticsScopeHash(id)}`}
      >
        <style>{`
            ${faqScopedTypographyCss}

            .bar-social-dining-faq-grid {
              display: grid;
              gap: 16px;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              max-width: 100%;
            }

            @media (max-width: 1024px) {
              .bar-social-dining-faq-grid {
                grid-template-columns: 1fr;
              }

              .bar-social-dining-faq-card {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
      <Background
        as="section"
        background={props.section.backgroundColor}
          className={faqScopeClass}
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
              displayName="FAQs"
              fieldId={props.items.field}
              constantValueEnabled={props.items.constantValueEnabled}
            >
              <div className="bar-social-dining-faq-grid">
                {resolvedItems.map((item, index) => {
                  const isOpen = openIndex === index;
                  const resolvedQuestion = resolveComponentData(
                    item.question,
                    locale,
                    streamDocument,
                    { output: "plainText" },
                  );
                  const resolvedAnswer = item.answer
                    ? resolveComponentData(
                        item.answer,
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
                  const hasAnswerImage = Boolean(resolvedImageUrl);
                  const answerImage = hasAnswerImage
                    ? (resolvedImage as TranslatableAssetImage)
                    : undefined;
                  const hasAnswerPanel = isOpen || hasAnswerImage;
                  const itemId = `${id ?? "faq"}-${index}`.replace(
                    /[^a-zA-Z0-9_-]/g,
                    "-",
                  );
                  const questionId = `${itemId}-question`;
                  const answerId = `${itemId}-answer`;

                  return (
                    <div
                      className="bar-social-dining-faq-card"
                      key={itemId}
                      style={{
                        border: "1px solid rgba(23, 18, 25, 0.08)",
                        display: "grid",
                        gridTemplateColumns: hasAnswerPanel ? "1fr 1fr" : "1fr",
                        overflow: "hidden",
                      }}
                    >
                      <button
                        aria-controls={answerId}
                        aria-expanded={isOpen}
                        id={questionId}
                        onClick={() => {
                          const nextIndex = isOpen ? null : index;
                          setOpenIndex(nextIndex);
                          analytics?.track({
                            action: nextIndex === null ? "COLLAPSE" : "EXPAND",
                            eventName: `toggle${index}`,
                          });
                        }}
                        style={{
                          ...getSurfaceColorStyle(
                            props.questionBackgroundColor,
                            streamDocument,
                          ),
                          border: 0,
                          color: questionForeground,
                          cursor: "pointer",
                          minHeight: "180px",
                          padding: "24px",
                          textAlign: "left",
                        }}
                        type="button"
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "18px",
                            height: "100%",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            aria-level={3}
                            role="heading"
                            style={{
                              ...textStyle(
                                props.itemStyles.question.styles,
                                props.itemStyles.question.fontColor,
                                props.questionBackgroundColor,
                              ),
                              margin: 0,
                            }}
                          >
                            {resolvedQuestion}
                          </div>
                          <span style={{ fontSize: "1.5rem" }}>
                            {isOpen ? "«" : "»"}
                          </span>
                        </div>
                      </button>
                      {hasAnswerPanel ? (
                        <div
                          aria-labelledby={questionId}
                          id={answerId}
                          role="region"
                          style={{
                            alignItems: "center",
                            ...getSurfaceColorStyle(
                              props.answerBackgroundColor,
                              streamDocument,
                            ),
                            color: answerForeground,
                            display: "flex",
                            justifyContent: "center",
                            minHeight: "180px",
                            padding: "24px",
                          }}
                        >
                          {isOpen ? (
                            <div
                              className="bar-social-dining-link-typography"
                              style={{
                                ...textStyle(
                                  props.itemStyles.answer.styles,
                                  props.itemStyles.answer.fontColor,
                                  props.answerBackgroundColor,
                                ),
                                margin: 0,
                              }}
                            >
                              {renderRichText(
                                resolvedAnswer,
                                answerRichTextStyleOverrides,
                              )}
                            </div>
                          ) : answerImage ? (
                            <div
                              style={{
                                aspectRatio:
                                  props.itemStyles.image.aspectRatio > 0
                                    ? props.itemStyles.image.aspectRatio
                                    : undefined,
                                maxWidth: "120px",
                                overflow:
                                  props.itemStyles.image.imageConstrain ===
                                  "filled"
                                    ? "hidden"
                                    : undefined,
                                width: "100%",
                              }}
                            >
                              <Image
                                image={answerImage}
                                style={{
                                  height:
                                    props.itemStyles.image.aspectRatio > 0
                                      ? "100%"
                                      : "auto",
                                  objectFit:
                                    props.itemStyles.image.imageConstrain ===
                                    "filled"
                                      ? "cover"
                                      : "contain",
                                  width: "100%",
                                }}
                              />
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
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

export const BarSocialDiningFaqSection: YextComponentConfig<BarSocialDiningFaqSectionProps> =
  {
    label: "FAQ Section",
    fields: toPuckFields<BarSocialDiningFaqSectionProps>(
      BarSocialDiningFaqSectionFields,
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
            defaultValue: "FAQs",
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
      questionBackgroundColor: {
        selectedColor: "palette-secondary",
        contrastingColor: "palette-secondary-contrast",
      },
      answerBackgroundColor: {
        selectedColor: "[#f6eee7]",
        contrastingColor: "[#171219]",
      },
      items: faqItemsSource.defaultValue,
      itemStyles: {
        question: {
          styles: {
            fontFamily: "default",
            fontSize: "default",
            fontWeight: "default",
            fontStyle: "default",
            textTransform: "default",
          },
          fontColor: undefined,
        },
        answer: {
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
    render: (props) => <BarSocialDiningFaqSectionComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "BarSocialDiningFaqSection",
  displayName: "FAQ Section",
  description: "FAQ Section",
  pageSetTypes: ["ENTITY"],
};
