"use client";

import { useState } from "react";
import type { Title } from "@/lib/types";
import HeroBanner from "./HeroBanner";
import TrailerModal from "./TrailerModal";

export default function HomeHero({ titles }: { titles: Title[] }) {
  const [trailer, setTrailer] = useState<Title | null>(null);
  return (
    <>
      <HeroBanner titles={titles} onPlayTrailer={setTrailer} />
      {trailer && <TrailerModal title={trailer} onClose={() => setTrailer(null)} />}
    </>
  );
}
