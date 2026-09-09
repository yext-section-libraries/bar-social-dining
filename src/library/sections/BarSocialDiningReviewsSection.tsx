import type { SectionConfig } from "@yext/visual-editor";

import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  Background,
  EntityField,
  getSurfaceColorStyle,
  type ThemeColor,
  type StyledTextValue,
  type StreamDocument,
  type ThemeColor as ThemeColorType,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
  getAggregateRating,
  getAnalyticsScopeHash,
  resolveComponentData,
  toPuckFields,
  useDocument,
} from "@yext/visual-editor";
import {
  getScopedTypographyCss,
  getTextStyle as textStyle,
  resolveTextColor,
} from "../shared/sectionStyles";

type ReviewAggregate = {
  publisher?: string;
  topReviews?: Array<{
    authorName?: string;
    rating?: number;
    content?: string;
    reviewDate?: string;
  }>;
};

type BarSocialDiningReviewsSectionProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  heading: {
    text: YextEntityField<TranslatableString>;
    styles: StyledTextValue;
    fontColor?: ThemeColorType;
  };
  cardBackgroundColor: ThemeColor;
  starColor: ThemeColor | undefined;
};

const renderStars = (rating?: number): string => {
  const normalizedRating = Math.max(0, Math.min(5, Math.round(rating ?? 0)));
  return `${"★".repeat(normalizedRating)}${"☆".repeat(5 - normalizedRating)}`;
};

const reviewsScopeClass = "bar-social-dining-reviews";
const reviewsScopedTypographyCss = getScopedTypographyCss(reviewsScopeClass);

const BarSocialDiningReviewsSectionFields: YextFields<BarSocialDiningReviewsSectionProps> =
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
    cardBackgroundColor: {
      label: "Card Background Color",
      type: "basicSelector",
      options: "BACKGROUND_COLOR",
    },
    starColor: {
      label: "Star Color",
      type: "basicSelector",
      options: "SITE_COLOR",
    },
  };

const BarSocialDiningReviewsSectionComponent: PuckComponent<
  BarSocialDiningReviewsSectionProps
> = ({ id, ...props }) => {
  const streamDocument = useDocument<
    StreamDocument & { ref_reviewsAgg?: ReviewAggregate[] }
  >();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading = resolveComponentData(
    props.heading.text,
    locale,
    streamDocument,
    { output: "plainText" },
  );
  const { averageRating, reviewCount } = getAggregateRating(streamDocument);
  const firstPartyAggregate = streamDocument.ref_reviewsAgg?.find(
    (aggregate) => aggregate.publisher === "FIRSTPARTY",
  );
  const reviews = firstPartyAggregate?.topReviews?.slice(0, 3) ?? [];
  const cardForegroundColor = resolveTextColor(
    undefined,
    props.cardBackgroundColor,
  );
  const starColor = resolveTextColor(
    props.starColor,
    props.cardBackgroundColor,
  );

  if (!reviews.length && !props.puck.isEditing) {
    return <></>;
  }

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BarSocialDiningReviewsSection${getAnalyticsScopeHash(id)}`}
      >
        <style>{reviewsScopedTypographyCss}</style>
      <Background
        as="section"
        background={props.section.backgroundColor}
          className={reviewsScopeClass}
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
              <p
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.12em",
                  margin: "8px 0 0",
                  textTransform: "uppercase",
                }}
              >
                {averageRating
                  ? `${averageRating.toFixed(1)} stars based on ${reviewCount} reviews`
                  : "No first-party reviews yet"}
              </p>
            </div>
            {reviews.length ? (
              <div
                style={{
                  display: "grid",
                  gap: "20px",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                }}
              >
                {reviews.map((review, index) => (
                  <article
                    key={`${review.authorName ?? "review"}-${index}`}
                    style={{
                      ...getSurfaceColorStyle(
                        props.cardBackgroundColor,
                        streamDocument,
                      ),
                      border: "1px solid rgba(23, 18, 25, 0.45)",
                      display: "flex",
                      flexDirection: "column",
                      minHeight: "235px",
                      padding: "18px 14px 16px",
                    }}
                  >
                    <p
                      style={{
                        color: starColor,
                        fontSize: "0.75rem",
                        letterSpacing: "0.3em",
                        margin: "0 0 18px",
                      }}
                    >
                      {renderStars(review.rating)}{" "}
                      <span
                        style={{
                          color: cardForegroundColor,
                          letterSpacing: "normal",
                          marginLeft: "10px",
                        }}
                      >
                        {typeof review.rating === "number"
                          ? `${review.rating}/5 stars`
                          : "Review"}
                      </span>
                    </p>
                    <p
                      style={{
                        color: cardForegroundColor,
                        flexGrow: 1,
                        margin: "0 0 16px",
                      }}
                    >
                      {review.content ?? "No first-party review content yet."}
                    </p>
                    <h3
                      style={{
                        color: cardForegroundColor,
                        margin: 0,
                      }}
                    >
                      {review.authorName ?? "Anonymous"}
                    </h3>
                    {review.reviewDate ? (
                      <p
                        style={{
                          color: cardForegroundColor,
                          margin: "2px 0 0",
                        }}
                      >
                        {new Date(review.reviewDate).toLocaleDateString()}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: "center" }}>
                No first-party reviews. This section won&apos;t be displayed on
                the live page.
              </p>
            )}
          </div>
      </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const BarSocialDiningReviewsSection: YextComponentConfig<BarSocialDiningReviewsSectionProps> =
  {
    label: "Reviews Section",
    fields: toPuckFields<BarSocialDiningReviewsSectionProps>(
      BarSocialDiningReviewsSectionFields,
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
            defaultValue: "Reviews",
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
      cardBackgroundColor: {
        selectedColor: "palette-secondary",
        contrastingColor: "palette-secondary-contrast",
      },
      starColor: undefined,
    },
    render: (props) => (
      <BarSocialDiningReviewsSectionComponent {...props} />
    ),
  };

export const config: SectionConfig = {
  id: "BarSocialDiningReviewsSection",
  displayName: "Reviews Section",
  description: "Reviews Section",
  pageSetTypes: ["ENTITY"],
};
