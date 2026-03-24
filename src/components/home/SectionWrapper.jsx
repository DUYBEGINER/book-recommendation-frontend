import React from "react";

const VARIANT_STYLES = {
  default: "bg-transparent",
  accent:
    "bg-gray-50/50 dark:bg-gray-800/50",
  gradient:
    "bg-transparent",
  dark: "bg-gray-900 dark:bg-gray-950",
};

const SectionWrapper = ({
  children,
  variant = "default",
  className = "",
  fullWidth = true,
  id,
}) => {
  const baseClasses = VARIANT_STYLES[variant] || VARIANT_STYLES.default;

  return (
    <section
      id={id}
      className={`${baseClasses} ${
        fullWidth ? "" : "px-4 sm:px-6 lg:px-8"
      } ${className}`}
    >
      {fullWidth ? (
        children
      ) : (
        <div className="max-w-7xl mx-auto">{children}</div>
      )}
    </section>
  );
};

export default React.memo(SectionWrapper);
