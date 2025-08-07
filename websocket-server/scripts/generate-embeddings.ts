import dotenv from 'dotenv';
import { RAGService } from '../src/services/ragService';

// Load environment variables
dotenv.config();

async function generateEmbeddings() {
  console.log('Starting embedding generation for document templates...');

  try {
    const ragService = new RAGService();
    
    // Get all templates
    console.log('Fetching all document templates...');
    const templates = await ragService.getAllTemplates();
    console.log(`Found ${templates.length} templates to process`);

    if (templates.length === 0) {
      console.log('No templates found. Please add some templates first.');
      return;
    }

    // Process each template
    for (const template of templates) {
      console.log(`\nProcessing template: ${template.name}`);
      
      try {
        // Create content for embedding (combine name, description, and questions)
        const content = [
          template.name,
          template.description || '',
          ...template.questions.map(q => q.text)
        ].join(' ').trim();

        console.log(`Content length: ${content.length} characters`);

        // Generate embedding
        console.log('Generating embedding...');
        const embedding = await ragService.generateEmbedding(content);
        console.log(`Embedding generated (${embedding.length} dimensions)`);

        // Store embedding
        console.log('Storing embedding in database...');
        await ragService.storeTemplateEmbedding(template.id, content, embedding);
        console.log(`Embedding stored for template: ${template.name}`);

      } catch (error) {
        console.error(`Failed to process template ${template.name}:`, error);
        // Continue with next template
      }
    }

    console.log('\nEmbedding generation completed successfully!');
    console.log(`Processed ${templates.length} templates`);

  } catch (error) {
    console.error('Embedding generation failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateEmbeddings()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { generateEmbeddings }; 