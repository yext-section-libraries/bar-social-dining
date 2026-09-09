import type { SectionConfig } from "@yext/visual-editor";

import type { PuckComponent } from "@puckeditor/core";
import * as React from "react";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  Background,
  ComprehensiveCTA,
  EntityField,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  type ComprehensiveCTAValue,
  type ThemeColor,
  type RichText,
  type StyledTextValue,
  type StyledImageValue,
  type ThemeColor as ThemeColorType,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
  getAnalyticsScopeHash,
  resolveComponentData,
  toPuckFields,
  useDocument,
} from "@yext/visual-editor";
import { aspectRatioOptions } from "../shared/fieldOptions";
import {
  getScopedTypographyCss,
  getTextStyle as textStyle,
  renderRichText,
  resolveTextColor,
} from "../shared/sectionStyles";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColorType;
};

type StyledRtfProps = {
  text: YextEntityField<TranslatableRichText>;
  styles: StyledTextValue;
  fontColor?: ThemeColorType;
};

type EventImageProps = {
  image: YextEntityField<TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type BarSocialDiningEventSectionProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  overlayColor: ThemeColor;
  heading: StyledTextProps;
  body: StyledRtfProps;
  bannerImage: EventImageProps;
  cta: ComprehensiveCTAValue;
};

const eventScopeClass = "bar-social-dining-event";
const eventScopedTypographyCss = getScopedTypographyCss(eventScopeClass);

const BarSocialDiningEventSectionFields: YextFields<BarSocialDiningEventSectionProps> =
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
    overlayColor: {
      label: "Overlay Color",
      type: "basicSelector",
      options: "BACKGROUND_COLOR",
    },
    heading: {
      label: "Heading",
      type: "object",
      objectFields: {
        text: {
          type: "entityField",
          label: "Text",
          filter: { types: ["type.string"] },
        },
        styles: { label: "Text Styles", type: "styledText" },
        fontColor: {
          label: "Font Color",
          type: "basicSelector",
          options: "SITE_COLOR",
        },
      },
    },
    body: {
      label: "Body",
      type: "object",
      objectFields: {
        text: {
          type: "entityField",
          label: "Text",
          filter: { types: ["type.rich_text_v2"] },
        },
        styles: { label: "Text Styles", type: "styledText" },
        fontColor: {
          label: "Font Color",
          type: "basicSelector",
          options: "SITE_COLOR",
        },
      },
    },
    bannerImage: {
      label: "Banner Image",
      type: "object",
      objectFields: {
        image: {
          type: "entityField",
          label: "Image",
          filter: { types: ["type.image"] },
        },
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
    cta: {
      label: "Call to Action",
      type: "comprehensiveCTA",
    },
  };

const BarSocialDiningEventSectionComponent: PuckComponent<
  BarSocialDiningEventSectionProps
> = ({ id, ...props }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading = resolveComponentData(
    props.heading.text,
    locale,
    streamDocument,
  );
  const resolvedBody = resolveComponentData(
    props.body.text,
    locale,
    streamDocument,
  );
  const resolvedImage = resolveComponentData(
    props.bannerImage.image,
    locale,
    streamDocument,
  );
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
  const overlayColor = getThemeColorCssValue(props.overlayColor.selectedColor);
  const overlayForeground = resolveTextColor(undefined, props.overlayColor);
  const hasBannerImage = Boolean(resolvedImageUrl);
  const bannerAspectRatio =
    props.bannerImage.aspectRatio > 0 ? props.bannerImage.aspectRatio : 4;

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BarSocialDiningEventSection${getAnalyticsScopeHash(id)}`}
      >
        <style>{`
          ${eventScopedTypographyCss}

          .bar-social-dining-event-layout {
            display: grid;
            min-width: 0;
            overflow: hidden;
            width: 100%;
          }

          .bar-social-dining-event-media,
          .bar-social-dining-event-overlay,
          .bar-social-dining-event-content {
            grid-area: 1 / 1;
            min-width: 0;
          }

          .bar-social-dining-event-content {
            align-items: center;
            box-sizing: border-box;
            display: grid;
            justify-items: center;
            padding: clamp(24px, 4vw, 36px) 32px;
            position: relative;
            width: 100%;
            z-index: 1;
          }

          .bar-social-dining-event-copy {
            max-width: 540px;
            min-width: 0;
            width: 100%;
          }

          .bar-social-dining-event-copy h2,
          .bar-social-dining-event-copy .bar-social-dining-link-typography {
            max-width: 100%;
            overflow-wrap: anywhere;
            word-break: break-word;
          }
        `}</style>
      <Background
        as="section"
        background={props.section.backgroundColor}
          className={eventScopeClass}
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
              minWidth: 0,
              width: "100%",
            }}
          >
            <div
              className="bar-social-dining-event-layout"
              style={{
                backgroundColor:
                  overlayColor ??
                  "rgba(23, 18, 25, 0.18)",
                backgroundImage: hasBannerImage
                  ? `url("${resolvedImageUrl}")`
                  : undefined,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize:
                  props.bannerImage.imageConstrain === "filled"
                    ? "cover"
                    : "contain",
              }}
            >
              <div
                className="bar-social-dining-event-media"
                style={{
                  aspectRatio: bannerAspectRatio,
                  width: "100%",
                }}
              />
              <div
                className="bar-social-dining-event-overlay"
                style={{
                  background:
                    overlayColor ??
                    "linear-gradient(90deg, rgba(23, 18, 25, 0.18), rgba(23, 18, 25, 0.04))",
                  opacity: hasBannerImage ? 0.45 : 1,
                }}
              />
              <div
                className="bar-social-dining-event-content"
                style={{
                  color: overlayForeground,
                }}
              >
                <div className="bar-social-dining-event-copy">
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
                          props.overlayColor,
                        ),
                        marginBottom: "12px",
                      }}
                    >
                      {typeof resolvedHeading === "string" ? resolvedHeading : ""}
                    </h2>
                  </EntityField>
                  <EntityField
                    displayName="Body"
                    fieldId={props.body.text.field}
                    constantValueEnabled={props.body.text.constantValueEnabled}
                  >
                    <div
                      className="bar-social-dining-link-typography"
                      style={{
                        ...textStyle(
                          props.body.styles,
                          props.body.fontColor,
                          props.overlayColor,
                        ),
                        marginBottom: "16px",
                      }}
                    >
                      {renderRichText(resolvedBody)}
                    </div>
                  </EntityField>
                  <EntityField
                    displayName="Call to Action"
                    fieldId={props.cta.data.cta.field}
                    constantValueEnabled={
                      props.cta.data.cta.constantValueEnabled
                    }
                  >
                    <ComprehensiveCTA
                      value={props.cta as Partial<ComprehensiveCTAValue>}
                      className="bar-social-dining-event-cta"
                      eventName="primaryCta"
                    />
                  </EntityField>
                </div>
              </div>
            </div>
          </div>
      </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const BarSocialDiningEventSection: YextComponentConfig<BarSocialDiningEventSectionProps> =
  {
    label: "Event Section",
    fields: toPuckFields<BarSocialDiningEventSectionProps>(
      BarSocialDiningEventSectionFields,
    ),
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      overlayColor: {
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      },
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Host Your Next Group Event at [[name]]",
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
      body: {
        text: {
          field: "",
          constantValue: {
            defaultValue: {
              html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Planning a birthday dinner, team happy hour, or weekend gathering in [[geomodifier]] [[address.city]]? [[name]] offers group dining and private event options with elevated comfort food, craft cocktails, and a warm hospitality-first atmosphere.</span></p><ul><li><span>Private and semi-private dining</span></li><li><span>Curated burger and cocktail packages</span></li><li><span>Flexible group seating for up to 35 guests</span></li></ul>',
              json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Planning a birthday dinner, team happy hour, or weekend gathering in [[geomodifier]] [[address.city]]? [[name]] offers group dining and private event options with elevated comfort food, craft cocktails, and a warm hospitality-first atmosphere.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Private and semi-private dining","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","value":1,"version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Curated burger and cocktail packages","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","value":2,"version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Flexible group seating for up to 35 guests","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"listitem","value":3,"version":1}],"direction":"ltr","format":"","indent":0,"listType":"bullet","start":1,"tag":"ul","type":"list","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
            } as RichText,
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
      bannerImage: {
        image: {
          field: "",
          constantValue: {
            url: "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
            width: 1267,
            height: 1900,
          },
          constantValueEnabled: true,
        },
        aspectRatio: 4,
        imageConstrain: "filled",
        styles: {
          borderRadius: "default",
        },
      },
      cta: {
        data: {
          actionType: "link",
          cta: {
            field: "",
            constantValue: {
              ctaType: "textAndLink",
              label: {
                defaultValue: "Plan Your Event",
                hasLocalizedValue: "true",
              },
              link: {
                defaultValue: "#",
                hasLocalizedValue: "true",
              },
              linkType: "URL",
            },
            constantValueEnabled: true,
            selectedType: "textAndLink",
          },
          openInNewTab: false,
          buttonText: {
            defaultValue: "Plan Your Event",
            hasLocalizedValue: "true",
          },
          customId: "",
          customClass: "",
          dataAttributes: [],
          ariaLabel: {
            defaultValue: "Plan Your Event",
            hasLocalizedValue: "true",
          },
        },
        styles: {
          variant: "primary",
          color: {
            selectedColor: "palette-tertiary",
            contrastingColor: "palette-tertiary-contrast",
          },
          button: {
            fontFamily: "default",
            fontSize: "default",
            fontWeight: "default",
            fontStyle: "default",
            textTransform: "default",
            letterSpacing: "default",
            borderRadius: "default",
          },
          link: {
            fontFamily: "default",
            fontSize: "default",
            fontWeight: "default",
            fontStyle: "default",
            textTransform: "default",
            letterSpacing: "default",
            includeCaret: "default",
          },
        },
      } as ComprehensiveCTAValue,
    },
    render: (props) => <BarSocialDiningEventSectionComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "BarSocialDiningEventSection",
  displayName: "Event Section",
  description: "Event Section",
  pageSetTypes: ["ENTITY"],
};
