import { useWindowDimensions } from "react-native";

export function useResponsive() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isTablet = width >= 600 && width < 900;
  const maxWidth = isDesktop ? 1100 : isTablet ? 720 : 480;
  return { width, isDesktop, isTablet, maxWidth };
}
