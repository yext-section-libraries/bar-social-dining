import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
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
import { formatPhoneNumber } from "@yext/visual-editor/section-library-support";
import { FaFacebookF, FaInstagram, FaPhone, FaYelp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
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

type FooterImageProps = {
  image: YextEntityField<TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type CTAItem = {
  cta: ComprehensiveCTAValue;
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

type EmailFieldProps = {
  list: YextEntityField<string[]>;
};

type BarSocialDiningFooterSectionProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  logoImage: FooterImageProps;
  followUsHeading: StyledTextProps;
  socialLinks: CTAItem[];
  contactHeading: StyledTextProps;
  contactBody: StyledRtfProps;
  phones: PhoneFieldProps;
  emails: EmailFieldProps;
  resourcesHeading: StyledTextProps;
  resourceLinks: CTAItem[];
  copyrightText: StyledRtfProps;
};

const getCtaLabel = (value: unknown): string => {
  const ctaValue = value as Partial<ComprehensiveCTAValue>;

  if (
    typeof ctaValue.data?.cta?.constantValue?.label === "object" &&
    ctaValue.data?.cta?.constantValue?.label !== null &&
    "defaultValue" in ctaValue.data.cta.constantValue.label
  ) {
    return ctaValue.data.cta.constantValue.label.defaultValue ?? "Link";
  }

  if (typeof ctaValue.data?.cta?.constantValue?.label === "string") {
    return ctaValue.data.cta.constantValue.label;
  }

  if (
    typeof ctaValue.data?.buttonText === "object" &&
    ctaValue.data?.buttonText !== null &&
    "defaultValue" in ctaValue.data.buttonText
  ) {
    return ctaValue.data.buttonText.defaultValue ?? "Button";
  }

  if (typeof ctaValue.data?.buttonText === "string") {
    return ctaValue.data.buttonText;
  }

  return "Link";
};

const renderSocialIcon = (index: number): React.ReactNode => {
  if (index === 0) {
    return <FaFacebookF />;
  }

  if (index === 1) {
    return <FaInstagram />;
  }

  return <FaYelp />;
};

const footerScopeClass = "bar-social-dining-footer";
const footerScopedTypographyCss = getScopedTypographyCss(footerScopeClass);

const createTextLinkCta = (
  label: string,
  link: string,
  color: ThemeColor,
): ComprehensiveCTAValue => createCta({ label, link, color, variant: "link" });

const footerLinkColor: ThemeColor = {
  selectedColor: "[#FFFFFF]",
  contrastingColor: "[#171219]",
};

const BarSocialDiningFooterSectionFields: YextFields<BarSocialDiningFooterSectionProps> =
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
    logoImage: {
      label: "Logo Image",
      type: "object",
      objectFields: {
        image: {
          type: "entityField",
          label: "Image",
          filter: {
            types: ["type.image"],
          },
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
    followUsHeading: {
      label: "Follow Us Heading",
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
    socialLinks: {
      label: "Social Links",
      type: "array",
      arrayFields: {
        cta: {
          label: "Link",
          type: "comprehensiveCTA",
        },
      },
      defaultItemProps: {
        cta: createTextLinkCta("Social", "#", footerLinkColor),
      },
      getItemSummary: (item) => getCtaLabel(item.cta),
    },
    contactHeading: {
      label: "Contact Heading",
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
    contactBody: {
      label: "Contact Body",
      type: "object",
      objectFields: {
        text: {
          type: "entityField",
          label: "Text",
          filter: {
            types: ["type.rich_text_v2"],
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
    phones: {
      label: "Phones",
      type: "object",
      objectFields: {
        items: {
          label: "Items",
          type: "array",
          arrayFields: {
            number: {
              type: "entityField",
              label: "Number",
              filter: {
                types: ["type.phone"],
              },
            },
            label: {
              label: "Label",
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
          label: "Phone Format",
          type: "radio",
          options: [
            { label: "Domestic", value: "domestic" },
            { label: "International", value: "international" },
          ],
        },
        includeHyperlink: {
          label: "Include Hyperlink",
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
    },
    emails: {
      label: "Emails",
      type: "object",
      objectFields: {
        list: {
          type: "entityField",
          label: "Emails",
          filter: {
            types: ["type.string"],
            includeListsOnly: true,
            allowList: ["emails"],
          },
          disallowTranslation: true,
        },
      },
    },
    resourcesHeading: {
      label: "Resources Heading",
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
    resourceLinks: {
      label: "Resource Links",
      type: "array",
      arrayFields: {
        cta: {
          label: "Link",
          type: "comprehensiveCTA",
        },
      },
      defaultItemProps: {
        cta: createTextLinkCta("Link", "#", footerLinkColor),
      },
      getItemSummary: (item) => getCtaLabel(item.cta),
    },
    copyrightText: {
      label: "Copyright Text",
      type: "object",
      objectFields: {
        text: {
          type: "entityField",
          label: "Text",
          filter: {
            types: ["type.rich_text_v2"],
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
  };

const BarSocialDiningFooterSectionComponent: PuckComponent<
  BarSocialDiningFooterSectionProps
> = ({ id, ...props }) => {
  const streamDocument = useDocument<{ locale?: string }>();
  const locale = streamDocument.locale ?? "en";
  const resolvedLogoImage = resolveComponentData(
    props.logoImage.image,
    locale,
    streamDocument,
  );
  const resolvedLogoImageUrl =
    typeof resolvedLogoImage === "object" &&
    resolvedLogoImage !== null &&
    "url" in resolvedLogoImage &&
    typeof resolvedLogoImage.url === "string"
      ? resolvedLogoImage.url.trim()
      : typeof resolvedLogoImage === "object" &&
          resolvedLogoImage !== null &&
          "image" in resolvedLogoImage &&
          resolvedLogoImage.image &&
          typeof resolvedLogoImage.image === "object" &&
          "url" in resolvedLogoImage.image &&
          typeof resolvedLogoImage.image.url === "string"
        ? resolvedLogoImage.image.url.trim()
        : "";
  const hasLogoImage = Boolean(resolvedLogoImageUrl);
  const logoImage = hasLogoImage
    ? (resolvedLogoImage as TranslatableAssetImage)
    : undefined;
  const resolvedFollowUsHeading = resolveComponentData(
    props.followUsHeading.text,
    locale,
    streamDocument,
    { output: "plainText" },
  );
  const resolvedContactHeading = resolveComponentData(
    props.contactHeading.text,
    locale,
    streamDocument,
    { output: "plainText" },
  );
  const resolvedContactBody = resolveComponentData(
    props.contactBody.text,
    locale,
    streamDocument,
  );
  const resolvedResourcesHeading = resolveComponentData(
    props.resourcesHeading.text,
    locale,
    streamDocument,
    { output: "plainText" },
  );
  const resolvedCopyrightText = resolveComponentData(
    props.copyrightText.text,
    locale,
    streamDocument,
  );
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
        fieldId: item.number.field,
        constantValueEnabled: item.number.constantValueEnabled,
        linkValue: normalizedNumber.replace(/[^\d+]/g, ""),
      },
    ];
  });
  const resolvedEmails = resolveComponentData(
    props.emails.list,
    locale,
    streamDocument,
  ) as string[] | string | undefined;
  const emailList = Array.isArray(resolvedEmails)
    ? resolvedEmails
    : typeof resolvedEmails === "string" && resolvedEmails.length > 0
      ? [resolvedEmails]
      : [];

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BarSocialDiningFooterSection${getAnalyticsScopeHash(id)}`}
      >
        <style>{footerScopedTypographyCss}</style>
        <style>{`
          @media (max-width: 1024px) and (min-width: 769px) {
            .bar-social-dining-footer-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }

          @media (max-width: 768px) {
            .bar-social-dining-footer-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      <Background
        as="footer"
        background={props.section.backgroundColor}
          className={footerScopeClass}
          style={{
            ...getSurfaceColorStyle(
              props.section.backgroundColor,
              streamDocument,
            ),
            padding: "40px 28px",
          }}
        >
          <div
            className="bar-social-dining-footer-grid"
            style={{
              display: "grid",
              gap: "28px",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            <div>
              <EntityField
                displayName="Logo Image"
                fieldId={props.logoImage.image.field}
                constantValueEnabled={
                  props.logoImage.image.constantValueEnabled
                }
              >
                {hasLogoImage ? (
                  <div
                    style={{
                      aspectRatio:
                        props.logoImage.aspectRatio > 0
                          ? props.logoImage.aspectRatio
                          : undefined,
                      marginBottom: "20px",
                      overflow:
                        props.logoImage.imageConstrain === "filled"
                          ? "hidden"
                          : undefined,
                      width: "170px",
                    }}
                  >
                    <Image
                      image={logoImage!}
                      style={{
                        height:
                          props.logoImage.aspectRatio > 0 ? "100%" : "55px",
                        objectFit:
                          props.logoImage.imageConstrain === "filled"
                            ? "cover"
                            : "contain",
                        width: "100%",
                      }}
                    />
                  </div>
                ) : null}
              </EntityField>
              <EntityField
                displayName="Follow Us Heading"
                fieldId={props.followUsHeading.text.field}
                constantValueEnabled={
                  props.followUsHeading.text.constantValueEnabled
                }
              >
                <h3
                  style={{
                    ...textStyle(
                      props.followUsHeading.styles,
                      props.followUsHeading.fontColor,
                      props.section.backgroundColor,
                    ),
                    margin: "0 0 12px",
                  }}
                >
                  {typeof resolvedFollowUsHeading === "string"
                    ? resolvedFollowUsHeading
                    : ""}
                </h3>
              </EntityField>
              <div style={{ display: "flex", gap: "8px" }}>
                {(props.socialLinks ?? []).map((item, index) => (
                  <EntityField
                    key={`${getCtaLabel(item.cta)}-${index}`}
                    displayName={`Social Link ${index + 1}`}
                    fieldId={item.cta.data.cta.field}
                    constantValueEnabled={
                      item.cta.data.cta.constantValueEnabled
                    }
                  >
                    <ComprehensiveCTA
                      value={item.cta as Partial<ComprehensiveCTAValue>}
                      alwaysHideCaret
                      eventName={`footerSocial${index}`}
                      label={
                        <span
                          aria-label={getCtaLabel(item.cta)}
                          style={{
                            alignItems: "center",
                            display: "inline-flex",
                            height: "20px",
                            justifyContent: "center",
                            width: "20px",
                          }}
                        >
                          {renderSocialIcon(index)}
                        </span>
                      }
                      style={{ color: "inherit" }}
                    />
                  </EntityField>
                ))}
              </div>
            </div>
            <div>
              <EntityField
                displayName="Contact Heading"
                fieldId={props.contactHeading.text.field}
                constantValueEnabled={
                  props.contactHeading.text.constantValueEnabled
                }
              >
                <h3
                  style={{
                    ...textStyle(
                      props.contactHeading.styles,
                      props.contactHeading.fontColor,
                      props.section.backgroundColor,
                    ),
                    margin: "0 0 16px",
                  }}
                >
                  {typeof resolvedContactHeading === "string"
                    ? resolvedContactHeading
                    : ""}
                </h3>
              </EntityField>
              <EntityField
                displayName="Contact Body"
                fieldId={props.contactBody.text.field}
                constantValueEnabled={
                  props.contactBody.text.constantValueEnabled
                }
              >
                <div
                  className="bar-social-dining-link-typography"
                  style={{
                    ...textStyle(
                      props.contactBody.styles,
                      props.contactBody.fontColor,
                      props.section.backgroundColor,
                    ),
                  }}
                >
                  {renderRichText(resolvedContactBody)}
                </div>
              </EntityField>
              {resolvedPhoneItems.map((item, index) => (
                <EntityField
                  key={`${item.fieldId}-${index}`}
                  displayName="Phone Number"
                  fieldId={item.fieldId}
                  constantValueEnabled={item.constantValueEnabled}
                >
                  <div
                    className="bar-social-dining-link-typography"
                    style={{
                      alignItems: "center",
                      display: "flex",
                      gap: "8px",
                      marginTop: "12px",
                    }}
                  >
                    <FaPhone />
                    {item.label ? <span>{item.label}</span> : null}
                    <ComprehensiveCTA
                      value={
                        createTextLinkCta(
                          item.formattedNumber,
                          item.linkValue,
                          footerLinkColor,
                        ) as Partial<ComprehensiveCTAValue>
                      }
                      alwaysHideCaret
                      eventName="phoneCta"
                      style={{ color: "inherit" }}
                    />
                  </div>
                </EntityField>
              ))}
              <EntityField
                displayName="Emails"
                fieldId={props.emails.list.field}
                constantValueEnabled={props.emails.list.constantValueEnabled}
              >
                {emailList.map((emailValue, index) => (
                  <div
                    className="bar-social-dining-link-typography"
                    key={`${emailValue}-${index}`}
                    style={{
                      alignItems: "center",
                      display: "flex",
                      gap: "8px",
                      marginTop: "12px",
                    }}
                  >
                    <MdEmail />
                    <ComprehensiveCTA
                      value={
                        createTextLinkCta(
                          emailValue.replace(/^mailto:/i, ""),
                          emailValue,
                          footerLinkColor,
                        ) as Partial<ComprehensiveCTAValue>
                      }
                      alwaysHideCaret
                      eventName="emailCta"
                      style={{ color: "inherit" }}
                    />
                  </div>
                ))}
              </EntityField>
            </div>
            <div>
              <EntityField
                displayName="Resources Heading"
                fieldId={props.resourcesHeading.text.field}
                constantValueEnabled={
                  props.resourcesHeading.text.constantValueEnabled
                }
              >
                <h3
                  style={{
                    ...textStyle(
                      props.resourcesHeading.styles,
                      props.resourcesHeading.fontColor,
                      props.section.backgroundColor,
                    ),
                    margin: "0 0 16px",
                  }}
                >
                  {typeof resolvedResourcesHeading === "string"
                    ? resolvedResourcesHeading
                    : ""}
                </h3>
              </EntityField>
              <div
                className="bar-social-dining-link-typography"
                style={{ display: "grid", gap: "12px" }}
              >
                {(props.resourceLinks ?? []).map((item, index) => (
                  <EntityField
                    key={`${getCtaLabel(item.cta)}-${index}`}
                    displayName={`Resource Link ${index + 1}`}
                    fieldId={item.cta.data.cta.field}
                    constantValueEnabled={
                      item.cta.data.cta.constantValueEnabled
                    }
                  >
                    <ComprehensiveCTA
                      value={item.cta as Partial<ComprehensiveCTAValue>}
                      alwaysHideCaret
                      eventName={`footerLink${index}`}
                      style={{ color: "inherit" }}
                    />
                  </EntityField>
                ))}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "44px",
            }}
          >
            <EntityField
              displayName="Copyright Text"
              fieldId={props.copyrightText.text.field}
              constantValueEnabled={
                props.copyrightText.text.constantValueEnabled
              }
            >
              <div
                className="bar-social-dining-link-typography"
                style={{
                  ...textStyle(
                    props.copyrightText.styles,
                    props.copyrightText.fontColor,
                    props.section.backgroundColor,
                  ),
                  margin: 0,
                  opacity: 0.75,
                }}
              >
                {renderRichText(resolvedCopyrightText)}
              </div>
            </EntityField>
          </div>
      </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const BarSocialDiningFooterSection: YextComponentConfig<BarSocialDiningFooterSectionProps> =
  {
    label: "Footer Section",
    fields: toPuckFields<BarSocialDiningFooterSectionProps>(
      BarSocialDiningFooterSectionFields,
    ),
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
        visibleOnLivePage: true,
      },
      logoImage: {
        image: {
          field: "",
          constantValue: {
            url: "https://a.mktgcdn.com/p/OLT2KExDEKhKlCmIobyRRHN6MFUS77fVs5gIt_FTnBI/450x450.jpg",
            width: 450,
            height: 450,
          },
          constantValueEnabled: true,
        },
        aspectRatio: 1,
        imageConstrain: "fixed",
        styles: {
          borderRadius: "default",
        },
      },
      followUsHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Follow us",
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
      socialLinks: [
        {
          cta: createTextLinkCta("Facebook", "#", footerLinkColor),
        },
        {
          cta: createTextLinkCta("Instagram", "#", footerLinkColor),
        },
        {
          cta: createTextLinkCta("Yelp", "#", footerLinkColor),
        },
      ],
      contactHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Contact us",
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
      contactBody: {
        text: {
          field: "",
          constantValue: {
            defaultValue: getDefaultRTF(
              "Questions? We’re here for you Monday - Friday 10am-6pm ET.",
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
      phones: {
        items: [
          {
            number: {
              field: "",
              constantValue: "+1 (416) 555-5555",
              constantValueEnabled: true,
            },
            label: "",
          },
        ],
        phoneFormat: "domestic",
        includeHyperlink: true,
      },
      emails: {
        list: {
          field: "emails",
          constantValue: ["support@redwood.co"],
          constantValueEnabled: false,
        },
      },
      resourcesHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Resources",
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
      resourceLinks: [
        {
          cta: createTextLinkCta("Menu", "#", footerLinkColor),
        },
        {
          cta: createTextLinkCta("Order online", "#", footerLinkColor),
        },
        {
          cta: createTextLinkCta("Reservations", "#", footerLinkColor),
        },
        {
          cta: createTextLinkCta("Group events", "#", footerLinkColor),
        },
        {
          cta: createTextLinkCta("Catering", "#", footerLinkColor),
        },
        {
          cta: createTextLinkCta("Careers", "#", footerLinkColor),
        },
        {
          cta: createTextLinkCta("Gift cards", "#", footerLinkColor),
        },
        {
          cta: createTextLinkCta("Contact", "#", footerLinkColor),
        },
      ],
      copyrightText: {
        text: {
          field: "",
          constantValue: {
            defaultValue: getDefaultRTF(
              "© 2026 [[name]] — All Rights Reserved",
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
    },
    render: (props) => <BarSocialDiningFooterSectionComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "BarSocialDiningFooterSection",
  displayName: "Footer Section",
  description: "Footer Section",
  pageSetTypes: ["ENTITY", "DIRECTORY", "LOCATOR"],
};
