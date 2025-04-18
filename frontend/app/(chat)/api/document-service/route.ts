import { NextRequest, NextResponse } from 'next/server';
import * as DocumentService from '@/lib/document-service';

/**
 * Search documents using the document service
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, limit, similarity_threshold } = body;
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const results = await DocumentService.searchDocuments(
      query,
      limit || 5,
      similarity_threshold || 0.5
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching documents:', error);
    return NextResponse.json(
      { error: 'Failed to search documents' },
      { status: 500 }
    );
  }
}

/**
 * Health check for document service
 */
export async function GET() {
  try {
    const isHealthy = await DocumentService.checkDocumentServiceHealth();
    
    if (isHealthy) {
      return NextResponse.json({ status: 'ok' });
    } else {
      return NextResponse.json(
        { status: 'error', message: 'Document service is not available' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error checking document service health:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to check document service health' },
      { status: 500 }
    );
  }
} 