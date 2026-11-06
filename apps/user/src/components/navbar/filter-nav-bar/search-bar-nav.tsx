import type { Pages } from "@/constants/constants";
import { cn } from "@/lib/utils";

const Search_bar_filter = ({
  containerClassName,
  filter_bar,
  mobile,
}: {
  containerClassName?: string;
  filter_bar: Pages;
  mobile?: boolean;
}) => {
  const type = filter_bar.type;
  return (
    <div
      className={cn(
        "w-fit mx-auto bg-white dark:bg-zinc-900 backdrop-blur-md rounded-full shadow-sm border border-gray-200/80 dark:border-zinc-800 p-0.5 sm:p-1 inline-flex items-center",
        mobile ? "mt-2" : "",
        containerClassName,
      )}
    >
      {filter_bar.filter_bar}
    </div>
  );
};

export default Search_bar_filter;
