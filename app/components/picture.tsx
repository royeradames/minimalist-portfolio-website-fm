/* Native <picture> keeps the supplied art-directed crops and their 2x versions. */
type PictureProps = {
  folder: "homepage" | "portfolio" | "detail";
  name: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
};

const set = (folder: string, size: string, name: string) => `/images/${folder}/${size}/${name}.jpg 1x, /images/${folder}/${size}/${name}@2x.jpg 2x`;

export function Picture({ folder, name, alt, width, height, className, priority }: PictureProps) {
  return (
    <picture className={className}>
      <source media="(min-width: 72rem)" srcSet={set(folder, "desktop", name)} />
      <source media="(min-width: 48rem)" srcSet={set(folder, "tablet", name)} />
      <img
        src={`/images/${folder}/mobile/${name}.jpg`}
        srcSet={set(folder, "mobile", name)}
        width={width}
        height={height}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
      />
    </picture>
  );
}
