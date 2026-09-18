import type { SectionConfig } from "@yext/visual-editor";

import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider, Link } from "@yext/pages-components";
import {
  msg,
  Background,
  EntityField,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  resolveBreadcrumbs,
  resolveComponentData,
  toPuckFields,
  useDocument,
  useTemplateProps,
  type StreamDocument,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
  pt,
} from "@yext/visual-editor";
import { getTextStyle } from "../shared/sectionStyles";
import { useTranslation } from "react-i18next";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type BreadcrumbEntry = {
  name?: string;
  slug?: string;
  breadcrumbIndex: number;
  isRoot: boolean;
  isCurrentPage: boolean;
};

type BreadcrumbStreamDocument = StreamDocument & {
  address?: {
    line1?: string;
  };
  name?: string;
  locale?: string;
};

type BarSocialDiningBreadcrumbsSectionProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  rootLabel: StyledTextProps;
  includeCurrentLocation: boolean;
};

const breadcrumbsScopeClass = "bar-social-dining-breadcrumbs";

const textStyle = ({
  styles,
  fontColor,
  surfaceColor,
  streamDocument,
}: {
  styles: StyledTextValue;
  fontColor: ThemeColor | undefined;
  surfaceColor: ThemeColor;
  streamDocument: BreadcrumbStreamDocument;
}): React.CSSProperties => ({
  ...getTextStyle(styles, fontColor, surfaceColor, streamDocument),
  letterSpacing: "0.08em",
  lineHeight: 1.4,
  textDecoration: "none",
});

const breadcrumbsScopedCss = `
  .${breadcrumbsScopeClass} .bar-social-dining-breadcrumbs-link {
    transition: opacity 150ms ease;
  }

  .${breadcrumbsScopeClass} .bar-social-dining-breadcrumbs-link:hover {
    opacity: 0.78;
  }
`;

const BarSocialDiningBreadcrumbsSectionFields: YextFields<BarSocialDiningBreadcrumbsSectionProps> =
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
    rootLabel: {
      label: msg("fields.rootLabel", "Root Label"),
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
    includeCurrentLocation: {
      label: msg("fields.includeCurrentLocation", "Include Current Location"),
      type: "radio",
      options: [
        { label: msg("fields.options.yes", "Yes"), value: true },
        { label: msg("fields.options.no", "No"), value: false },
      ],
    },
  };

const BarSocialDiningBreadcrumbsSectionComponent: PuckComponent<
  BarSocialDiningBreadcrumbsSectionProps
> = ({ id, ...props }) => {
  const streamDocument = useDocument<BreadcrumbStreamDocument>();
  const { relativePrefixToRoot } = useTemplateProps<{
    relativePrefixToRoot?: string;
  }>();
  const { t } = useTranslation();
  const locale = streamDocument.locale ?? "en";
  const resolvedRootLabelValue = resolveComponentData(
    props.rootLabel.text,
    locale,
    streamDocument,
    { output: "plainText" },
  );
  const rootLabelText =
    typeof resolvedRootLabelValue === "string" ? resolvedRootLabelValue : "";
  const currentPageLabel =
    streamDocument.name?.trim() || streamDocument.address?.line1?.trim() || "";
  const currentPageFieldId = streamDocument.name?.trim()
    ? "name"
    : streamDocument.address?.line1?.trim()
      ? "address.line1"
      : "";
  const breadcrumbs = resolveBreadcrumbs(streamDocument);
  const breadcrumbEntries: BreadcrumbEntry[] = breadcrumbs.map(
    (breadcrumb, index) => ({
      name: breadcrumb.name,
      slug: breadcrumb.slug,
      breadcrumbIndex: index,
      isRoot: index === 0,
      isCurrentPage: index === breadcrumbs.length - 1,
    }),
  );
  const visibleEntries = breadcrumbEntries.filter((entry) => {
    if (breadcrumbEntries.length <= 1) {
      return true;
    }

    return props.includeCurrentLocation || !entry.isCurrentPage;
  });
  const resolvedTextStyle = textStyle({
    styles: props.rootLabel.styles,
    fontColor: props.rootLabel.fontColor,
    surfaceColor: props.section.backgroundColor,
    streamDocument,
  });

  if (!visibleEntries.length) {
    return props.puck.isEditing ? (
      <p
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "18px 24px",
        }}
      >
        {pt(
          "noBreadcrumbs",
          "No breadcrumbs available (section will be hidden on live page). Create a directory to enable breadcrumbs.",
        )}
      </p>
    ) : (
      <></>
    );
  }

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BarSocialDiningBreadcrumbsSection${getAnalyticsScopeHash(id)}`}
      >
        <style>{breadcrumbsScopedCss}</style>
        <Background
          as="section"
          background={props.section.backgroundColor}
          className={breadcrumbsScopeClass}
          style={{
            ...getSurfaceColorStyle(
              props.section.backgroundColor,
              streamDocument,
            ),
            padding: "18px 24px",
          }}
        >
          <div
            style={{
              margin: "0 auto",
              maxWidth: "var(--maxWidth-pageSection-contentWidth, 1200px)",
            }}
          >
            <nav aria-label={t("breadcrumb", "Breadcrumb")}>
              <ol
                style={{
                  alignItems: "center",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                }}
              >
                {visibleEntries.length ? (
                  visibleEntries.map((entry, index) => {
                    const label = entry.isRoot
                      ? rootLabelText || entry.name || ""
                      : entry.isCurrentPage
                        ? currentPageLabel
                        : entry.name || "";
                    const href =
                      relativePrefixToRoot && entry.slug
                        ? relativePrefixToRoot + entry.slug
                        : entry.slug || "";
                    const isLinked = !entry.isCurrentPage && Boolean(href);

                    const content = entry.isRoot ? (
                      <EntityField
                        displayName="Root Label"
                        fieldId={props.rootLabel.text.field}
                        constantValueEnabled={
                          props.rootLabel.text.constantValueEnabled
                        }
                      >
                        {isLinked ? (
                          <Link
                            cta={{
                              link: href,
                              linkType: "URL",
                            }}
                            className="bar-social-dining-breadcrumbs-link"
                            eventName={`link${entry.breadcrumbIndex}`}
                            style={resolvedTextStyle}
                          >
                            {label}
                          </Link>
                        ) : (
                          <span
                            aria-current={
                              entry.isCurrentPage ? "page" : undefined
                            }
                            style={resolvedTextStyle}
                          >
                            {label}
                          </span>
                        )}
                      </EntityField>
                    ) : entry.isCurrentPage && currentPageFieldId ? (
                      <EntityField
                        displayName="Current Page"
                        fieldId={currentPageFieldId}
                        constantValueEnabled={false}
                      >
                        <span aria-current="page" style={resolvedTextStyle}>
                          {label}
                        </span>
                      </EntityField>
                    ) : isLinked ? (
                      <Link
                        cta={{
                          link: href,
                          linkType: "URL",
                        }}
                        className="bar-social-dining-breadcrumbs-link"
                        eventName={`link${entry.breadcrumbIndex}`}
                        style={resolvedTextStyle}
                      >
                        {label}
                      </Link>
                    ) : (
                      <span
                        aria-current={entry.isCurrentPage ? "page" : undefined}
                        style={resolvedTextStyle}
                      >
                        {label}
                      </span>
                    );

                    return (
                      <li
                        key={`breadcrumb-${entry.breadcrumbIndex}`}
                        style={{
                          alignItems: "center",
                          display: "inline-flex",
                          gap: "8px",
                        }}
                      >
                        {index > 0 ? (
                          <span
                            aria-hidden
                            style={{
                              ...resolvedTextStyle,
                              opacity: 0.55,
                            }}
                          >
                            /
                          </span>
                        ) : null}
                        <wbr />
                        {content}
                      </li>
                    );
                  })
                ) : (
                  <li style={{ display: "inline-flex" }}>
                    <EntityField
                      displayName="Root Label"
                      fieldId={props.rootLabel.text.field}
                      constantValueEnabled={
                        props.rootLabel.text.constantValueEnabled
                      }
                    >
                      <span style={resolvedTextStyle}>
                        {rootLabelText || "All Locations"}
                      </span>
                    </EntityField>
                  </li>
                )}
              </ol>
            </nav>
          </div>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const BarSocialDiningBreadcrumbsSection: YextComponentConfig<BarSocialDiningBreadcrumbsSectionProps> =
  {
    label: "Breadcrumbs Section",
    fields: toPuckFields<BarSocialDiningBreadcrumbsSectionProps>(
      BarSocialDiningBreadcrumbsSectionFields,
    ),
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      rootLabel: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "All Locations",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "uppercase",
        },
        fontColor: undefined,
      },
      includeCurrentLocation: true,
    },
    render: (props) => (
      <BarSocialDiningBreadcrumbsSectionComponent {...props} />
    ),
  };

export const config: SectionConfig = {
  id: "BarSocialDiningBreadcrumbsSection",
  displayName: "Breadcrumbs Section",
  description: "Breadcrumbs Section",
  pageSetTypes: ["ENTITY"],
};
