import React from "react";
import { blackIcon, hoveredBlue, primary45 } from "../utils/colors";
import useHover from "../hooks/useHover";

export function BigButton({
  title,
  icon,
  onClick,
  inverted,
  fullWidth,
  customFillColor,
  customWhiteColor,
  style,
  noHover,
  id,
  small,
  disabled,
  marginRight,
}) {
  const [hoverRef, isHovered] = useHover();

  let fillColor = customFillColor || primary45;
  const whiteColor = customWhiteColor || blackIcon;

  let initialBg = null;
  let hoverBg = hoveredBlue;

  let initialColor = blackIcon;
  let hoverColor = whiteColor;

  if (inverted) {
    initialBg = fillColor;
    hoverBg = null;
    initialColor = whiteColor;
    hoverColor = fillColor;
  }

  if (disabled) {
    initialBg = "#ddd";
    hoverBg = "#ddd";
    fillColor = "#ddd";
  }

  const styles = {
    container: {
      display: "inline-flex",
      gap: 4,
      alignItems: "center",
      justifyContent: "center",
      width: fullWidth ? "100%" : null,
      backgroundColor: isHovered && !noHover ? hoverBg : initialBg,
      color:
        isHovered && !noHover && !disabled
          ? hoverColor
          : disabled
          ? "#999"
          : initialColor,
      borderRadius: 4,
      padding: small ? "2px 4px" : "6px 8px",
      fontSize: small ? 14 : null,
      border: `1px solid ${fillColor}`,
      cursor: !disabled ? "pointer" : null,
      userSelect: "none",
      boxSizing: "border-box",
      marginRight,
    },
  };

  return (
    <div
      id={id}
      ref={hoverRef}
      style={{ ...styles.container, ...style }}
      onClick={() => {
        if (!disabled) {
          onClick();
        }
      }}
    >
      {icon && <img src={icon} alt="icon" />}
      {title}
    </div>
  );
}
