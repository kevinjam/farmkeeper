'use client';

import {
  Bug,
  Droplets,
  FlaskConical,
  HardHat,
  Leaf,
  Scissors,
  Sprout,
  StickyNote,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  planting: Sprout,
  weeding: Leaf,
  fertilizing: FlaskConical,
  spraying: Bug,
  pruning: Scissors,
  irrigation: Droplets,
  labour: HardHat,
  other: StickyNote,
};

export default function CropActivityTypeIcon({
  type,
  className = 'h-5 w-5',
}: {
  type: string;
  className?: string;
}) {
  const Icon = ICONS[type] || StickyNote;
  return <Icon className={className} strokeWidth={2} />;
}
