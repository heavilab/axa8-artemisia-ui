import {
  LucideIcon,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Globe,
} from "lucide-react";

interface IconResult {
  Icon: LucideIcon;
  iconProps: {
    className?: string;
    size?: number;
    style?: React.CSSProperties;
  };
}

export function getDataSourceIcon(dataSource: string): IconResult {
  const iconMap: Record<string, { Icon: LucideIcon; color: string }> = {
    facebook: { Icon: Facebook, color: "#1877F2" },
    instagram: { Icon: Instagram, color: "#E4405F" },
    twitter: { Icon: Twitter, color: "#1DA1F2" },
    youtube: { Icon: Youtube, color: "#FF0000" },
    linkedin: { Icon: Linkedin, color: "#0A66C2" },
  };

  const normalizedDataSource = dataSource.toLowerCase();
  const iconData = iconMap[normalizedDataSource];

  if (iconData) {
    return {
      Icon: iconData.Icon,
      iconProps: {
        className: "w-4 h-4",
        style: { color: iconData.color },
      },
    };
  }

  // Default icon for unknown data sources
  return {
    Icon: Globe,
    iconProps: {
      className: "w-4 h-4 text-muted-foreground",
    },
  };
}
