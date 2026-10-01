import Image from "next/image";

/** A graded, full-bleed photo for an already-sized, `relative` parent. */
export function Photo({
  src,
  alt,
  sizes,
  priority,
  position = "50% 50%",
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  position?: string;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`graded object-cover ${className}`}
      style={{ objectPosition: position }}
      draggable={false}
    />
  );
}
