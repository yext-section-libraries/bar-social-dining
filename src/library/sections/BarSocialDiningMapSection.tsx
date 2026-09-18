import type { SectionConfig } from "@yext/visual-editor";

import type { PuckComponent } from "@puckeditor/core";
import {
  msg,
  Background,
  EntityField,
  getSurfaceColorStyle,
  MapboxStaticMapComponent,
  mapboxStaticMapStyleOptions,
  type ThemeColor,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
  toPuckFields,
} from "@yext/visual-editor";
import type { Coordinate } from "@yext/pages-components";

type BarSocialDiningMapSectionProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  map: {
    coordinate: YextEntityField<Coordinate>;
    mapStyle: string;
    zoom: number;
    height?: string;
  };
};

const BarSocialDiningMapSectionFields: YextFields<BarSocialDiningMapSectionProps> =
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
    map: {
      label: msg("fields.map", "Map"),
      type: "object",
      objectFields: {
        coordinate: {
          type: "entityField",
          label: msg("fields.coordinates", "Coordinates"),
          filter: { types: ["type.coordinate"] },
        },
        mapStyle: {
          label: msg("fields.mapboxMapStyle", "Mapbox Map Style"),
          type: "select",
          options: mapboxStaticMapStyleOptions,
        },
        zoom: {
          label: msg("fields.zoom", "Zoom"),
          type: "number",
          min: 0,
          max: 22,
        },
      },
    },
  };

const BarSocialDiningMapSectionComponent: PuckComponent<
  BarSocialDiningMapSectionProps
> = (props) => {
  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <Background
        as="section"
        background={props.section.backgroundColor}
        style={getSurfaceColorStyle(props.section.backgroundColor)}
      >
        <style>{`
          .bar-social-dining-map-frame {
            height: 360px;
            overflow: hidden;
            position: relative;
            width: 100%;
          }

          .bar-social-dining-map-frame .mapbox-static-map-shell,
          .bar-social-dining-map-frame .mapbox-static-map-picture,
          .bar-social-dining-map-frame .mapbox-static-map-image {
            height: 100%;
            width: 100%;
          }

          .bar-social-dining-map-frame .mapbox-static-map-image {
            object-fit: cover;
            object-position: center;
          }

          @media (max-width: 768px) {
            .bar-social-dining-map-frame {
              height: 240px;
            }
          }
        `}</style>
        <EntityField
          displayName="Map Coordinates"
          fieldId={props.map.coordinate.field}
          constantValueEnabled={props.map.coordinate.constantValueEnabled}
        >
          <div className="bar-social-dining-map-frame">
            <MapboxStaticMapComponent
              coordinate={props.map.coordinate}
              id={props.id}
              mapStyle={props.map.mapStyle}
              zoom={props.map.zoom}
              height={props.map.height}
              puck={props.puck}
            />
          </div>
        </EntityField>
      </Background>
    </VisibilityWrapper>
  );
};

export const BarSocialDiningMapSection: YextComponentConfig<BarSocialDiningMapSectionProps> =
  {
    label: "Map Section",
    fields: toPuckFields<BarSocialDiningMapSectionProps>(
      BarSocialDiningMapSectionFields,
    ),
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      map: {
        coordinate: {
          field: "yextDisplayCoordinate",
          constantValue: {
            latitude: 0,
            longitude: 0,
          },
          constantValueEnabled: false,
        },
        mapStyle: "streets-v12",
        zoom: 10,
        height: "100%",
      },
    },
    render: (props) => <BarSocialDiningMapSectionComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "BarSocialDiningMapSection",
  displayName: "Map Section",
  description: "Map Section",
  pageSetTypes: ["ENTITY"],
};
