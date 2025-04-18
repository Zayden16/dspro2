import { tool } from 'ai';
import { z } from 'zod';
import { searchDocuments } from '@/lib/document-service';

export const searchDocumentsTool = tool({
  description: 'Search for documents based on semantic similarity to the query',
  parameters: z.object({
    query: z.string().describe('The search query to find relevant documents'),
    limit: z.number().optional().default(5).describe('Maximum number of results to return'),
    similarityThreshold: z.number().optional().default(0.7).describe('Minimum similarity score (0-1) for results')
  }),
  execute: async ({ query, limit = 5, similarityThreshold = 0.5 }) => {
    try {
      const response = await searchDocuments(query, limit, similarityThreshold);
      
      if (!response.results || response.results.length === 0) {
        return {
          content: `No documents found matching the query: "${query}"`,
          results: []
        };
      }
      
      return {
        content: response.results.map(result => {
          const filename = result.filename || `Document ${result.document_id}`;
          return `
Document: ${filename}
Content: ${result.chunk_text}
Similarity: ${(result.similarity * 100).toFixed(2)}%
---
          `.trim();
        }).join('\n\n'),
        results: response.results
      };
    } catch (error) {
      console.error('Error searching documents:', error);
      throw new Error('Failed to search documents');
    }
  }
}); 