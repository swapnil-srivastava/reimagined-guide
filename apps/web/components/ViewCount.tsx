import { useIntl } from "react-intl";

/**
 * "1.2K views", formatted for the reader's language. Renders nothing for
 * posts without views yet, so new posts don't advertise "0 views".
 */
export default function ViewCount({
  count,
  className = "",
}: {
  count: number | null | undefined;
  className?: string;
}) {
  const intl = useIntl();
  if (!count || count < 1) return null;

  const compact = intl.formatNumber(count, {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  return (
    <span className={`tabular-nums ${className}`}>
      {intl.formatMessage(
        {
          id: "view-count",
          description: "Number of times an article was read, e.g. 1.2K views",
          defaultMessage: "{views} {count, plural, one {view} other {views}}",
        },
        { views: compact, count }
      )}
    </span>
  );
}
