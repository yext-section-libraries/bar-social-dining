import type { SectionConfig } from "@yext/visual-editor";

import type { PuckComponent } from "@puckeditor/core";
import * as React from "react";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  msg,
  Background,
  ComprehensiveCTA,
  EntityField,
  Image,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getSurfaceColorStyle,
  resolveComponentData,
  useDocument,
  type ComprehensiveCTAValue,
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
import { createCta } from "../shared/createCta";
import { aspectRatioOptions } from "../shared/fieldOptions";
import {
  getScopedTypographyCss,
  getTextStyle as textStyle,
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

type HeroImageProps = {
  image: YextEntityField<TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type BarSocialDiningHeroSectionProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  eyebrow: StyledTextProps;
  heading: StyledTextProps;
  body: StyledRtfProps;
  heroImage: HeroImageProps;
  primaryCta: ComprehensiveCTAValue;
  secondaryCta: ComprehensiveCTAValue;
  tertiaryCta: ComprehensiveCTAValue;
};

const heroScopeClass = "bar-social-dining-hero";
const heroScopedTypographyCss = getScopedTypographyCss(heroScopeClass);

const createHeroCta = (
  label: string,
  color: ThemeColor,
  variant: "primary" | "secondary",
): ComprehensiveCTAValue => createCta({ label, color, variant });

const BarSocialDiningHeroSectionFields: YextFields<BarSocialDiningHeroSectionProps> =
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
    eyebrow: {
      label: msg("fields.eyebrow", "Eyebrow"),
      type: "object",
      objectFields: {
        text: {
          type: "entityField",
          label: msg("fields.text", "Text"),
          filter: { types: ["type.string"] },
        },
        styles: { label: msg("fields.textStyles", "Text Styles"), type: "styledText" },
        fontColor: {
          label: msg("fields.fontColor", "Font Color"),
          type: "basicSelector",
          options: "SITE_COLOR",
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
          filter: { types: ["type.string"] },
        },
        styles: { label: msg("fields.textStyles", "Text Styles"), type: "styledText" },
        fontColor: {
          label: msg("fields.fontColor", "Font Color"),
          type: "basicSelector",
          options: "SITE_COLOR",
        },
      },
    },
    body: {
      label: msg("fields.body", "Body"),
      type: "object",
      objectFields: {
        text: {
          type: "entityField",
          label: msg("fields.text", "Text"),
          filter: { types: ["type.rich_text_v2"] },
        },
        styles: { label: msg("fields.textStyles", "Text Styles"), type: "styledText" },
        fontColor: {
          label: msg("fields.fontColor", "Font Color"),
          type: "basicSelector",
          options: "SITE_COLOR",
        },
      },
    },
    heroImage: {
      label: msg("fields.heroImage", "Hero Image"),
      type: "object",
      objectFields: {
        image: {
          type: "entityField",
          label: msg("fields.image", "Image"),
          filter: { types: ["type.image"] },
        },
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
        styles: {
          label: msg("fields.imageStyles", "Image Styles"),
          type: "styledImage",
        },
      },
    },
    primaryCta: {
      label: msg("fields.primaryCTA", "Primary CTA"),
      type: "comprehensiveCTA",
    },
    secondaryCta: {
      label: msg("fields.secondaryCTA", "Secondary CTA"),
      type: "comprehensiveCTA",
    },
    tertiaryCta: {
      label: msg("fields.tertiaryCta", "Tertiary CTA"),
      type: "comprehensiveCTA",
    },
  };

const BarSocialDiningHeroSectionComponent: PuckComponent<
  BarSocialDiningHeroSectionProps
> = ({ id, ...props }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedEyebrow = resolveComponentData(
    props.eyebrow.text,
    locale,
    streamDocument,
  );
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
    props.heroImage.image,
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
  const hasHeroImage = Boolean(resolvedImageUrl);
  const heroImage = hasHeroImage
    ? (resolvedImage as TranslatableAssetImage)
    : undefined;

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BarSocialDiningHeroSection${getAnalyticsScopeHash(id)}`}
      >
        <style>{`
            ${heroScopedTypographyCss}

            .bar-social-dining-hero-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              min-height: 560px;
              align-items: stretch;
            }

            @media (max-width: 768px) {
              .bar-social-dining-hero-grid {
                grid-template-columns: 1fr;
                min-height: auto;
              }
            }
          `}</style>
      <Background
        as="section"
        background={props.section.backgroundColor}
          className={heroScopeClass}
          style={{
            ...getSurfaceColorStyle(
              props.section.backgroundColor,
              streamDocument,
            ),
          }}
        >
          <div
            className="bar-social-dining-hero-grid"
            style={{
              gridTemplateColumns: hasHeroImage ? undefined : "minmax(0, 1fr)",
              minHeight: hasHeroImage ? undefined : "auto",
            }}
          >
            <div
              style={{
                alignItems: "center",
                ...getSurfaceColorStyle(
                  props.section.backgroundColor,
                  streamDocument,
                ),
                display: "flex",
                justifyContent: "center",
                padding: "48px 32px",
                textAlign: "center",
              }}
            >
              <div style={{ maxWidth: "520px" }}>
                <EntityField
                  displayName="Eyebrow"
                  fieldId={props.eyebrow.text.field}
                  constantValueEnabled={props.eyebrow.text.constantValueEnabled}
                >
                  <p
                    style={{
                      ...textStyle(
                        props.eyebrow.styles,
                        props.eyebrow.fontColor,
                        props.section.backgroundColor,
                      ),
                      borderBottom: "2px solid currentColor",
                      display: "inline-block",
                      letterSpacing: "0.08em",
                      margin: "0 0 34px",
                      paddingBottom: "4px",
                      textTransform: "uppercase",
                    }}
                  >
                    {typeof resolvedEyebrow === "string" ? resolvedEyebrow : ""}
                  </p>
                </EntityField>
                <EntityField
                  displayName="Heading"
                  fieldId={props.heading.text.field}
                  constantValueEnabled={props.heading.text.constantValueEnabled}
                >
                  <h1
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
                  </h1>
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
                        props.section.backgroundColor,
                      ),
                      marginTop: "26px",
                    }}
                  >
                    {renderRichText(resolvedBody)}
                  </div>
                </EntityField>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "16px",
                    justifyContent: "center",
                    marginLeft: "auto",
                    marginRight: "auto",
                    marginTop: "24px",
                    maxWidth: "560px",
                    width: "100%",
                  }}
                >
                  <EntityField
                    displayName="Primary CTA"
                    fieldId={props.primaryCta.data.cta.field}
                    constantValueEnabled={
                      props.primaryCta.data.cta.constantValueEnabled
                    }
                  >
                    <ComprehensiveCTA
                      value={props.primaryCta as Partial<ComprehensiveCTAValue>}
                      eventName="primaryCta"
                    />
                  </EntityField>
                  <EntityField
                    displayName="Secondary CTA"
                    fieldId={props.secondaryCta.data.cta.field}
                    constantValueEnabled={
                      props.secondaryCta.data.cta.constantValueEnabled
                    }
                  >
                    <ComprehensiveCTA
                      value={
                        props.secondaryCta as Partial<ComprehensiveCTAValue>
                      }
                      eventName="secondaryCta"
                    />
                  </EntityField>
                  <EntityField
                    displayName="Tertiary CTA"
                    fieldId={props.tertiaryCta.data.cta.field}
                    constantValueEnabled={
                      props.tertiaryCta.data.cta.constantValueEnabled
                    }
                  >
                    <ComprehensiveCTA
                      value={
                        props.tertiaryCta as Partial<ComprehensiveCTAValue>
                      }
                      eventName="tertiaryCta"
                    />
                  </EntityField>
                </div>
              </div>
            </div>
            {hasHeroImage ? (
              <EntityField
                displayName="Hero Image"
                fieldId={props.heroImage.image.field}
                constantValueEnabled={
                  props.heroImage.image.constantValueEnabled
                }
                fullHeight
              >
                <div
                  style={{
                    display: "flex",
                    minHeight: "360px",
                    height: "100%",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    image={heroImage!}
                    style={{
                      display: "block",
                      flex: "1 1 auto",
                      height: "100%",
                      objectFit:
                        props.heroImage.imageConstrain === "filled"
                          ? "cover"
                          : "contain",
                      objectPosition: "center",
                      width: "100%",
                    }}
                  />
                </div>
              </EntityField>
            ) : null}
          </div>
      </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const BarSocialDiningHeroSection: YextComponentConfig<BarSocialDiningHeroSectionProps> =
  {
    label: "Hero Section",
    fields: toPuckFields<BarSocialDiningHeroSectionProps>(
      BarSocialDiningHeroSectionFields,
    ),
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
        visibleOnLivePage: true,
      },
      eyebrow: {
        text: {
          field: "geomodifier",
          constantValue: {
            defaultValue: "",
            hasLocalizedValue: "true",
          },
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
      heading: {
        text: {
          field: "name",
          constantValue: {
            defaultValue: "",
            hasLocalizedValue: "true",
          },
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
      body: {
        text: {
          field: "",
          constantValue: {
            defaultValue: getDefaultRTF(
              "An upscale burger restaurant in [[address.city]], [[address.region]] offering dine-in, takeout, delivery, and curbside pickup options. The location serves lunch, dinner, and brunch, with happy hour available on weekdays.",
            ),
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
      heroImage: {
        image: {
          field: "",
          constantValue: {
            url: "https://a.mktgcdn.com/p/vQqhmnexQfZueJGyh5M_j5W4EcTkTyZlW93eIoqjjvQ/1900x1267.jpg",
            width: 1900,
            height: 1267,
          },
          constantValueEnabled: true,
        },
        aspectRatio: 1.5,
        imageConstrain: "filled",
        styles: {
          borderRadius: "default",
        },
      },
      primaryCta: createHeroCta(
        "Call Ahead",
        {
          selectedColor: "palette-secondary",
          contrastingColor: "palette-secondary-contrast",
        },
        "primary",
      ),
      secondaryCta: createHeroCta(
        "Order Takeout",
        {
          selectedColor: "palette-secondary",
          contrastingColor: "palette-secondary-contrast",
        },
        "primary",
      ),
      tertiaryCta: createHeroCta(
        "View Menu",
        {
          selectedColor: "[#FFFFFF]",
          contrastingColor: "[#171219]",
        },
        "secondary",
      ),
    },
    render: (props) => <BarSocialDiningHeroSectionComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "BarSocialDiningHeroSection",
  displayName: "Hero Section",
  description: "Hero Section",
  pageSetTypes: ["ENTITY"],
};
