import type { SectionConfig } from "@yext/visual-editor";

import type { PuckComponent } from "@puckeditor/core";
import {
  AnalyticsScopeProvider,
  Link,
  getDirections,
} from "@yext/pages-components";
import {
  Background,
  EntityField,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  mergeMeta,
  resolveComponentData,
  resolveUrlTemplate,
  useDocument,
  useNearbyLocations,
  useTemplateProps,
  type NearbyLocationDoc,
  type StyledTextValue,
  type StreamDocument,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
  toPuckFields,
} from "@yext/visual-editor";
import { formatPhoneNumber } from "@yext/visual-editor/section-library-support";
import type {
  AddressType,
  Coordinate,
  ListingType,
} from "@yext/pages-components";
import {
  getScopedTypographyCss,
  resolveTextColor,
} from "../shared/sectionStyles";

type NearbyLocationShape = NearbyLocationDoc & {
  address?: AddressType;
  mainPhone?: string;
  googlePlaceId?: string;
  listings?: ListingType[];
  yextDisplayCoordinate?: Coordinate;
};

type BarSocialDiningNearbyLocationsSectionProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  heading: {
    text: YextEntityField<TranslatableString>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  radius: number;
  limit: number;
  cardBackgroundColor: ThemeColor;
};

const nearbyLocationsScopeClass = "bar-social-dining-nearby-locations";
const nearbyLocationsScopedTypographyCss = getScopedTypographyCss(nearbyLocationsScopeClass);

const BarSocialDiningNearbyLocationsSectionFields: YextFields<BarSocialDiningNearbyLocationsSectionProps> =
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
    radius: {
      label: "Radius",
      type: "number",
      min: 1,
      max: 50,
    },
    limit: {
      label: "Limit",
      type: "number",
      min: 1,
      max: 12,
    },
    cardBackgroundColor: {
      label: "Card Background Color",
      type: "basicSelector",
      options: "BACKGROUND_COLOR",
    },
  };

const BarSocialDiningNearbyLocationsSectionComponent: PuckComponent<
  BarSocialDiningNearbyLocationsSectionProps
> = ({ id, ...props }) => {
  const streamDocument = useDocument<
    StreamDocument & { yextDisplayCoordinate?: Coordinate }
  >();
  const { relativePrefixToRoot } = useTemplateProps<{
    relativePrefixToRoot?: string;
  }>();
  const locale = streamDocument.locale ?? "en";
  const coordinate = streamDocument.yextDisplayCoordinate;
  const resolvedHeading = resolveComponentData(
    props.heading.text,
    locale,
    streamDocument,
    { output: "plainText" },
  );
  const enabled =
    coordinate?.latitude !== undefined &&
    coordinate?.longitude !== undefined &&
    Boolean(props.radius) &&
    Boolean(props.limit);

  const { data: nearbyLocationsData, status: nearbyLocationsStatus } =
    useNearbyLocations({
      streamDocument,
      latitude: coordinate?.latitude,
      longitude: coordinate?.longitude,
      radiusMi: props.radius,
      limit: props.limit,
      enabled,
    });

  const nearbyLocationDocs = (nearbyLocationsData?.response?.docs ??
    []) as NearbyLocationShape[];
  const sectionForeground = resolveTextColor(
    undefined,
    props.section.backgroundColor,
  );
  const cardForeground = resolveTextColor(undefined, props.cardBackgroundColor);

  if (!enabled) {
    return <></>;
  }

  if (
    (nearbyLocationsStatus !== "success" || !nearbyLocationDocs.length) &&
    !props.puck.isEditing
  ) {
    return <></>;
  }

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BarSocialDiningNearbyLocationsSection${getAnalyticsScopeHash(id)}`}
      >
        <style>{nearbyLocationsScopedTypographyCss}</style>
      <Background
        as="section"
        background={props.section.backgroundColor}
          className={nearbyLocationsScopeClass}
          style={{
            ...getSurfaceColorStyle(
              props.section.backgroundColor,
              streamDocument,
            ),
            padding: "72px 24px 48px",
          }}
        >
          <div
            style={{
              margin: "0 auto",
              maxWidth: "var(--maxWidth-pageSection-contentWidth, 1200px)",
            }}
          >
            <div style={{ marginBottom: "28px" }}>
              <EntityField
                displayName="Heading"
                fieldId={props.heading.text.field}
                constantValueEnabled={props.heading.text.constantValueEnabled}
              >
                <h2
                  style={{
                    color: resolveTextColor(
                      props.heading.fontColor,
                      props.section.backgroundColor,
                    ),
                    fontStyle:
                      props.heading.styles.fontStyle === "default"
                        ? undefined
                        : props.heading.styles.fontStyle,
                    fontWeight:
                      props.heading.styles.fontWeight === "default"
                        ? undefined
                        : props.heading.styles.fontWeight,
                    margin: 0,
                    textTransform:
                      props.heading.styles.textTransform === "default"
                        ? undefined
                        : props.heading.styles.textTransform,
                  }}
                >
                  {typeof resolvedHeading === "string" ? resolvedHeading : ""}
                </h2>
              </EntityField>
            </div>
            {nearbyLocationsStatus === "pending" ? (
              <p style={{ color: sectionForeground }}>
                Loading nearby locations
              </p>
            ) : nearbyLocationsStatus !== "success" ||
              !nearbyLocationDocs.length ? (
              <p style={{ color: sectionForeground }}>
                No nearby locations found for this location
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "20px",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  overflowX: "auto",
                }}
              >
                {nearbyLocationDocs.map((locationData, index) => {
                  const mergedDocument = mergeMeta(
                    locationData,
                    streamDocument,
                  );
                  const resolvedUrl = resolveUrlTemplate(
                    mergedDocument,
                    relativePrefixToRoot ?? "",
                  );
                  const directionsUrl =
                    getDirections(
                      locationData.address,
                      locationData.listings,
                      locationData.googlePlaceId,
                      undefined,
                      locationData.yextDisplayCoordinate,
                    ) ?? resolvedUrl;

                  return (
                    <article
                      key={locationData.id ?? locationData.name ?? index}
                      style={{
                        ...getSurfaceColorStyle(
                          props.cardBackgroundColor,
                          streamDocument,
                        ),
                        border: "1px solid rgba(23, 18, 25, 0.08)",
                        color: cardForeground,
                        minWidth: "240px",
                        padding: "18px 16px",
                      }}
                    >
                      <h3
                        style={{
                          margin: "0 0 8px",
                        }}
                      >
                        {locationData.name ?? "Nearby location"}
                      </h3>
                      <p style={{ margin: "0 0 8px" }}>
                        {locationData.address
                          ? `${locationData.address.line1}, ${locationData.address.city}, ${locationData.address.region ?? ""} ${locationData.address.postalCode}`.trim()
                          : ""}
                      </p>
                      {locationData.mainPhone ? (
                        <p style={{ margin: "0 0 24px" }}>
                          {formatPhoneNumber(locationData.mainPhone, "domestic")}
                        </p>
                      ) : null}
                      <div className="bar-social-dining-link-typography">
                        <Link
                          cta={{
                            link: directionsUrl,
                            linkType: "URL",
                          }}
                          eventName={`locationCta-${index}`}
                        >
                          Get Directions
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
      </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const BarSocialDiningNearbyLocationsSection: YextComponentConfig<BarSocialDiningNearbyLocationsSectionProps> =
  {
    label: "Nearby Locations Section",
    fields: toPuckFields<BarSocialDiningNearbyLocationsSectionProps>(
      BarSocialDiningNearbyLocationsSectionFields,
    ),
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Nearby [[name]] Locations",
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
      radius: 10,
      limit: 3,
      cardBackgroundColor: {
        selectedColor: "palette-quaternary",
        contrastingColor: "palette-quaternary-contrast",
      },
    },
    render: (props) => (
      <BarSocialDiningNearbyLocationsSectionComponent {...props} />
    ),
  };

export const config: SectionConfig = {
  id: "BarSocialDiningNearbyLocationsSection",
  displayName: "Nearby Locations Section",
  description: "Nearby Locations Section",
  pageSetTypes: ["ENTITY"],
};
