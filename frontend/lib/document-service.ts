/**
 * Service for interacting with the document-service microservice
 */

const DOCUMENT_SERVICE_URL = process.env.NEXT_PUBLIC_DOCUMENT_SERVICE_URL || 'http://localhost:8000';

export interface DocumentSearchResult {
  document_id: string;
  filename: string;
  chunk_id: string;
  chunk_text: string;
  chunk_sequence: number;
  similarity: number;
}

export interface DocumentSearchResponse {
  results: DocumentSearchResult[];
  query: string;
}

export interface DocumentMetadata {
  id: string;
  filename: string;
  file_type: string;
  source: string;
  status: string;
  created_at: string;
  updated_at: string;
  size: number;
  page_count?: number;
  processing_status?: string;
}

/**
 * Upload a document to the document service
 */
export async function uploadDocument(file: File, source: string = 'upload') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('source', source);

  const response = await fetch(`${DOCUMENT_SERVICE_URL}/api/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Document upload failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get document metadata by ID
 */
export async function getDocument(documentId: string): Promise<DocumentMetadata> {
  const response = await fetch(`${DOCUMENT_SERVICE_URL}/api/documents/${documentId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to get document: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get job status by ID
 */
export async function getJobStatus(jobId: string) {
  const response = await fetch(`${DOCUMENT_SERVICE_URL}/api/jobs/${jobId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to get job status: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Search for documents similar to the query
 */
export async function searchDocuments(
  query: string, 
  limit: number = 5, 
  similarityThreshold: number = 0.5
): Promise<DocumentSearchResponse> {
  const response = await fetch(`${DOCUMENT_SERVICE_URL}/api/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      limit,
      similarity_threshold: similarityThreshold,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Document search failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Check if the document service is available
 */
export async function checkDocumentServiceHealth() {
  try {
    const response = await fetch(`${DOCUMENT_SERVICE_URL}/api/health`, { 
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
} 