import { Skeleton } from "./ui/skeleton";

export default function DisplayProperty({
  property,
  value,
}: {
  property: string | undefined;
  value: string | undefined;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-[#5a8dde] flex">
        {property ?? <Skeleton className="h-6 w-28" />}:
      </span>
      <b>{value ?? <Skeleton className="h-6 w-52" />}</b>
    </div>
  );
}
