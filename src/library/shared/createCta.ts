import type {
  ComprehensiveCTAValue,
  ThemeColor,
} from "@yext/visual-editor";

type CreateCtaOptions = {
  label: string;
  link?: string;
  variant: "primary" | "secondary" | "link";
  color?: ThemeColor;
};

export const createCta = ({
  label,
  link = "#",
  variant,
  color,
}: CreateCtaOptions): ComprehensiveCTAValue => ({
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        ctaType: "textAndLink",
        label: {
          defaultValue: label,
          hasLocalizedValue: "true",
        },
        link: {
          defaultValue: link,
          hasLocalizedValue: "true",
        },
        linkType: "URL",
      },
      constantValueEnabled: true,
      selectedType: "textAndLink",
    },
    openInNewTab: false,
    buttonText: {
      defaultValue: label,
      hasLocalizedValue: "true",
    },
    customId: "",
    customClass: "",
    dataAttributes: [],
    ariaLabel: {
      defaultValue: label,
      hasLocalizedValue: "true",
    },
  },
  styles: {
    variant,
    color,
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
});
