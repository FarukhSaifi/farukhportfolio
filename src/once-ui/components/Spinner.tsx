import React, { forwardRef } from "react";

import { Flex } from "./Flex";
import styles from "./Spinner.module.scss";

interface SpinnerProps extends React.ComponentProps<typeof Flex> {
  size?: "xs" | "s" | "m" | "l" | "xl";
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = "m", ariaLabel = "Loading", className, style, ...rest }, ref) => {
    return (
      <Flex
        justifyContent="center"
        alignItems="center"
        style={style}
        className={className}
        {...rest}
      >
        <Flex
          ref={ref}
          justifyContent="center"
          alignItems="center"
          className={styles[size]}
          role="status"
          aria-label={ariaLabel}
        >
          <div className={styles.spinner} />
        </Flex>
      </Flex>
    );
  }
);

Spinner.displayName = "Spinner";

export { Spinner };
