import { useParams } from "wouter";

export default function ImmobileDettaglio() {
  const params = useParams();
  const slug = params.slug;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Dettaglio Immobile</h1>
      
      {/* TODO: Slug parametro: {slug} */}
      
      {/* TODO: Aggiungere ImageGallery per mostrare le immagini dell'immobile */}
      
      {/* TODO: Aggiungere sezione con informazioni principali (prezzo, mq, stanze, bagni) */}
      
      {/* TODO: Aggiungere descrizione completa */}
      
      {/* TODO: Aggiungere mappa con posizione */}
      
      {/* TODO: Aggiungere form contatto agente */}
      
      {/* TODO: Implementare logica di fetch dati immobile da API usando slug */}
    </div>
  );
}
