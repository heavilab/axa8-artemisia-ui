import {
  SiGoogleanalytics,
  SiGooglecampaignmanager360,
  SiGoogledisplayandvideo360,
  SiGoogleads,
  SiFacebook,
  SiSnapchat,
  SiAmazon,
  SiTiktok,
  SiPinterest,
  SiApple,
} from "react-icons/si";
import { FaLinkedin, FaGlobe } from "react-icons/fa";
import { BiLogoBing } from "react-icons/bi";

interface IconConfig {
  Icon: React.ComponentType<any>;
  color?: string;
  useThemeColor?: boolean;
}

const DATA_SOURCE_ICONS: Record<string, IconConfig> = {
  googleanalytics: {
    Icon: SiGoogleanalytics,
    color: "#E37400",
  },
  piano: {
    Icon: FaGlobe,
    useThemeColor: true,
  },
  cm360: {
    Icon: SiGooglecampaignmanager360,
    color: "#1E8E3E",
  },
  dv360: {
    Icon: SiGoogledisplayandvideo360,
    color: "#34A853",
  },
  googleads: {
    Icon: SiGoogleads,
    color: "#4285F4",
  },
  bingads: {
    Icon: BiLogoBing,
    useThemeColor: true,
  },
  outbrain: {
    Icon: FaGlobe,
    useThemeColor: true,
  },
  facebookads: {
    Icon: SiFacebook,
    color: "#0866FF",
  },
  linkedin: {
    Icon: FaLinkedin,
    useThemeColor: true,
  },
  searchads: {
    Icon: SiApple,
    useThemeColor: true,
  },
  xandr: {
    Icon: FaGlobe,
    useThemeColor: true,
  },
  snapchat: {
    Icon: SiSnapchat,
    color: "#FFFC00",
  },
  amazon: {
    Icon: SiAmazon,
    color: "#FF9900",
  },
  tiktok: {
    Icon: SiTiktok,
    useThemeColor: true,
  },
  thetradedesk: {
    Icon: FaGlobe,
    useThemeColor: true,
  },
  pinterest: {
    Icon: SiPinterest,
    color: "#BD081C",
  },
  teads: {
    Icon: FaGlobe,
    useThemeColor: true,
  },
};

export function getDataSourceIcon(dataSource: string) {
  const config = DATA_SOURCE_ICONS[dataSource] || DATA_SOURCE_ICONS.piano;

  const iconProps: Record<string, unknown> = {
    className: "w-4 h-4",
    title: dataSource,
  };

  if (config.useThemeColor) {
    iconProps.className = "w-4 h-4 text-foreground";
  } else if (config.color) {
    iconProps.color = config.color;
  }

  return {
    Icon: config.Icon,
    iconProps,
  };
}
