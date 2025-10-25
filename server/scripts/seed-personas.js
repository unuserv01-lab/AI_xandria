// server/scripts/seed-personas.js
// Script to populate database with 16 pre-defined personas

const db = require('../config/database');
const personaTemplates = require('../utils/persona-templates');

async function seedPersonas() {
  console.log('🌱 Starting persona seeding...');

  try {
    // Check if personas already exist
    const existingCheck = await db.query('SELECT COUNT(*) FROM personas');
    const existingCount = parseInt(existingCheck.rows[0].count);

    if (existingCount > 0) {
      console.log(`⚠️  Database already has ${existingCount} personas.`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      return new Promise((resolve) => {
        readline.question('Do you want to clear and reseed? (yes/no): ', async (answer) => {
          readline.close();
          
          if (answer.toLowerCase() === 'yes') {
            console.log('🗑️  Clearing existing personas...');
            await db.query('TRUNCATE TABLE personas RESTART IDENTITY CASCADE');
            await insertPersonas();
            resolve();
          } else {
            console.log('❌ Seeding cancelled.');
            resolve();
          }
        });
      });
    } else {
      await insertPersonas();
    }
  } catch (error) {
    console.error('❌ Error seeding personas:', error);
    process.exit(1);
  }
}

async function insertPersonas() {
  console.log(`📝 Inserting ${personaTemplates.length} personas...`);

  for (const persona of personaTemplates) {
    try {
      const result = await db.query(`
        INSERT INTO personas (
          name,
          tagline,
          personality,
          backstory,
          avatar_url,
          price,
          category,
          traits,
          is_featured,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, NULL)
        RETURNING id, name
      `, [
        persona.name,
        persona.tagline,
        persona.personality,
        persona.backstory,
        persona.avatarUrl,
        persona.price,
        persona.category,
        JSON.stringify(persona.traits)
      ]);

      console.log(`   ✅ Created: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
    } catch (error) {
      console.error(`   ❌ Failed to create ${persona.name}:`, error.message);
    }
  }

  console.log('\n✨ Seeding completed!');
  
  // Display summary
  const summary = await db.query(`
    SELECT 
      category,
      COUNT(*) as count,
      AVG(price) as avg_price
    FROM personas
    GROUP BY category
    ORDER BY category
  `);

  console.log('\n📊 Summary by Category:');
  console.log('────────────────────────────────────');
  summary.rows.forEach(row => {
    console.log(`   ${row.category.padEnd(15)} : ${row.count} personas (avg: ${parseFloat(row.avg_price).toFixed(1)} STT)`);
  });
  console.log('────────────────────────────────────\n');

  const total = await db.query('SELECT COUNT(*) FROM personas');
  console.log(`🎉 Total personas in database: ${total.rows[0].count}`);
}

// Run the seeding
seedPersonas()
  .then(() => {
    console.log('✅ Seeding script finished successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Seeding script failed:', error);
    process.exit(1);
  });
