import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";

export interface KaartPunt {
  id: string;
  lat: number;
  lng: number;
  soort: string;
  maand: string;
}

export function luisterNaarKaartpunten(
  bijWijziging: (punten: KaartPunt[]) => void,
  bijFout: () => void
): () => void {
  const puntenQuery = query(
    collection(getDb(), "kaartpunten"),
    orderBy("createdAt", "desc"),
    limit(500)
  );

  return onSnapshot(
    puntenQuery,
    (snapshot) => {
      const punten: KaartPunt[] = snapshot.docs.map((document) => {
        const data = document.data();
        return {
          id: document.id,
          lat: Number(data.lat),
          lng: Number(data.lng),
          soort: String(data.soort ?? "anders"),
          maand: String(data.maand ?? ""),
        };
      });
      bijWijziging(punten);
    },
    () => bijFout()
  );
}
