import { neon } from '@neondatabase/serverless';

async function updatePianoInProduction() {
  // Usa la stessa connection string che hai su Render
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL non configurata!');
    console.log('Devi aggiungere la variabile DATABASE_URL con la stringa di connessione del tuo database Neon.');
    process.exit(1);
  }

  console.log('🔌 Connessione al database Neon...');
  const sql = neon(databaseUrl);
  
  try {
    // Mostra i dati PRIMA dell'aggiornamento
    console.log('\n📊 Dati PRIMA dell\'aggiornamento:');
    const beforeUpdate = await sql`SELECT id, titolo, piano FROM properties ORDER BY titolo`;
    console.table(beforeUpdate);
    
    // Aggiorna i valori "0" in "Piano terra"
    console.log('\n🔄 Aggiornamento in corso...');
    const result = await sql`
      UPDATE properties 
      SET piano = 'Piano terra' 
      WHERE piano = '0'
    `;
    
    console.log(`✅ Aggiornati ${result.length} immobili`);
    
    // Mostra i dati DOPO l'aggiornamento
    console.log('\n📊 Dati DOPO l\'aggiornamento:');
    const afterUpdate = await sql`SELECT id, titolo, piano FROM properties ORDER BY titolo`;
    console.table(afterUpdate);
    
    console.log('\n✅ Aggiornamento completato con successo!');
  } catch (error) {
    console.error('❌ Errore durante l\'aggiornamento:', error);
    process.exit(1);
  }
}

updatePianoInProduction();
